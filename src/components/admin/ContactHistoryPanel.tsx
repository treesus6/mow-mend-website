import { useState } from 'react';
import { Loader2, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { addLeadContact, deleteLeadContact } from '../../lib/firebase.ts';
import type { ContactChannel, LeadContactRecord } from '../../types/estimate.ts';

interface ContactHistoryPanelProps {
  requestId: string;
  contacts: LeadContactRecord[];
  onRefresh: () => Promise<void>;
}

const CHANNELS: ContactChannel[] = ['Call', 'Text', 'Email', 'In Person'];

export function ContactHistoryPanel({
  requestId,
  contacts,
  onRefresh,
}: ContactHistoryPanelProps) {
  const todayIso = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayIso);
  const [channel, setChannel] = useState<ContactChannel>('Text');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddContact = async () => {
    if (!note.trim()) {
      setError('Enter a short contact note before logging.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await addLeadContact({
        contactId: `ct_${Date.now()}`,
        requestId,
        date: date || todayIso,
        channel,
        note: note.trim(),
      });
      setNote('');
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log contact entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-[#D4D0C5] bg-white space-y-3">
        <h3 className="font-display font-bold text-base text-[#161917] flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-[#E86F14]" />
          <span>Customer Contact History ({contacts.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs font-mono"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as ContactChannel)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs"
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-[#3E453F] mb-1">
              Summary / Note
            </label>
            <input
              type="text"
              placeholder="Sent estimate breakdown, confirmed gate code..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleAddContact}
              className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[36px] bg-[#143326] text-[#F8F7F3] text-xs font-semibold rounded-lg hover:bg-[#1B4332] disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Log</span>
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-[#991B1B]">{error}</p>}

        {contacts.length === 0 ? (
          <p className="text-xs text-[#535B55] pt-1">
            No outreach or replies logged yet for this lead.
          </p>
        ) : (
          <ul className="divide-y divide-[#ECE9DF] border-t border-[#ECE9DF] pt-1">
            {contacts.map((item) => (
              <li key={item.contactId} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-mono text-[11px] text-[#535B55]">
                    {item.date} · <strong className="text-[#143326]">{item.channel}</strong>
                  </p>
                  <p className="text-[#161917] leading-relaxed">{item.note}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteLeadContact(requestId, item.contactId);
                    await onRefresh();
                  }}
                  aria-label="Delete contact entry"
                  className="p-1 text-[#991B1B] hover:bg-[#FEE2E2] rounded cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
