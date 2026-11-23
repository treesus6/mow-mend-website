import type {
  BookedSlotRecord,
  QuoteLineItem,
} from '../types/estimate.ts';

export const DEFAULT_WA_SALES_TAX_PERCENT = 8.7;

export function formatCents(cents: number): string {
  const value = Number.isFinite(cents) ? cents / 100 : 0;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function dollarsToCents(dollarsInput: string | number): number {
  const num = typeof dollarsInput === 'number' ? dollarsInput : Number(String(dollarsInput).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100);
}

export function parseStartingPriceCents(startingDisplay: string): number {
  const match = startingDisplay.match(/\$([0-9][0-9,]*(?:\.[0-9]{1,2})?)/);
  if (!match) return 6000;
  const parsed = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) return 6000;
  return Math.round(parsed * 100);
}

export function computeQuoteTotals(
  lineItems: QuoteLineItem[],
  taxRatePercent: number
): {
  laborCents: number;
  materialsCents: number;
  disposalCents: number;
  haulAwayCents: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  depositRequiredCents: number;
  balanceDueOnCompletionCents: number;
} {
  let laborCents = 0;
  let materialsCents = 0;
  let disposalCents = 0;
  let haulAwayCents = 0;

  for (const item of lineItems) {
    const amount = Math.max(0, Math.round(item.amountCents || 0));
    if (item.category === 'Labor') laborCents += amount;
    else if (item.category === 'Materials') materialsCents += amount;
    else if (item.category === 'Disposal') disposalCents += amount;
    else if (item.category === 'Haul-Away') haulAwayCents += amount;
  }

  const subtotalCents = laborCents + materialsCents + disposalCents + haulAwayCents;
  const cleanRate = Math.max(0, Math.min(25, Number(taxRatePercent) || 0));
  const taxCents = Math.round(subtotalCents * (cleanRate / 100));
  const totalCents = subtotalCents + taxCents;
  const depositRequiredCents =
    totalCents === 0 ? 0 : Math.min(totalCents, Math.max(5000, Math.round(totalCents * 0.5)));
  const balanceDueOnCompletionCents = Math.max(0, totalCents - depositRequiredCents);

  return {
    laborCents,
    materialsCents,
    disposalCents,
    haulAwayCents,
    subtotalCents,
    taxCents,
    totalCents,
    depositRequiredCents,
    balanceDueOnCompletionCents,
  };
}

export function normalizeSlotKey(scheduledDate: string, scheduledTime: string): string {
  const cleanDate = scheduledDate.replace(/[^0-9]/g, '');
  const cleanTime = scheduledTime.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${cleanDate}_${cleanTime}`.slice(0, 80);
}

export function findScheduleSlotConflict(
  bookedSlots: BookedSlotRecord[],
  requestId: string,
  scheduledDate: string,
  scheduledTime: string
): BookedSlotRecord | null {
  if (!scheduledDate.trim() || !scheduledTime.trim()) return null;
  const targetKey = normalizeSlotKey(scheduledDate, scheduledTime);
  const conflict = bookedSlots.find(
    (slot) => slot.slotKey === targetKey && slot.requestId !== requestId
  );
  return conflict ?? null;
}
