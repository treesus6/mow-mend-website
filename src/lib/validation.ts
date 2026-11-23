import type { EstimateValidationInput } from '../types/estimate.ts';

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MAX_PHOTOS_PER_REQUEST = 5;
export const MAX_RAW_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB raw upload
export const MAX_STORED_PHOTO_BYTES = 500_000; // <= 500KB compressed for private Firestore storage
export const MAX_SELECTED_SERVICES = 15;

export const FIELD_LIMITS = {
  customerNameMin: 2,
  customerNameMax: 100,
  phoneMinDigits: 10,
  phoneMaxLen: 30,
  emailMaxLen: 150,
  serviceItemMaxLen: 140,
  serviceTypeMaxLen: 1000,
  streetAddressMin: 3,
  streetAddressMax: 200,
  cityMin: 2,
  cityMax: 80,
  zipMin: 5,
  zipMax: 12,
  descriptionMin: 10,
  descriptionMax: 3000,
  additionalDetailsMax: 1500,
  preferredTimeframeMax: 80,
} as const;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized: {
    customerName: string;
    phone: string;
    email: string;
    preferredContact: 'call' | 'text' | 'email';
    services: string[];
    serviceType: string;
    streetAddress: string;
    city: string;
    zipCode: string;
    description: string;
    debrisHauling: 'yes' | 'no' | 'unsure';
    preferredDate: string;
    preferredTimeframe: string;
    additionalDetails: string;
  };
}

function cleanText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

function cleanMultilineText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').trim().slice(0, maxLen);
}

function normalizeSelectedServices(servicesInput: unknown, serviceTypeFallback: unknown): string[] {
  const candidates: string[] = [];

  if (Array.isArray(servicesInput)) {
    for (const item of servicesInput) {
      const cleaned = cleanText(item, FIELD_LIMITS.serviceItemMaxLen);
      if (cleaned.length >= 2) candidates.push(cleaned);
    }
  } else if (typeof servicesInput === 'string' && servicesInput.trim().length > 0) {
    const trimmed = servicesInput.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const cleaned = cleanText(item, FIELD_LIMITS.serviceItemMaxLen);
            if (cleaned.length >= 2) candidates.push(cleaned);
          }
        }
      } catch {
        const cleaned = cleanText(trimmed, FIELD_LIMITS.serviceItemMaxLen);
        if (cleaned.length >= 2) candidates.push(cleaned);
      }
    } else {
      const cleaned = cleanText(trimmed, FIELD_LIMITS.serviceItemMaxLen);
      if (cleaned.length >= 2) candidates.push(cleaned);
    }
  }

  if (candidates.length === 0 && typeof serviceTypeFallback === 'string') {
    const cleaned = cleanText(serviceTypeFallback, FIELD_LIMITS.serviceItemMaxLen);
    if (cleaned.length >= 2) candidates.push(cleaned);
  }

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const item of candidates) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
      if (deduped.length >= MAX_SELECTED_SERVICES) break;
    }
  }
  return deduped;
}

export function validateEstimateInput(
  input: Partial<EstimateValidationInput>,
  options?: { checkTiming?: boolean }
): ValidationResult {
  const errors: Record<string, string> = {};

  const honeypot = typeof input.honeypot === 'string' ? input.honeypot.trim() : '';
  if (honeypot.length > 0) {
    errors._form = 'Automated submission blocked.';
  }

  if (options?.checkTiming && typeof input.formStartedAt === 'number' && Number.isFinite(input.formStartedAt)) {
    const elapsedMs = Date.now() - input.formStartedAt;
    if (elapsedMs >= 0 && elapsedMs < 1200) {
      errors._form = 'Please take a moment to review your request before submitting.';
    }
  }

  const customerName = cleanText(input.customerName, FIELD_LIMITS.customerNameMax);
  if (customerName.length < FIELD_LIMITS.customerNameMin) {
    errors.customerName = 'Please enter your name (at least 2 characters).';
  }

  const phone = cleanText(input.phone, FIELD_LIMITS.phoneMaxLen);
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < FIELD_LIMITS.phoneMinDigits || phoneDigits.length > 15) {
    errors.phone = 'Please enter a valid 10-digit US phone number.';
  }

  const email = cleanText(input.email, FIELD_LIMITS.emailMaxLen).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  const preferredContactRaw = cleanText(input.preferredContact, 20).toLowerCase();
  const preferredContact =
    preferredContactRaw === 'call' || preferredContactRaw === 'text' || preferredContactRaw === 'email'
      ? preferredContactRaw
      : 'text';
  if (preferredContactRaw !== 'call' && preferredContactRaw !== 'text' && preferredContactRaw !== 'email') {
    errors.preferredContact = 'Please choose call, text, or email.';
  }

  const services = normalizeSelectedServices(input.services, input.serviceType);
  const serviceType = services.join(', ').slice(0, FIELD_LIMITS.serviceTypeMaxLen);
  if (services.length === 0 || serviceType.length < 2) {
    errors.serviceType = 'Please select at least one service you need.';
  }

  const streetAddress = cleanText(input.streetAddress, FIELD_LIMITS.streetAddressMax);
  if (streetAddress.length < FIELD_LIMITS.streetAddressMin) {
    errors.streetAddress = 'Please enter the job street address (kept private).';
  }

  const city = cleanText(input.city, FIELD_LIMITS.cityMax);
  if (city.length < FIELD_LIMITS.cityMin) {
    errors.city = 'Please enter your city or neighborhood in Clark County.';
  }

  const zipCode = cleanText(input.zipCode, FIELD_LIMITS.zipMax);
  if (!/^\d{5}(-\d{4})?$/.test(zipCode)) {
    errors.zipCode = 'Please enter a valid 5-digit ZIP code.';
  }

  const description = cleanMultilineText(input.description, FIELD_LIMITS.descriptionMax);
  if (description.length < FIELD_LIMITS.descriptionMin) {
    errors.description = 'Please describe the work you need done (at least 10 characters).';
  }

  const debrisRaw = cleanText(input.debrisHauling, 20).toLowerCase();
  const debrisHauling =
    debrisRaw === 'yes' || debrisRaw === 'no' || debrisRaw === 'unsure' ? debrisRaw : 'unsure';
  if (debrisRaw !== 'yes' && debrisRaw !== 'no' && debrisRaw !== 'unsure') {
    errors.debrisHauling = 'Please indicate whether debris hauling is needed.';
  }

  const preferredDate = cleanText(input.preferredDate, 20);
  if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    errors.preferredDate = 'Please select a valid date (YYYY-MM-DD).';
  }

  const preferredTimeframe = cleanText(input.preferredTimeframe, FIELD_LIMITS.preferredTimeframeMax);
  if (preferredTimeframe.length < 2) {
    errors.preferredTimeframe = 'Please select a preferred timeframe.';
  }

  const additionalDetails = cleanMultilineText(input.additionalDetails, FIELD_LIMITS.additionalDetailsMax);

  if (!input.consentAccepted) {
    errors.consentAccepted = 'Please confirm you understand this is an estimate request and your info is kept private.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      customerName,
      phone,
      email,
      preferredContact,
      services,
      serviceType,
      streetAddress,
      city,
      zipCode,
      description,
      debrisHauling,
      preferredDate,
      preferredTimeframe,
      additionalDetails,
    },
  };
}
