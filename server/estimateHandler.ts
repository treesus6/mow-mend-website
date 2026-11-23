import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_PHOTOS_PER_REQUEST,
  MAX_RAW_PHOTO_BYTES,
  validateEstimateInput,
} from '../src/lib/validation.ts';
import type { NotificationStatus } from '../src/types/estimate.ts';

interface RateLimitBucket {
  timestamps: number[];
}

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_MAX_REQUESTS = 5;
const rateBuckets = new Map<string, RateLimitBucket>();

export function resetRateLimiterForTests(): void {
  rateBuckets.clear();
}

export function checkRateLimit(clientKey: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
  const bucket = rateBuckets.get(clientKey) ?? { timestamps: [] };
  const cutoff = now - RATE_WINDOW_MS;
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff);

  if (bucket.timestamps.length >= RATE_MAX_REQUESTS) {
    const oldest = bucket.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - now) / 1000));
    rateBuckets.set(clientKey, bucket);
    return { allowed: false, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  rateBuckets.set(clientKey, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function generateRequestId(now = new Date()): string {
  const year = String(now.getFullYear());
  const randomDigits = String(crypto.randomInt(0, 10000)).padStart(4, '0');
  return `MM-${year}-${randomDigits}`;
}

export function hasValidImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 12) return false;
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  if (mimeType === 'image/webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
}

export async function sendOwnerLeadNotification(params: {
  requestId: string;
  sanitized: ReturnType<typeof validateEstimateInput>['sanitized'];
  photoCount: number;
}): Promise<NotificationStatus> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const toEmail = (process.env.OWNER_NOTIFICATION_EMAIL || 'treevanderveer@gmail.com').trim();

  if (!resendKey || !fromEmail) {
    return 'unconfigured';
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `New Estimate Request ${params.requestId}: ${params.sanitized.services[0] || params.sanitized.serviceType} (${params.sanitized.city})`,
        text: [
          `New estimate request received for MOW & MEND LLC`,
          `Request ID: ${params.requestId}`,
          `Customer: ${params.sanitized.customerName}`,
          `Phone: ${params.sanitized.phone}`,
          `Email: ${params.sanitized.email}`,
          `Preferred Contact: ${params.sanitized.preferredContact}`,
          `Services (${params.sanitized.services.length}): ${params.sanitized.services.join(', ')}`,
          `City / ZIP: ${params.sanitized.city}, WA ${params.sanitized.zipCode}`,
          `Debris Hauling: ${params.sanitized.debrisHauling}`,
          `Preferred Date: ${params.sanitized.preferredDate || 'Not specified'}`,
          `Preferred Timeframe: ${params.sanitized.preferredTimeframe}`,
          `Attached Photos: ${params.photoCount}`,
          ``,
          `Work Description:`,
          params.sanitized.description,
          ``,
          `Sign in to the Owner Dashboard (/admin) to view the private street address and project photos.`,
        ].join('\n'),
      }),
    });

    if (!response.ok) {
      console.error('Resend notification failed with status:', response.status);
      return 'failed';
    }
    return 'sent';
  } catch (err) {
    console.error('Resend notification threw error:', err);
    return 'failed';
  }
}

export async function handleEstimateValidationRequest(req: Request, res: Response): Promise<void> {
  try {
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : req.ip) || 'unknown';

    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      res.status(429).json({
        ok: false,
        error: `Too many estimate requests from your connection. Please try again in ${rate.retryAfterSeconds} seconds or call/text (360) 889-8046 directly.`,
        fieldErrors: {},
      });
      return;
    }

    const body = req.body ?? {};
    const formStartedAt = body.formStartedAt ? Number(body.formStartedAt) : undefined;
    const consentAccepted =
      body.consentAccepted === true || body.consentAccepted === 'true' || body.consentAccepted === 'on';

    const validation = validateEstimateInput(
      {
        customerName: body.customerName,
        phone: body.phone,
        email: body.email,
        preferredContact: body.preferredContact,
        services: body.services,
        serviceType: body.serviceType,
        streetAddress: body.streetAddress,
        city: body.city,
        zipCode: body.zipCode,
        description: body.description,
        debrisHauling: body.debrisHauling,
        preferredDate: body.preferredDate,
        preferredTimeframe: body.preferredTimeframe,
        additionalDetails: body.additionalDetails,
        consentAccepted,
        honeypot: body.website ?? body.honeypot ?? '',
        formStartedAt,
      },
      { checkTiming: true }
    );

    if (!validation.valid) {
      res.status(400).json({
        ok: false,
        error: validation.errors._form || 'Please check the highlighted fields and try again.',
        fieldErrors: validation.errors,
      });
      return;
    }

    const files = (Array.isArray(req.files) ? req.files : []) as Express.Multer.File[];
    if (files.length > MAX_PHOTOS_PER_REQUEST) {
      res.status(400).json({
        ok: false,
        error: `You can upload at most ${MAX_PHOTOS_PER_REQUEST} project photos.`,
        fieldErrors: {},
      });
      return;
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
        res.status(400).json({
          ok: false,
          error: `Unsupported image type for "${file.originalname}". Please upload JPEG, PNG, or WebP photos.`,
          fieldErrors: {},
        });
        return;
      }
      if (file.size > MAX_RAW_PHOTO_BYTES) {
        res.status(400).json({
          ok: false,
          error: `Photo "${file.originalname}" exceeds the 5 MB size limit.`,
          fieldErrors: {},
        });
        return;
      }
      if (!hasValidImageMagicBytes(file.buffer, file.mimetype)) {
        res.status(400).json({
          ok: false,
          error: `Photo "${file.originalname}" failed image signature verification.`,
          fieldErrors: {},
        });
        return;
      }
    }

    const requestId = generateRequestId();
    const notificationStatus = await sendOwnerLeadNotification({
      requestId,
      sanitized: validation.sanitized,
      photoCount: files.length,
    });

    res.status(200).json({
      ok: true,
      requestId,
      sanitizedLead: validation.sanitized,
      verifiedPhotoCount: files.length,
      notificationStatus,
    });
  } catch (err) {
    console.error('Estimate validation handler error:', err);
    if (!res.headersSent) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Unexpected server error while validating your estimate request.';
      res.status(500).json({
        ok: false,
        error: message,
        fieldErrors: {},
      });
    }
  }
}
