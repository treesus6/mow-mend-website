import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Lock,
  MessageSquare,
  Phone,
  Trash2,
} from 'lucide-react';
import { BUSINESS_INFO, CLARK_COUNTY_ZIPS } from '../config/business.ts';
import { PRICING_CONFIG } from '../config/pricing.ts';
import { useCatalog } from '../context/CatalogContext.tsx';
import { compressProjectPhoto } from '../lib/imageCompression.ts';
import { saveEstimateLeadToFirestore, type CompressedPhotoPayload } from '../lib/firebase.ts';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_PHOTOS_PER_REQUEST,
  validateEstimateInput,
} from '../lib/validation.ts';
import type { NotificationStatus } from '../types/estimate.ts';

interface SelectedPhotoItem {
  id: string;
  file: File;
  compressed: CompressedPhotoPayload;
}

interface EstimateFormProps {
  initialService?: string;
  onNavigate?: (path: string) => void;
}

export interface EstimateConfirmationState {
  requestId: string;
  customerName: string;
  services: string[];
  serviceType: string;
  city: string;
  preferredContact: string;
  preferredTimeframe: string;
  preferredDate: string;
  photoCount: number;
  notificationStatus: NotificationStatus;
}

export function EstimateConfirmation({
  confirmation,
  onReset,
  onNavigate,
}: {
  confirmation: EstimateConfirmationState;
  onReset: () => void;
  onNavigate?: (path: string) => void;
}) {
  return (
    <div className="min-w-0 bg-white border border-[#D6D1C4] rounded-xl p-5 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#ECE8DC]">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-[#141715] text-[#F59E0B] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold">
              Estimate Request Saved
            </p>
            <h2 className="font-display text-2xl font-extrabold uppercase text-[#141715] mt-1">
              Thanks, {confirmation.customerName}. Your request is in our queue.
            </h2>
          </div>
        </div>

        <div className="w-28 h-20 rounded-lg bg-[#F5F2EA] border border-[#D6D1C4] p-1.5 flex items-center justify-center shrink-0">
          <img
            src="/images/smokiey-mascot.png"
            alt="Smokiey the Mower mascot for MOW & MEND LLC"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="bg-[#F5F2EA] border border-[#D6D1C4] rounded-lg p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-[#525753]">Request Reference Number</p>
          <p className="font-mono font-bold text-base text-[#141715] tabular-nums mt-0.5">
            {confirmation.requestId}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[#525753]">
            Requested Services ({confirmation.services.length})
          </p>
          <ul className="mt-1 space-y-0.5 font-semibold text-[#141715]">
            {confirmation.services.map((svc) => (
              <li key={svc} className="break-words">
                {svc}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs text-[#525753]">Location &amp; Contact Preference</p>
          <p className="text-[#141715] mt-0.5">
            {confirmation.city}, WA · Follow up via{' '}
            <span className="font-semibold capitalize">{confirmation.preferredContact}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-[#525753]">Requested Timeframe &amp; Photos</p>
          <p className="text-[#141715] mt-0.5">
            {confirmation.preferredDate ? `${confirmation.preferredDate} · ` : ''}
            {confirmation.preferredTimeframe} ({confirmation.photoCount} photo
            {confirmation.photoCount === 1 ? '' : 's'})
          </p>
        </div>
      </div>

      <div className="space-y-2.5 text-sm text-[#3D423E] leading-relaxed">
        <p>
          <strong>What happens next:</strong> {BUSINESS_INFO.legalName} will review your project
          notes and photos and follow up directly with a written estimate breaking out Labor,
          Materials, Disposal, and applicable WA Sales Tax. Submitting this form does not
          guarantee an automated quote price or a confirmed appointment slot yet.
        </p>
        <p className="text-xs text-[#525753]">
          {PRICING_CONFIG.depositPolicy.detail} {PRICING_CONFIG.tripFee.detail}{' '}
          {confirmation.notificationStatus === 'sent'
            ? 'An instant email alert has also been delivered to the owner.'
            : `For urgent or same-day questions, call or text ${BUSINESS_INFO.phoneDisplay} directly.`}
        </p>
      </div>

      <div className="pt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 min-h-[44px] bg-[#141715] text-[#F5F2EA] text-sm font-semibold rounded-lg hover:bg-[#232825] transition-colors cursor-pointer"
        >
          Submit Another Request
        </button>
        <a
          href={`mailto:${BUSINESS_INFO.email}?subject=${encodeURIComponent(
            `Estimate Request ${confirmation.requestId} - ${confirmation.services.join(', ')}`
          )}&body=${encodeURIComponent(
            `Hi Mow & Mend,\n\nI just submitted estimate request ${confirmation.requestId} for ${confirmation.services.join(', ')} in ${confirmation.city}, WA.\nPreferred contact: ${confirmation.preferredContact}\nPreferred timeframe: ${confirmation.preferredDate ? confirmation.preferredDate + ' - ' : ''}${confirmation.preferredTimeframe}\n\nThank you,\n${confirmation.customerName}`
          )}`}
          className="inline-flex items-center px-5 py-2.5 min-h-[44px] border border-[#D6D1C4] text-[#141715] text-sm font-semibold rounded-lg hover:bg-[#EAE5D8] transition-colors"
        >
          Send Copy via Email App
        </a>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="px-5 py-2.5 min-h-[44px] border border-[#D6D1C4] text-[#141715] text-sm font-semibold rounded-lg hover:bg-[#EAE5D8] transition-colors cursor-pointer"
          >
            Return Home
          </button>
        )}
      </div>
    </div>
  );
}

const TIMEFRAME_OPTIONS = [
  'Flexible / Next Available',
  'Morning (8:00 AM – 12:00 PM)',
  'Afternoon (12:00 PM – 4:00 PM)',
  'Weekday Preferred',
  'Weekend If Available',
];

export function EstimateForm({ initialService = '', onNavigate }: EstimateFormProps) {
  const { services: catalogServices } = useCatalog();
  const formStartedAtRef = useRef<number>(Date.now());
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContact, setPreferredContact] = useState<'call' | 'text' | 'email'>('text');
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    if (!initialService) return [];
    const matched = catalogServices.find(
      (s) => s.title.toLowerCase() === initialService.toLowerCase()
    );
    return matched ? [matched.title] : [initialService];
  });
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Vancouver');
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [debrisHauling, setDebrisHauling] = useState<'yes' | 'no' | 'unsure'>('unsure');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeframe, setPreferredTimeframe] = useState('Flexible / Next Available');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [photos, setPhotos] = useState<SelectedPhotoItem[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [processingPhotos, setProcessingPhotos] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<EstimateConfirmationState | null>(null);

  useEffect(() => {
    if (!initialService) return;
    const matched = catalogServices.find(
      (s) => s.title.toLowerCase() === initialService.toLowerCase()
    );
    const label = matched ? matched.title : initialService;
    setSelectedServices((prev) => (prev.includes(label) ? prev : [...prev, label]));
  }, [initialService, catalogServices]);

  const toggleService = (serviceTitle: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceTitle)
        ? prev.filter((item) => item !== serviceTitle)
        : [...prev, serviceTitle]
    );
  };

  const todayIso = new Date().toISOString().split('T')[0];
  const zipClean = zipCode.trim().slice(0, 5);
  const outsideClarkCountyZip = zipClean.length === 5 && !CLARK_COUNTY_ZIPS.has(zipClean);

  const handlePhotoSelection = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setPhotoError('');

    const remainingSlots = MAX_PHOTOS_PER_REQUEST - photos.length;
    if (remainingSlots <= 0) {
      setPhotoError(`Maximum ${MAX_PHOTOS_PER_REQUEST} project photos allowed per estimate request.`);
      return;
    }

    const incomingFiles = Array.from(fileList).slice(0, remainingSlots);
    if (fileList.length > remainingSlots) {
      setPhotoError(
        `Only ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'} could be added (limit ${MAX_PHOTOS_PER_REQUEST}).`
      );
    }

    setProcessingPhotos(true);
    try {
      const processed: SelectedPhotoItem[] = [];
      for (let i = 0; i < incomingFiles.length; i++) {
        const file = incomingFiles[i];
        const compressed = await compressProjectPhoto(file, photos.length + i);
        processed.push({
          id: compressed.photoId,
          file,
          compressed,
        });
      }
      setPhotos((prev) => [...prev, ...processed]);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not process one of the selected photos.');
    } finally {
      setProcessingPhotos(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setPhotoError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const clientCheck = validateEstimateInput({
      customerName,
      phone,
      email,
      preferredContact,
      services: selectedServices,
      serviceType: selectedServices.join(', '),
      streetAddress,
      city,
      zipCode,
      description,
      debrisHauling,
      preferredDate,
      preferredTimeframe,
      additionalDetails,
      consentAccepted,
      honeypot,
    });

    if (!clientCheck.valid) {
      setFieldErrors(clientCheck.errors);
      setSubmitError(clientCheck.errors._form || 'Please review the highlighted fields below.');
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('customerName', clientCheck.sanitized.customerName);
      formData.append('phone', clientCheck.sanitized.phone);
      formData.append('email', clientCheck.sanitized.email);
      formData.append('preferredContact', clientCheck.sanitized.preferredContact);
      formData.append('services', JSON.stringify(clientCheck.sanitized.services));
      formData.append('serviceType', clientCheck.sanitized.serviceType);
      formData.append('streetAddress', clientCheck.sanitized.streetAddress);
      formData.append('city', clientCheck.sanitized.city);
      formData.append('zipCode', clientCheck.sanitized.zipCode);
      formData.append('description', clientCheck.sanitized.description);
      formData.append('debrisHauling', clientCheck.sanitized.debrisHauling);
      formData.append('preferredDate', clientCheck.sanitized.preferredDate);
      formData.append('preferredTimeframe', clientCheck.sanitized.preferredTimeframe);
      formData.append('additionalDetails', clientCheck.sanitized.additionalDetails);
      formData.append('consentAccepted', String(consentAccepted));
      formData.append('website', honeypot);
      formData.append('formStartedAt', String(formStartedAtRef.current));

      for (const item of photos) {
        if (ALLOWED_IMAGE_MIME_TYPES.has(item.file.type)) {
          formData.append('photos', item.file, item.compressed.fileName);
        } else {
          const base64 = item.compressed.dataUrl.split(',')[1] || '';
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const jpegBlob = new Blob([bytes], { type: 'image/jpeg' });
          formData.append('photos', jpegBlob, item.compressed.fileName);
        }
      }

      const apiResponse = await fetch('/api/estimates', {
        method: 'POST',
        body: formData,
      });

      const rawText = await apiResponse.text();
      let apiData: {
        ok?: boolean;
        requestId?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
        sanitizedLead?: {
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
        notificationStatus?: NotificationStatus;
      } | null = null;

      try {
        apiData = rawText ? JSON.parse(rawText) : null;
      } catch {
        apiData = null;
      }

      if (!apiResponse.ok || !apiData?.ok || !apiData?.requestId || !apiData?.sanitizedLead) {
        if (apiData?.fieldErrors && Object.keys(apiData.fieldErrors).length > 0) {
          setFieldErrors(apiData.fieldErrors);
        }
        if (apiData?.error) {
          const fieldSummary = apiData.fieldErrors
            ? Object.entries(apiData.fieldErrors)
                .filter(([key]) => key !== '_form')
                .map(([key, val]) => `${key}: ${val}`)
                .join(' | ')
            : '';
          throw new Error(
            fieldSummary && !apiData.error.includes(fieldSummary)
              ? `${apiData.error} (${fieldSummary})`
              : apiData.error
          );
        }

        const contentType = apiResponse.headers.get('content-type') || 'unknown';
        let responsePath = '/api/estimates';
        try {
          if (apiResponse.url) responsePath = new URL(apiResponse.url).pathname;
        } catch {
          responsePath = '/api/estimates';
        }
        const snippet = rawText
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 180);

        throw new Error(
          `Server returned HTTP ${apiResponse.status} (${contentType}) at ${responsePath}${
            snippet ? `: ${snippet}` : ' with an empty or non-JSON response.'
          }`
        );
      }

      await saveEstimateLeadToFirestore({
        requestId: apiData.requestId,
        lead: apiData.sanitizedLead,
        notificationStatus: apiData.notificationStatus || 'unconfigured',
        photos: photos.map((p) => p.compressed),
      });

      setConfirmation({
        requestId: apiData.requestId,
        customerName: apiData.sanitizedLead.customerName,
        services: apiData.sanitizedLead.services || selectedServices,
        serviceType: apiData.sanitizedLead.serviceType,
        city: apiData.sanitizedLead.city,
        preferredContact: apiData.sanitizedLead.preferredContact,
        preferredTimeframe: apiData.sanitizedLead.preferredTimeframe,
        preferredDate: apiData.sanitizedLead.preferredDate,
        photoCount: photos.length,
        notificationStatus: apiData.notificationStatus || 'unconfigured',
      });
    } catch (err) {
      let msg =
        err instanceof Error
          ? err.message
          : 'Could not save your estimate request. Please try again or call/text (360) 889-8046.';
      if (msg.startsWith('{') && msg.includes('"operationType"')) {
        try {
          const parsed = JSON.parse(msg) as { error?: string; path?: string };
          if (parsed.error) {
            msg = `Database save error (${parsed.path || 'estimateRequests'}): ${parsed.error}`;
          }
        } catch {
          // Keep original message if not JSON
        }
      }
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <EstimateConfirmation
        confirmation={confirmation}
        onNavigate={onNavigate}
        onReset={() => {
          setConfirmation(null);
          setDescription('');
          setAdditionalDetails('');
          setPhotos([]);
          setConsentAccepted(false);
          formStartedAtRef.current = Date.now();
        }}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="min-w-0 w-full bg-white border border-[#D6D1C4] rounded-xl p-5 sm:p-8 space-y-7"
    >
      {/* Honeypot trap for bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-field">Company Website</label>
        <input
          id="website-field"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {submitError && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 text-[#991B1B] text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to submit estimate request</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Section 1: Contact Information */}
      <fieldset className="min-w-0 space-y-4">
        <legend className="font-display font-bold uppercase text-lg text-[#141715] pb-2 border-b border-[#ECE8DC] w-full">
          01. Your Contact Details
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label htmlFor="customerName" className="block text-sm font-semibold text-[#141715] mb-1.5">
              Full Name <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              required
              autoComplete="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-sm text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
            />
            {fieldErrors.customerName && (
              <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.customerName}</p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="phone" className="block text-sm font-semibold text-[#141715] mb-1.5">
              Phone Number <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(360) 555-0142"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-sm font-mono text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label htmlFor="email" className="block text-sm font-semibold text-[#141715] mb-1.5">
              Email Address <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-sm text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.email}</p>
            )}
          </div>

          <div className="min-w-0">
            <span className="block text-sm font-semibold text-[#141715] mb-1.5">
              Preferred Contact Method <span className="text-[#B91C1C]">*</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['text', 'call', 'email'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredContact(method)}
                  aria-pressed={preferredContact === method}
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold border transition-colors capitalize cursor-pointer ${
                    preferredContact === method
                      ? 'bg-[#141715] text-[#F5F2EA] border-[#141715]'
                      : 'bg-[#FAF8F4] text-[#3D423E] border-[#CFCBC0] hover:bg-[#EAE5D8]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            {fieldErrors.preferredContact && (
              <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.preferredContact}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Section 2: Property Location (Strictly Private) */}
      <fieldset className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ECE8DC]">
          <legend className="font-display font-bold uppercase text-lg text-[#141715]">
            02. Job Location (Clark County, WA)
          </legend>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#525753]">
            <Lock className="w-3.5 h-3.5 text-[#E86F14]" />
            Kept private — never published
          </span>
        </div>

        <div>
          <label htmlFor="streetAddress" className="block text-sm font-semibold text-[#141715] mb-1.5">
            Job Street Address <span className="text-[#B91C1C]">*</span>
          </label>
          <input
            id="streetAddress"
            name="streetAddress"
            type="text"
            required
            autoComplete="street-address"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="1234 NE Example St"
            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-sm text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
          />
          {fieldErrors.streetAddress && (
            <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.streetAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label htmlFor="city" className="block text-sm font-semibold text-[#141715] mb-1.5">
              City / Community <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              list="clark-county-cities"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Vancouver"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-sm text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
            />
            <datalist id="clark-county-cities">
              {BUSINESS_INFO.serviceAreas.map((area) => (
                <option key={area.slug} value={area.name} />
              ))}
            </datalist>
            {fieldErrors.city && (
              <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.city}</p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="zipCode" className="block text-sm font-semibold text-[#141715] mb-1.5">
              ZIP Code <span className="text-[#B91C1C]">*</span>
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              inputMode="numeric"
              required
              autoComplete="postal-code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="98661"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-sm font-mono text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
            />
            {fieldErrors.zipCode && (
              <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.zipCode}</p>
            )}
            {outsideClarkCountyZip && !fieldErrors.zipCode && (
              <p className="mt-1 text-xs text-[#92400E]">
                Note: We serve Clark County, WA only and do not offer Oregon construction services.
                If your property is near the county edge, feel free to submit and we will confirm.
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Section 3: Project Scope & Multi-Select Services */}
      <fieldset className="min-w-0 space-y-4">
        <legend className="font-display font-bold uppercase text-lg text-[#141715] pb-2 border-b border-[#ECE8DC] w-full">
          03. Project Scope &amp; Preferred Timing
        </legend>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <span className="block text-sm font-semibold text-[#141715]">
              Services Needed (Select one or more) <span className="text-[#B91C1C]">*</span>
            </span>
            <span className="text-xs font-mono text-[#525753] tabular-nums">
              {selectedServices.length} selected
            </span>
          </div>

          <div
            role="group"
            aria-label="Services Needed"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0"
          >
            {catalogServices.map((svc) => {
              const checked = selectedServices.includes(svc.title);
              return (
                <label
                  key={svc.id}
                  className={`min-w-0 min-h-[44px] flex items-start gap-2.5 p-3 rounded-lg border text-sm transition-colors cursor-pointer ${
                    checked
                      ? 'bg-[#FFF7ED] border-[#E86F14] text-[#141715]'
                      : 'bg-[#FAF8F4] border-[#CFCBC0] text-[#232724] hover:bg-[#F5F2EA]'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="services"
                    value={svc.title}
                    checked={checked}
                    onChange={() => toggleService(svc.title)}
                    className="mt-0.5 w-4 h-4 accent-[#E86F14] shrink-0 cursor-pointer"
                  />
                  <span className="min-w-0 flex-1 leading-snug">
                    <span className="block font-semibold break-words">
                      {svc.number}. {svc.title}
                    </span>
                    <span className="block text-[11px] font-mono text-[#525753] mt-0.5 break-words">
                      {svc.categoryLabel} · {svc.priceLabel}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {fieldErrors.serviceType && (
            <p className="mt-1.5 text-xs text-[#B91C1C]">{fieldErrors.serviceType}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-[#141715] mb-1.5">
            Description of Requested Work <span className="text-[#B91C1C]">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what needs mowing, washing, or fixing—e.g., swap kitchen sink faucet, fix loose cabinet hinges, patch drywall, repair sagging fence gate, or mow and edge yard."
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-sm text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.description}</p>
          )}
        </div>

        <div>
          <span className="block text-sm font-semibold text-[#141715] mb-1.5">
            Is Debris Hauling Needed? <span className="text-[#B91C1C]">*</span>
          </span>
          <div className="grid grid-cols-3 gap-2 max-w-md">
            {(
              [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No (Use green bins)' },
                { value: 'unsure', label: 'Not sure' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDebrisHauling(opt.value)}
                aria-pressed={debrisHauling === opt.value}
                className={`min-h-[44px] px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                  debrisHauling === opt.value
                    ? 'bg-[#141715] text-[#F5F2EA] border-[#141715]'
                    : 'bg-[#FAF8F4] text-[#3D423E] border-[#CFCBC0] hover:bg-[#EAE5D8]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {fieldErrors.debrisHauling && (
            <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.debrisHauling}</p>
          )}
        </div>

        <div className="p-4 rounded-lg bg-[#F5F2EA] border border-[#E2DDD0] space-y-3">
          <div className="flex items-start gap-2.5">
            <CalendarClock className="w-4 h-4 text-[#E86F14] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#141715]">
                Preferred Estimate or Service Timeframe
              </p>
              <p className="text-xs text-[#525753]">
                Requests only—not a confirmed appointment. We will contact you directly to confirm a
                date and time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label htmlFor="preferredDate" className="block text-xs font-semibold text-[#3D423E] mb-1">
                Preferred Date (Optional)
              </label>
              <input
                id="preferredDate"
                name="preferredDate"
                type="date"
                min={todayIso}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full max-w-full min-w-0 px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-white text-sm font-mono text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
              />
              {fieldErrors.preferredDate && (
                <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.preferredDate}</p>
              )}
            </div>

            <div className="min-w-0">
              <label
                htmlFor="preferredTimeframe"
                className="block text-xs font-semibold text-[#3D423E] mb-1"
              >
                Preferred Timeframe <span className="text-[#B91C1C]">*</span>
              </label>
              <select
                id="preferredTimeframe"
                name="preferredTimeframe"
                required
                value={preferredTimeframe}
                onChange={(e) => setPreferredTimeframe(e.target.value)}
                className="w-full max-w-full min-w-0 px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-white text-sm text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
              >
                {TIMEFRAME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {fieldErrors.preferredTimeframe && (
                <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.preferredTimeframe}</p>
              )}
            </div>
          </div>
        </div>
      </fieldset>

      {/* Section 4: Private Project Photos */}
      <fieldset className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#ECE8DC]">
          <legend className="font-display font-bold uppercase text-lg text-[#141715]">
            04. Project Photos (Optional, up to {MAX_PHOTOS_PER_REQUEST})
          </legend>
          <span className="text-xs font-mono text-[#525753] tabular-nums">
            {photos.length}/{MAX_PHOTOS_PER_REQUEST} attached
          </span>
        </div>

        <p className="text-xs text-[#525753] leading-relaxed">
          Sending 1–5 clear photos gives you free pricing from photos and helps us estimate faster.
          ({PRICING_CONFIG.tripFee.detail}) Photos are stored privately for estimate review only
          (JPEG, PNG, or WebP, max 5 MB per photo).
        </p>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handlePhotoSelection(e.target.files)}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          multiple
          className="hidden"
          onChange={(e) => handlePhotoSelection(e.target.files)}
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={processingPhotos || photos.length >= MAX_PHOTOS_PER_REQUEST}
            onClick={() => cameraInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-[#141715] bg-[#FAF8F4] text-[#141715] text-sm font-semibold hover:bg-[#EAE5D8] disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#E86F14]" />
            <span>Take Photo</span>
          </button>

          <button
            type="button"
            disabled={processingPhotos || photos.length >= MAX_PHOTOS_PER_REQUEST}
            onClick={() => galleryInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-[#141715] text-sm font-semibold hover:bg-[#EAE5D8] disabled:opacity-50 transition-colors cursor-pointer"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Choose from Gallery</span>
          </button>

          {processingPhotos && (
            <span className="inline-flex items-center gap-2 text-xs text-[#525753] self-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing photos...
            </span>
          )}
        </div>

        {photoError && <p className="text-xs text-[#B91C1C] font-medium">{photoError}</p>}

        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {photos.map((item) => (
              <div
                key={item.id}
                className="relative group border border-[#D6D1C4] rounded-lg overflow-hidden bg-[#F5F2EA]"
              >
                <img
                  src={item.compressed.dataUrl}
                  alt={`Uploaded project preview: ${item.compressed.fileName}`}
                  className="w-full h-24 object-cover"
                />
                <div className="p-1.5 flex items-center justify-between gap-1 text-[11px] text-[#525753]">
                  <span className="truncate">{item.compressed.fileName}</span>
                  <button
                    type="button"
                    onClick={() => removePhoto(item.id)}
                    aria-label={`Remove ${item.compressed.fileName}`}
                    className="p-1 rounded hover:bg-[#FEE2E2] text-[#991B1B] shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      {/* Section 5: Additional Details & Consent */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="additionalDetails"
            className="block text-sm font-semibold text-[#141715] mb-1.5"
          >
            Optional Additional Details
          </label>
          <textarea
            id="additionalDetails"
            name="additionalDetails"
            rows={2}
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder="Gate access notes, pets in yard, landlord/property manager contact info, or HOA guidelines."
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#CFCBC0] bg-[#FAF8F4] text-sm text-[#141715] focus:outline-none focus:ring-2 focus:ring-[#E86F14]"
          />
        </div>

        <div className="p-3.5 rounded-lg bg-[#EAE5D8]/60 border border-[#D6D1C4] text-xs text-[#3D423E] leading-relaxed space-y-1">
          <p>
            <strong className="text-[#141715]">Estimate &amp; Deposit Policy:</strong>{' '}
            {PRICING_CONFIG.lineItemExplanation} {PRICING_CONFIG.depositPolicy.label}.
          </p>
          <p>
            <strong className="text-[#141715]">Trip Fee:</strong> {PRICING_CONFIG.tripFee.detail}
          </p>
        </div>

        <label className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F5F2EA] border border-[#E2DDD0] cursor-pointer">
          <input
            type="checkbox"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#141715] shrink-0"
          />
          <span className="text-xs text-[#3D423E] leading-relaxed">
            I understand that this submits an estimate request for review by{' '}
            <strong>MOW &amp; MEND LLC</strong> (not an automatic quote or confirmed appointment) and
            consent to private storage of my address and project photos for preparing my estimate.{' '}
            <span className="text-[#B91C1C]">*</span>
          </span>
        </label>
        {fieldErrors.consentAccepted && (
          <p className="text-xs text-[#B91C1C]">{fieldErrors.consentAccepted}</p>
        )}
      </div>

      {/* Submit & Immediate Call/Text Fallback */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#ECE8DC]">
        <button
          type="submit"
          disabled={submitting || processingPhotos}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-base rounded-lg hover:bg-[#F37F24] disabled:opacity-60 transition-colors cursor-pointer"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{submitting ? 'Saving Estimate Request...' : 'Submit Estimate Request'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[#525753]">
          <span>Prefer to reach out directly?</span>
          <a
            href={BUSINESS_INFO.phoneHref}
            className="inline-flex items-center gap-1 font-semibold text-[#141715] hover:text-[#B8520A] hover:underline"
          >
            <Phone className="w-3.5 h-3.5 text-[#E86F14]" />
            Call {BUSINESS_INFO.phoneDisplay}
          </a>
          <a
            href={BUSINESS_INFO.smsHref}
            className="inline-flex items-center gap-1 font-semibold text-[#141715] hover:text-[#B8520A] hover:underline"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#E86F14]" />
            Text
          </a>
        </div>
      </div>
    </form>
  );
}
