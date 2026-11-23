import { CalendarClock, ArrowRight, ShieldCheck } from 'lucide-react';
import type { BookedSlotRecord } from '../../types/estimate.ts';

export const STANDARD_TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
] as const;

interface SchedulePanelProps {
  bookedSlots: BookedSlotRecord[];
  onOpenLead: (requestId: string) => void;
}

export function SchedulePanel({ bookedSlots, onOpenLead }: SchedulePanelProps) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#D4D0C5] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-[#161917] flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-[#E86F14]" />
            <span>Scheduled Jobs &amp; Reserved Time Slots</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#434A45] mt-1">
            Each day and time slot locks to a single job in Firestore so double-booking is blocked
            automatically.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#143326] font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#E86F14]" />
          <span>{bookedSlots.length} active slot{bookedSlots.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {bookedSlots.length === 0 ? (
        <div className="bg-white border border-[#D4D0C5] rounded-xl p-10 text-center space-y-2">
          <p className="font-semibold text-sm text-[#161917]">No jobs scheduled yet.</p>
          <p className="text-xs text-[#535B55]">
            Open any lead in the Leads &amp; Jobs tab and pick a date and arrival time slot to lock
            it onto the calendar.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D4D0C5] rounded-xl overflow-hidden divide-y divide-[#ECE9DF]">
          {bookedSlots.map((slot) => (
            <div
              key={slot.slotKey}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <p className="font-mono text-xs sm:text-sm font-bold text-[#B8520A] tabular-nums">
                  {slot.scheduledDate} · {slot.scheduledTime}
                </p>
                <p className="font-display font-bold text-lg text-[#161917]">
                  {slot.customerName}{' '}
                  <span className="text-xs font-mono font-normal text-[#535B55]">
                    · Ref: {slot.requestId} · {slot.city}, WA
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenLead(slot.requestId)}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D4D0C5] bg-[#FAF9F6] text-xs font-semibold text-[#161917] hover:bg-[#EFECE3] cursor-pointer"
              >
                <span>Open Job</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E86F14]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
