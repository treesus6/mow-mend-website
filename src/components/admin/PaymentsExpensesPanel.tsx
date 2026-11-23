import { useState } from 'react';
import { DollarSign, Loader2, Plus, Trash2, Wrench } from 'lucide-react';
import {
  addLeadExpense,
  addLeadPayment,
  deleteLeadExpense,
  deleteLeadPayment,
} from '../../lib/firebase.ts';
import { dollarsToCents, formatCents } from '../../lib/quoteMath.ts';
import type {
  JobExpenseRecord,
  JobPaymentRecord,
  PaymentMethod,
  PaymentType,
} from '../../types/estimate.ts';

interface PaymentsExpensesPanelProps {
  requestId: string;
  jobTotalCents: number;
  payments: JobPaymentRecord[];
  expenses: JobExpenseRecord[];
  onRefresh: () => Promise<void>;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Check', 'Card', 'Zelle', 'Venmo', 'ACH', 'Other'];

export function PaymentsExpensesPanel({
  requestId,
  jobTotalCents,
  payments,
  expenses,
  onRefresh,
}: PaymentsExpensesPanelProps) {
  const todayIso = new Date().toISOString().split('T')[0];

  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(todayIso);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Card');
  const [payType, setPayType] = useState<PaymentType>('deposit');
  const [payNote, setPayNote] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(todayIso);
  const [savingExpense, setSavingExpense] = useState(false);

  const [error, setError] = useState('');

  const depositPaidCents = payments
    .filter((p) => p.paymentType === 'deposit')
    .reduce((sum, p) => sum + p.amountCents, 0);
  const balancePaidCents = payments
    .filter((p) => p.paymentType === 'balance')
    .reduce((sum, p) => sum + p.amountCents, 0);
  const totalPaidCents = depositPaidCents + balancePaidCents;
  const remainingCents = Math.max(0, jobTotalCents - totalPaidCents);
  const totalExpenseCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const grossBasis = jobTotalCents > 0 ? jobTotalCents : totalPaidCents;
  const netAfterExpensesCents = grossBasis - totalExpenseCents;

  const handleAddPayment = async () => {
    const cents = dollarsToCents(payAmount);
    if (cents <= 0) {
      setError('Enter a payment amount greater than $0.00.');
      return;
    }
    setError('');
    setSavingPayment(true);
    try {
      await addLeadPayment({
        paymentId: `pay_${Date.now()}`,
        requestId,
        amountCents: cents,
        date: payDate || todayIso,
        method: payMethod,
        paymentType: payType,
        note: payNote.trim(),
      });
      setPayAmount('');
      setPayNote('');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expDesc.trim()) {
      setError('Enter a material or expense description.');
      return;
    }
    const cents = dollarsToCents(expAmount);
    setError('');
    setSavingExpense(true);
    try {
      await addLeadExpense({
        expenseId: `exp_${Date.now()}`,
        requestId,
        description: expDesc.trim(),
        amountCents: cents,
        date: expDate || todayIso,
      });
      setExpDesc('');
      setExpAmount('');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense.');
    } finally {
      setSavingExpense(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E2DFD4]">
          <p className="text-[11px] text-[#535B55]">Quoted / Invoiced</p>
          <p className="font-mono font-bold text-base text-[#161917] mt-0.5">
            {formatCents(jobTotalCents)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[#DCFCE7]/50 border border-[#16A34A]/30">
          <p className="text-[11px] text-[#166534]">Paid Total</p>
          <p className="font-mono font-bold text-base text-[#166534] mt-0.5">
            {formatCents(totalPaidCents)}
          </p>
          <p className="text-[10px] font-mono text-[#166534]">
            Dep {formatCents(depositPaidCents)} · Bal {formatCents(balancePaidCents)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[#FFF7ED] border border-[#E86F14]/30">
          <p className="text-[11px] text-[#B8520A]">Remaining Balance</p>
          <p className="font-mono font-bold text-base text-[#B8520A] mt-0.5">
            {formatCents(remainingCents)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E2DFD4]">
          <p className="text-[11px] text-[#535B55]">Materials &amp; Costs</p>
          <p className="font-mono font-bold text-base text-[#161917] mt-0.5">
            {formatCents(totalExpenseCents)}
          </p>
          <p className="text-[10px] font-mono text-[#535B55]">
            Net: {formatCents(netAfterExpensesCents)}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#991B1B] bg-[#FEF2F2] border border-[#DC2626]/30 rounded-lg p-3">
          {error}
        </p>
      )}

      {/* Deposits & Payments */}
      <div className="p-4 rounded-xl border border-[#D4D0C5] bg-white space-y-4">
        <h3 className="font-display font-bold text-base text-[#161917] flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-[#E86F14]" />
          <span>Deposits &amp; Payments ({payments.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">Date</label>
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">Type</label>
            <select
              value={payType}
              onChange={(e) => setPayType(e.target.value as PaymentType)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs"
            >
              <option value="deposit">Deposit</option>
              <option value="balance">Balance</option>
            </select>
          </div>
          <button
            type="button"
            disabled={savingPayment}
            onClick={handleAddPayment}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[36px] bg-[#143326] text-[#F8F7F3] text-xs font-semibold rounded-lg hover:bg-[#1B4332] disabled:opacity-50 cursor-pointer"
          >
            {savingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Record</span>
          </button>
        </div>

        <input
          type="text"
          value={payNote}
          onChange={(e) => setPayNote(e.target.value)}
          placeholder="Optional payment note (check #, last 4 digits, confirmation ref...)"
          className="w-full px-3 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs"
        />

        {payments.length === 0 ? (
          <p className="text-xs text-[#535B55]">No payments recorded yet for this job.</p>
        ) : (
          <ul className="divide-y divide-[#ECE9DF] border-t border-[#ECE9DF]">
            {payments.map((p) => (
              <li key={p.paymentId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-[#161917]">
                    {formatCents(p.amountCents)}
                  </span>{' '}
                  <span className="uppercase font-mono text-[11px] text-[#B8520A]">
                    · {p.paymentType}
                  </span>{' '}
                  <span className="text-[#535B55]">
                    · {p.method} · {p.date}
                  </span>
                  {p.note && <p className="text-[#434A45] mt-0.5">{p.note}</p>}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteLeadPayment(requestId, p.paymentId);
                    await onRefresh();
                  }}
                  aria-label="Delete payment"
                  className="p-1 text-[#991B1B] hover:bg-[#FEE2E2] rounded cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Materials & Job Expenses */}
      <div className="p-4 rounded-xl border border-[#D4D0C5] bg-white space-y-4">
        <h3 className="font-display font-bold text-base text-[#161917] flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-[#E86F14]" />
          <span>Materials &amp; Expenses ({expenses.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">
              Material / Expense Description
            </label>
            <input
              type="text"
              placeholder="2x cedar fence posts + Quikrete, dump fee..."
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="48.50"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">Date</label>
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              disabled={savingExpense}
              onClick={handleAddExpense}
              className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[36px] bg-[#141715] text-[#F5F2EA] text-xs font-semibold rounded-lg hover:bg-[#232825] disabled:opacity-50 cursor-pointer"
            >
              {savingExpense ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add</span>
            </button>
          </div>
        </div>

        {expenses.length === 0 ? (
          <p className="text-xs text-[#535B55]">No materials or expenses logged for this job.</p>
        ) : (
          <ul className="divide-y divide-[#ECE9DF] border-t border-[#ECE9DF]">
            {expenses.map((exp) => (
              <li key={exp.expenseId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-[#161917]">{exp.description}</span>{' '}
                  <span className="text-[#535B55] font-mono">· {exp.date}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-[#161917]">
                    {formatCents(exp.amountCents)}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteLeadExpense(requestId, exp.expenseId);
                      await onRefresh();
                    }}
                    aria-label={`Delete expense ${exp.description}`}
                    className="p-1 text-[#991B1B] hover:bg-[#FEE2E2] rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
