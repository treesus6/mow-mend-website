import { useMemo, useState } from 'react';
import { Check, Copy, FileText, Loader2, Plus, Receipt, Save, Trash2 } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext.tsx';
import { deleteLeadQuoteDocument, saveLeadQuoteDocument } from '../../lib/firebase.ts';
import {
  DEFAULT_WA_SALES_TAX_PERCENT,
  computeQuoteTotals,
  dollarsToCents,
  formatCents,
  parseStartingPriceCents,
} from '../../lib/quoteMath.ts';
import type {
  EstimateRequestRecord,
  JobExpenseRecord,
  QuoteDocumentKind,
  QuoteDocumentRecord,
  QuoteDocumentStatus,
  QuoteLineCategory,
  QuoteLineItem,
} from '../../types/estimate.ts';

interface QuoteInvoicePanelProps {
  lead: EstimateRequestRecord;
  quotes: QuoteDocumentRecord[];
  expenses: JobExpenseRecord[];
  totalPaidCents: number;
  onQuotesChanged: () => Promise<void>;
  onMarkEstimateSent?: () => Promise<void>;
}

const LINE_CATEGORIES: QuoteLineCategory[] = ['Labor', 'Materials', 'Disposal', 'Haul-Away'];

export function QuoteInvoicePanel({
  lead,
  quotes,
  expenses,
  totalPaidCents,
  onQuotesChanged,
  onMarkEstimateSent,
}: QuoteInvoicePanelProps) {
  const { pricingEntries } = useCatalog();

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [kind, setKind] = useState<QuoteDocumentKind>('estimate');
  const [status, setStatus] = useState<QuoteDocumentStatus>('draft');
  const [docNumber, setDocNumber] = useState(`EST-${lead.requestId}`);
  const [taxRatePercent, setTaxRatePercent] = useState(String(DEFAULT_WA_SALES_TAX_PERCENT));
  const [notes, setNotes] = useState(
    '50% deposit ($50 minimum) required to book; remaining balance due upon completion.'
  );
  const [selectedPricingId, setSelectedPricingId] = useState(pricingEntries[0]?.id || 'smallLawnMowing');
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(() => {
    const firstService = lead.services?.[0] || lead.serviceType || 'Yard & Property Service';
    return [
      {
        id: `li_${Date.now()}`,
        description: firstService,
        category: 'Labor',
        quantity: 1,
        unitPriceCents: 6000,
        amountCents: 6000,
      },
    ];
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totals = useMemo(
    () => computeQuoteTotals(lineItems, Number(taxRatePercent) || 0),
    [lineItems, taxRatePercent]
  );

  const startNewDocument = (nextKind: QuoteDocumentKind) => {
    const existingOfKind = quotes.filter((q) => q.kind === nextKind).length;
    const prefix = nextKind === 'estimate' ? 'EST' : 'INV';
    const suffix = existingOfKind > 0 ? `-${existingOfKind + 1}` : '';
    setEditingDocId(null);
    setKind(nextKind);
    setStatus(nextKind === 'invoice' ? 'invoiced' : 'draft');
    setDocNumber(`${prefix}-${lead.requestId}${suffix}`);
    setTaxRatePercent(String(DEFAULT_WA_SALES_TAX_PERCENT));
    setMessage('');
    setError('');
  };

  const loadDocumentIntoEditor = (docRecord: QuoteDocumentRecord) => {
    setEditingDocId(docRecord.docId);
    setKind(docRecord.kind);
    setStatus(docRecord.status);
    setDocNumber(docRecord.docNumber);
    setTaxRatePercent(String(docRecord.taxRatePercent));
    setNotes(docRecord.notes);
    setLineItems(docRecord.lineItems.map((item) => ({ ...item })));
    setMessage('');
    setError('');
  };

  const convertEstimateToInvoice = (estimate: QuoteDocumentRecord) => {
    const invoiceCount = quotes.filter((q) => q.kind === 'invoice').length;
    const suffix = invoiceCount > 0 ? `-${invoiceCount + 1}` : '';
    setEditingDocId(null);
    setKind('invoice');
    setStatus('invoiced');
    setDocNumber(`INV-${lead.requestId}${suffix}`);
    setTaxRatePercent(String(estimate.taxRatePercent));
    setNotes(estimate.notes);
    setLineItems(estimate.lineItems.map((item) => ({ ...item })));
    setMessage('Invoice draft pre-filled from estimate—review and click Save Invoice.');
    setError('');
  };

  const handleAddFromPricing = () => {
    const entry = pricingEntries.find((p) => p.id === selectedPricingId);
    if (!entry) return;
    const unitCents = parseStartingPriceCents(entry.startingDisplay);
    setLineItems((prev) => [
      ...prev,
      {
        id: `li_${Date.now()}_${prev.length}`,
        description: entry.label,
        category: 'Labor',
        quantity: 1,
        unitPriceCents: unitCents,
        amountCents: unitCents,
      },
    ]);
  };

  const handleAddCustomLine = (category: QuoteLineCategory) => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li_${Date.now()}_${prev.length}`,
        description:
          category === 'Materials'
            ? 'Job materials & hardware'
            : category === 'Disposal'
              ? 'Transfer station / green waste disposal fee'
              : category === 'Haul-Away'
                ? 'Trailer haul-away load'
                : 'Owner labor',
        category,
        quantity: 1,
        unitPriceCents: 5000,
        amountCents: 5000,
      },
    ]);
  };

  const handleImportLoggedExpenses = () => {
    if (expenses.length === 0) return;
    const imported: QuoteLineItem[] = expenses.map((exp, idx) => ({
      id: `li_exp_${Date.now()}_${idx}`,
      description: `${exp.description} (${exp.date})`,
      category: 'Materials',
      quantity: 1,
      unitPriceCents: exp.amountCents,
      amountCents: exp.amountCents,
    }));
    setLineItems((prev) => [...prev, ...imported]);
  };

  const updateLine = (
    index: number,
    patch: Partial<{ description: string; category: QuoteLineCategory; quantity: number; unitDollars: string }>
  ) => {
    setLineItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const quantity =
          patch.quantity !== undefined ? Math.max(1, Math.min(999, Number(patch.quantity) || 1)) : item.quantity;
        const unitPriceCents =
          patch.unitDollars !== undefined ? dollarsToCents(patch.unitDollars) : item.unitPriceCents;
        return {
          ...item,
          description: patch.description !== undefined ? patch.description : item.description,
          category: patch.category !== undefined ? patch.category : item.category,
          quantity,
          unitPriceCents,
          amountCents: Math.round(quantity * unitPriceCents),
        };
      })
    );
  };

  const removeLine = (index: number) => {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== index)));
  };

  const handleSaveDocument = async () => {
    if (lineItems.length === 0) {
      setError('Add at least one line item before saving.');
      return;
    }
    const cleanItems = lineItems.map((item) => ({
      ...item,
      description: item.description.trim() || `${item.category} item`,
    }));

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const docId = editingDocId || `${kind}_${Date.now()}`;
      await saveLeadQuoteDocument({
        docId,
        requestId: lead.requestId,
        docNumber: docNumber.trim() || `${kind === 'estimate' ? 'EST' : 'INV'}-${lead.requestId}`,
        kind,
        status,
        lineItems: cleanItems,
        laborCents: totals.laborCents,
        materialsCents: totals.materialsCents,
        disposalCents: totals.disposalCents,
        haulAwayCents: totals.haulAwayCents,
        subtotalCents: totals.subtotalCents,
        taxRatePercent: Number(taxRatePercent) || 0,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        depositRequiredCents: totals.depositRequiredCents,
        balanceDueOnCompletionCents: totals.balanceDueOnCompletionCents,
        notes,
      });

      setEditingDocId(docId);
      await onQuotesChanged();

      if (kind === 'estimate' && status === 'sent' && onMarkEstimateSent) {
        await onMarkEstimateSent();
      }
      setMessage(`${kind === 'estimate' ? 'Estimate' : 'Invoice'} ${docNumber} saved (Ref: ${lead.requestId}).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    setSaving(true);
    setError('');
    try {
      await deleteLeadQuoteDocument(lead.requestId, docId);
      if (editingDocId === docId) {
        startNewDocument('estimate');
      }
      await onQuotesChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopySummary = async (q: QuoteDocumentRecord) => {
    const lines = [
      `MOW & MEND LLC — Written ${q.kind === 'estimate' ? 'Estimate' : 'Invoice'}`,
      `Document #: ${q.docNumber} | Lead Ref: ${q.requestId}`,
      `Customer: ${lead.customerName} (${lead.city}, WA)`,
      ``,
      ...q.lineItems.map(
        (li) => `• [${li.category}] ${li.description} (x${li.quantity}): ${formatCents(li.amountCents)}`
      ),
      ``,
      `Labor: ${formatCents(q.laborCents)}`,
      `Materials: ${formatCents(q.materialsCents)}`,
      `Disposal: ${formatCents(q.disposalCents)}`,
      `Haul-Away: ${formatCents(q.haulAwayCents)}`,
      `WA Sales Tax (${q.taxRatePercent}%): ${formatCents(q.taxCents)}`,
      `Total: ${formatCents(q.totalCents)}`,
      `Booking Deposit (50%, $50 min): ${formatCents(q.depositRequiredCents)}`,
      `Balance Due on Completion: ${formatCents(q.balanceDueOnCompletionCents)}`,
      q.kind === 'invoice' ? `Payments Recorded: ${formatCents(totalPaidCents)} | Remaining: ${formatCents(Math.max(0, q.totalCents - totalPaidCents))}` : '',
      q.notes ? `\nNotes: ${q.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await navigator.clipboard.writeText(lines);
    setCopiedId(q.docId);
    setTimeout(() => setCopiedId((curr) => (curr === q.docId ? null : curr)), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Saved Estimates & Invoices List */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display font-bold text-base text-[#161917]">
            Saved Estimates &amp; Invoices ({quotes.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startNewDocument('estimate')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D4D0C5] bg-white text-xs font-semibold hover:bg-[#EFECE3] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Estimate</span>
            </button>
            <button
              type="button"
              onClick={() => startNewDocument('invoice')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#143326] text-[#F8F7F3] text-xs font-semibold hover:bg-[#1B4332] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>

        {quotes.length === 0 ? (
          <p className="text-xs text-[#535B55] bg-[#FAF9F6] border border-[#ECE9DF] rounded-lg p-3">
            No saved estimates or invoices yet for {lead.requestId}. Build one below using the
            pricing guide.
          </p>
        ) : (
          <div className="space-y-2">
            {quotes.map((q) => {
              const remaining = Math.max(0, q.totalCents - totalPaidCents);
              return (
                <div
                  key={q.docId}
                  className="p-3.5 rounded-lg border border-[#D4D0C5] bg-[#FAF9F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {q.kind === 'invoice' ? (
                        <Receipt className="w-4 h-4 text-[#B8520A]" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#143326]" />
                      )}
                      <span className="font-mono font-bold text-sm text-[#161917]">
                        {q.docNumber}
                      </span>
                      <span className="text-xs font-mono text-[#535B55]">
                        Ref: {q.requestId} · {q.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#3E453F] font-mono tabular-nums">
                      Total: <strong>{formatCents(q.totalCents)}</strong> · Deposit req:{' '}
                      {formatCents(q.depositRequiredCents)} ·{' '}
                      {q.kind === 'invoice'
                        ? `Remaining after payments: ${formatCents(remaining)}`
                        : `Balance on completion: ${formatCents(q.balanceDueOnCompletionCents)}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => loadDocumentIntoEditor(q)}
                      className="px-2.5 py-1.5 rounded border border-[#D4D0C5] bg-white text-xs font-semibold hover:bg-[#EFECE3] cursor-pointer"
                    >
                      Edit
                    </button>
                    {q.kind === 'estimate' && (
                      <button
                        type="button"
                        onClick={() => convertEstimateToInvoice(q)}
                        className="px-2.5 py-1.5 rounded bg-[#E86F14] text-[#141715] text-xs font-bold hover:bg-[#F37F24] cursor-pointer"
                      >
                        Convert to Invoice
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopySummary(q)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#D4D0C5] bg-white text-xs font-semibold hover:bg-[#EFECE3] cursor-pointer"
                    >
                      {copiedId === q.docId ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === q.docId ? 'Copied' : 'Copy Text'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(q.docId)}
                      aria-label={`Delete ${q.docNumber}`}
                      className="p-1.5 rounded text-[#991B1B] hover:bg-[#FEE2E2] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Builder */}
      <div className="p-4 sm:p-5 rounded-xl border border-[#D4D0C5] bg-[#F8F7F3] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2DFD4]">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#B8520A] font-semibold">
              {kind === 'estimate' ? 'Estimate Builder' : 'Invoice Builder'} · Lead Ref {lead.requestId}
            </p>
            <p className="text-xs text-[#535B55]">
              Separate Labor, Materials, Disposal, Haul-Away &amp; WA Sales Tax lines
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={kind}
              onChange={(e) => {
                const next = e.target.value as QuoteDocumentKind;
                setKind(next);
                if (!editingDocId) {
                  setDocNumber(`${next === 'estimate' ? 'EST' : 'INV'}-${lead.requestId}`);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border border-[#CFCBC0] bg-white text-xs font-semibold"
            >
              <option value="estimate">Estimate</option>
              <option value="invoice">Invoice</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuoteDocumentStatus)}
              className="px-2.5 py-1.5 rounded-lg border border-[#CFCBC0] bg-white text-xs font-semibold capitalize"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="invoiced">Invoiced</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#3E453F] mb-1">
              Document # (Linked to {lead.requestId})
            </label>
            <input
              type="text"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#CFCBC0] bg-white text-xs sm:text-sm font-mono font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3E453F] mb-1">
              WA Sales Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="25"
              value={taxRatePercent}
              onChange={(e) => setTaxRatePercent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#CFCBC0] bg-white text-xs sm:text-sm font-mono"
            />
          </div>
        </div>

        {/* Add Line Item from Pricing Guide */}
        <div className="p-3 rounded-lg bg-white border border-[#E2DFD4] space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedPricingId}
              onChange={(e) => setSelectedPricingId(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs text-[#161917]"
            >
              {pricingEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — {entry.startingDisplay}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddFromPricing}
              className="px-3.5 py-2 rounded-lg bg-[#141715] text-[#F5F2EA] text-xs font-semibold hover:bg-[#232825] whitespace-nowrap cursor-pointer"
            >
              + Add from Pricing Guide
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {LINE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleAddCustomLine(cat)}
                className="px-2.5 py-1 rounded border border-[#D4D0C5] bg-[#FAF9F6] text-[11px] font-semibold text-[#3E453F] hover:bg-[#EFECE3] cursor-pointer"
              >
                + {cat} Line
              </button>
            ))}
            {expenses.length > 0 && (
              <button
                type="button"
                onClick={handleImportLoggedExpenses}
                className="px-2.5 py-1 rounded border border-[#E86F14] bg-[#FFF7ED] text-[11px] font-semibold text-[#B8520A] cursor-pointer"
              >
                + Import {expenses.length} Logged Expense{expenses.length === 1 ? '' : 's'}
              </button>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          {lineItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-2.5 rounded-lg bg-white border border-[#E2DFD4] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
            >
              <div className="sm:col-span-3">
                <select
                  value={item.category}
                  onChange={(e) =>
                    updateLine(idx, { category: e.target.value as QuoteLineCategory })
                  }
                  className="w-full px-2 py-1.5 rounded border border-[#CFCBC0] bg-[#FAF9F6] text-xs font-semibold"
                >
                  {LINE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLine(idx, { description: e.target.value })}
                  placeholder="Line item description"
                  className="w-full px-2.5 py-1.5 rounded border border-[#CFCBC0] bg-[#FAF9F6] text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                  aria-label="Quantity"
                  className="w-full px-2 py-1.5 rounded border border-[#CFCBC0] bg-[#FAF9F6] text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={(item.unitPriceCents / 100).toFixed(2)}
                  onChange={(e) => updateLine(idx, { unitDollars: e.target.value })}
                  aria-label="Unit price in dollars"
                  className="w-full px-2 py-1.5 rounded border border-[#CFCBC0] bg-[#FAF9F6] text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-1 flex items-center justify-between sm:justify-end gap-1">
                <span className="sm:hidden text-xs font-mono font-bold">
                  {formatCents(item.amountCents)}
                </span>
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  aria-label="Remove line item"
                  className="p-1 text-[#991B1B] hover:bg-[#FEE2E2] rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Category Breakdown Totals */}
        <div className="bg-white border border-[#D4D0C5] rounded-lg p-3.5 space-y-1.5 text-xs font-mono tabular-nums">
          <div className="flex justify-between">
            <span className="text-[#535B55]">Labor</span>
            <span>{formatCents(totals.laborCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#535B55]">Materials</span>
            <span>{formatCents(totals.materialsCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#535B55]">Disposal</span>
            <span>{formatCents(totals.disposalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#535B55]">Haul-Away</span>
            <span>{formatCents(totals.haulAwayCents)}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-[#ECE9DF]">
            <span className="text-[#535B55]">Subtotal</span>
            <span>{formatCents(totals.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#535B55]">WA Sales Tax ({taxRatePercent || 0}%)</span>
            <span>{formatCents(totals.taxCents)}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-[#D4D0C5] text-sm font-bold text-[#161917]">
            <span>Total</span>
            <span>{formatCents(totals.totalCents)}</span>
          </div>
          <div className="flex justify-between text-[#B8520A] font-semibold">
            <span>Standard Booking Deposit (50%, $50 min.)</span>
            <span>{formatCents(totals.depositRequiredCents)}</span>
          </div>
          <div className="flex justify-between text-[#143326] font-semibold">
            <span>Balance Due on Completion</span>
            <span>{formatCents(totals.balanceDueOnCompletionCents)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3E453F] mb-1">
            Written Estimate / Invoice Terms &amp; Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#CFCBC0] bg-white text-xs"
          />
        </div>

        {error && <p className="text-xs text-[#991B1B] font-medium">{error}</p>}
        {message && <p className="text-xs text-[#143326] font-semibold">{message}</p>}

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveDocument}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] bg-[#143326] text-[#F8F7F3] text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#1B4332] disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>
            {saving
              ? 'Saving...'
              : editingDocId
                ? `Update ${kind === 'estimate' ? 'Estimate' : 'Invoice'}`
                : `Save ${kind === 'estimate' ? 'Estimate' : 'Invoice'}`}
          </span>
        </button>
      </div>
    </div>
  );
}
