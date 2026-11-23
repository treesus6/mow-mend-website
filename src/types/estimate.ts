export type PreferredContactMethod = 'call' | 'text' | 'email';
export type DebrisHaulingOption = 'yes' | 'no' | 'unsure';
export type NotificationStatus = 'sent' | 'unconfigured' | 'failed';

export const LEAD_STATUSES = [
  'New',
  'Estimate Sent',
  'Booked',
  'In Progress',
  'Completed',
  'Paid',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Maps any legacy status labels saved before Phase 3 into the 6-stage pipeline. */
export function normalizeLeadStatus(status: string | undefined): LeadStatus {
  switch (status) {
    case 'New':
    case 'Contacted':
    case 'Estimate Scheduled':
      return 'New';
    case 'Estimate Sent':
    case 'Quoted':
      return 'Estimate Sent';
    case 'Booked':
    case 'Approved':
    case 'Scheduled':
      return 'Booked';
    case 'In Progress':
      return 'In Progress';
    case 'Completed':
      return 'Completed';
    case 'Paid':
      return 'Paid';
    default:
      return 'New';
  }
}

export interface EstimatePhotoRecord {
  photoId: string;
  requestId: string;
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  dataUrl: string;
  sizeBytes: number;
  createdAt?: unknown;
}

export interface EstimateRequestRecord {
  requestId: string;
  customerName: string;
  phone: string;
  email: string;
  preferredContact: PreferredContactMethod;
  serviceType: string;
  services?: string[];
  streetAddress: string;
  city: string;
  zipCode: string;
  description: string;
  debrisHauling: DebrisHaulingOption;
  preferredDate: string;
  preferredTimeframe: string;
  additionalDetails: string;
  photoCount: number;
  status: LeadStatus | string;
  notificationStatus: NotificationStatus;
  internalNotes?: string;
  estimateAmount?: string;
  followUpDate?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledSlotKey?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EstimateValidationInput {
  customerName: string;
  phone: string;
  email: string;
  preferredContact: string;
  serviceType?: string;
  services?: string[];
  streetAddress: string;
  city: string;
  zipCode: string;
  description: string;
  debrisHauling: string;
  preferredDate: string;
  preferredTimeframe: string;
  additionalDetails: string;
  consentAccepted: boolean;
  honeypot?: string;
  formStartedAt?: number;
}

export interface ServiceOverrideRecord {
  serviceId: string;
  title: string;
  shortTitle: string;
  oneLiner: string;
  updatedAt?: unknown;
}

export interface PricingOverrideRecord {
  pricingKey: string;
  label: string;
  startingDisplay: string;
  notes: string;
  updatedAt?: unknown;
}

export type QuoteLineCategory = 'Labor' | 'Materials' | 'Disposal' | 'Haul-Away';

export interface QuoteLineItem {
  id: string;
  description: string;
  category: QuoteLineCategory;
  quantity: number;
  unitPriceCents: number;
  amountCents: number;
}

export type QuoteDocumentKind = 'estimate' | 'invoice';
export type QuoteDocumentStatus = 'draft' | 'sent' | 'approved' | 'invoiced' | 'paid';

export interface QuoteDocumentRecord {
  docId: string;
  requestId: string;
  docNumber: string;
  kind: QuoteDocumentKind;
  status: QuoteDocumentStatus;
  lineItems: QuoteLineItem[];
  laborCents: number;
  materialsCents: number;
  disposalCents: number;
  haulAwayCents: number;
  subtotalCents: number;
  taxRatePercent: number;
  taxCents: number;
  totalCents: number;
  depositRequiredCents: number;
  balanceDueOnCompletionCents: number;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type PaymentMethod = 'Cash' | 'Check' | 'Card' | 'Zelle' | 'Venmo' | 'ACH' | 'Other';
export type PaymentType = 'deposit' | 'balance';

export interface JobPaymentRecord {
  paymentId: string;
  requestId: string;
  amountCents: number;
  date: string;
  method: PaymentMethod;
  paymentType: PaymentType;
  note: string;
  createdAt?: unknown;
}

export interface JobExpenseRecord {
  expenseId: string;
  requestId: string;
  description: string;
  amountCents: number;
  date: string;
  createdAt?: unknown;
}

export type ContactChannel = 'Call' | 'Text' | 'Email' | 'In Person';

export interface LeadContactRecord {
  contactId: string;
  requestId: string;
  date: string;
  channel: ContactChannel;
  note: string;
  createdAt?: unknown;
}

export interface BookedSlotRecord {
  slotKey: string;
  requestId: string;
  customerName: string;
  city: string;
  scheduledDate: string;
  scheduledTime: string;
  updatedAt?: unknown;
}

// Legacy / Calendar Readiness interfaces kept for compatibility
export interface CalendarAvailabilitySlot {
  startIso: string;
  endIso: string;
  label: string;
}

export interface CalendarAppointmentDraft {
  requestId: string;
  customerName: string;
  summary: string;
  locationCity: string;
  requestedDate: string;
  requestedTimeframe: string;
  confirmed: false;
}

export interface CalendarIntegrationStatus {
  connected: boolean;
  provider: 'google_calendar';
  note: string;
}
