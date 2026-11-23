import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  AlertTriangle,
  CalendarClock,
  Camera,
  Check,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  Sliders,
  Trash2,
} from 'lucide-react';
import { CatalogManagerTab } from '../components/admin/CatalogManagerTab.tsx';
import { ContactHistoryPanel } from '../components/admin/ContactHistoryPanel.tsx';
import { PaymentsExpensesPanel } from '../components/admin/PaymentsExpensesPanel.tsx';
import { QuoteInvoicePanel } from '../components/admin/QuoteInvoicePanel.tsx';
import { SchedulePanel, STANDARD_TIME_SLOTS } from '../components/admin/SchedulePanel.tsx';
import {
  auth,
  clearLeadScheduleSlot,
  deleteEstimateLead,
  fetchAllBookedSlots,
  fetchAllEstimateLeads,
  fetchEstimatePhotos,
  fetchLeadContacts,
  fetchLeadExpenses,
  fetchLeadPayments,
  fetchLeadQuotes,
  googleAuthProvider,
  scheduleLeadSlot,
  updateEstimateLeadAdminFields,
} from '../lib/firebase.ts';
import { dollarsToCents, findScheduleSlotConflict, formatCents } from '../lib/quoteMath.ts';
import {
  LEAD_STATUSES,
  normalizeLeadStatus,
  type BookedSlotRecord,
  type EstimatePhotoRecord,
  type EstimateRequestRecord,
  type JobExpenseRecord,
  type JobPaymentRecord,
  type LeadContactRecord,
  type LeadStatus,
  type QuoteDocumentRecord,
} from '../types/estimate.ts';

const OWNER_EMAIL = 'treevanderveer@gmail.com';

const STATUS_BADGE_STYLES: Record<LeadStatus, string> = {
  New: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/40',
  'Estimate Sent': 'bg-[#E0F2FE] text-[#075985] border-[#0284C7]/30',
  Booked: 'bg-[#DCFCE7] text-[#166534] border-[#16A34A]/30',
  'In Progress': 'bg-[#DBEAFE] text-[#1E40AF] border-[#2563EB]/30',
  Completed: 'bg-[#D1FAE5] text-[#065F46] border-[#059669]/30',
  Paid: 'bg-[#143326] text-[#F8F7F3] border-[#143326]',
};

function formatTimestamp(ts: unknown): string {
  if (!ts) return 'Just now';
  if (
    typeof ts === 'object' &&
    ts !== null &&
    'toDate' in ts &&
    typeof (ts as { toDate: () => Date }).toDate === 'function'
  ) {
    return (ts as { toDate: () => Date }).toDate().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return 'Saved';
}

export function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');

  const [workspaceTab, setWorkspaceTab] = useState<'leads' | 'schedule' | 'catalog'>('leads');
  const [detailTab, setDetailTab] = useState<'overview' | 'quotes' | 'payments' | 'contacts'>('overview');

  const [leads, setLeads] = useState<EstimateRequestRecord[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlotRecord[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [statusFilter, setStatusFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [photos, setPhotos] = useState<EstimatePhotoRecord[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [quotes, setQuotes] = useState<QuoteDocumentRecord[]>([]);
  const [payments, setPayments] = useState<JobPaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<JobExpenseRecord[]>([]);
  const [contacts, setContacts] = useState<LeadContactRecord[]>([]);

  // Editable admin fields for selected lead
  const [editStatus, setEditStatus] = useState<LeadStatus>('New');
  const [editEstimateAmount, setEditEstimateAmount] = useState('');
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingLead, setSavingLead] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Scheduling controls for selected lead
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState<string>('09:00 AM');
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthorizedOwner =
    Boolean(user) &&
    user?.email?.toLowerCase() === OWNER_EMAIL &&
    user?.emailVerified === true;

  const loadWorkspaceData = async () => {
    setLoadingLeads(true);
    setLoadError('');
    try {
      const [leadsResult, slotsResult] = await Promise.allSettled([
        fetchAllEstimateLeads(),
        fetchAllBookedSlots(),
      ]);

      const errors: string[] = [];

      if (leadsResult.status === 'fulfilled') {
        const leadData = leadsResult.value;
        setLeads(leadData);
        if (leadData.length > 0 && !selectedId) {
          setSelectedId(leadData[0].requestId);
        }
      } else {
        errors.push(
          leadsResult.reason instanceof Error
            ? leadsResult.reason.message
            : 'Unable to load estimate leads. Verify your owner Google sign-in.'
        );
      }

      if (slotsResult.status === 'fulfilled') {
        setBookedSlots(slotsResult.value);
      } else {
        errors.push(
          slotsResult.reason instanceof Error
            ? slotsResult.reason.message
            : 'Unable to load booked schedule slots.'
        );
      }

      if (errors.length > 0) {
        setLoadError(errors.join(' | '));
      }
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (authReady && isAuthorizedOwner) {
      loadWorkspaceData();
    }
  }, [authReady, isAuthorizedOwner]);

  const selectedLead = useMemo(
    () => leads.find((l) => l.requestId === selectedId) || null,
    [leads, selectedId]
  );

  const loadLeadSubRecords = async (lead: EstimateRequestRecord) => {
    const [qRes, pRes, eRes, cRes] = await Promise.all([
      fetchLeadQuotes(lead.requestId).catch(() => []),
      fetchLeadPayments(lead.requestId).catch(() => []),
      fetchLeadExpenses(lead.requestId).catch(() => []),
      fetchLeadContacts(lead.requestId).catch(() => []),
    ]);
    setQuotes(qRes);
    setPayments(pRes);
    setExpenses(eRes);
    setContacts(cRes);
  };

  useEffect(() => {
    if (!selectedLead) {
      setPhotos([]);
      setQuotes([]);
      setPayments([]);
      setExpenses([]);
      setContacts([]);
      return;
    }

    setEditStatus(normalizeLeadStatus(selectedLead.status));
    setEditEstimateAmount(selectedLead.estimateAmount || '');
    setEditFollowUpDate(selectedLead.followUpDate || '');
    setEditNotes(selectedLead.internalNotes || '');
    setSchedDate(selectedLead.scheduledDate || selectedLead.preferredDate || '');
    setSchedTime(selectedLead.scheduledTime || '09:00 AM');
    setSaveMessage('');
    setScheduleError('');
    setScheduleSuccess('');

    if (selectedLead.photoCount > 0 && isAuthorizedOwner) {
      setLoadingPhotos(true);
      fetchEstimatePhotos(selectedLead.requestId)
        .then((res) => setPhotos(res))
        .catch(() => setPhotos([]))
        .finally(() => setLoadingPhotos(false));
    } else {
      setPhotos([]);
    }

    if (isAuthorizedOwner) {
      loadLeadSubRecords(selectedLead);
    }
  }, [selectedLead?.requestId, isAuthorizedOwner]);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      const normalized = normalizeLeadStatus(lead.status);
      if (statusFilter !== 'ALL' && normalized !== statusFilter) return false;
      if (!q) return true;
      return (
        lead.customerName.toLowerCase().includes(q) ||
        lead.requestId.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.serviceType.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q)
      );
    });
  }, [leads, statusFilter, searchQuery]);

  const customerHistoryCount = useMemo(() => {
    if (!selectedLead) return 0;
    return leads.filter(
      (l) =>
        l.requestId !== selectedLead.requestId &&
        (l.email.toLowerCase() === selectedLead.email.toLowerCase() ||
          l.phone.replace(/\D/g, '') === selectedLead.phone.replace(/\D/g, ''))
    ).length;
  }, [leads, selectedLead]);

  const liveConflictSlot = useMemo(() => {
    if (!selectedLead || !schedDate || !schedTime) return null;
    return findScheduleSlotConflict(bookedSlots, selectedLead.requestId, schedDate, schedTime);
  }, [bookedSlots, selectedLead, schedDate, schedTime]);

  const activeJobTotalCents = useMemo(() => {
    const latestInvoice = quotes.find((q) => q.kind === 'invoice');
    if (latestInvoice) return latestInvoice.totalCents;
    const latestEstimate = quotes.find((q) => q.kind === 'estimate');
    if (latestEstimate) return latestEstimate.totalCents;
    if (selectedLead?.estimateAmount) return dollarsToCents(selectedLead.estimateAmount);
    return 0;
  }, [quotes, selectedLead?.estimateAmount]);

  const totalPaidCents = useMemo(
    () => payments.reduce((sum, p) => sum + p.amountCents, 0),
    [payments]
  );

  const handleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    }
  };

  const handlePipelineStageClick = async (nextStage: LeadStatus) => {
    if (!selectedLead) return;
    setEditStatus(nextStage);
    setSavingLead(true);
    setSaveMessage('');
    try {
      await updateEstimateLeadAdminFields(selectedLead.requestId, {
        status: nextStage,
        estimateAmount: editEstimateAmount,
        followUpDate: editFollowUpDate,
        internalNotes: editNotes,
      });
      setLeads((prev) =>
        prev.map((item) =>
          item.requestId === selectedLead.requestId ? { ...item, status: nextStage } : item
        )
      );
      setSaveMessage(`Stage updated to "${nextStage}".`);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Failed to update stage.');
    } finally {
      setSavingLead(false);
    }
  };

  const handleSaveAdminChanges = async () => {
    if (!selectedLead) return;
    setSavingLead(true);
    setSaveMessage('');
    try {
      await updateEstimateLeadAdminFields(selectedLead.requestId, {
        status: editStatus,
        estimateAmount: editEstimateAmount,
        followUpDate: editFollowUpDate,
        internalNotes: editNotes,
      });
      setLeads((prev) =>
        prev.map((item) =>
          item.requestId === selectedLead.requestId
            ? {
                ...item,
                status: editStatus,
                estimateAmount: editEstimateAmount,
                followUpDate: editFollowUpDate,
                internalNotes: editNotes,
              }
            : item
        )
      );
      setSaveMessage('Lead updates saved.');
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSavingLead(false);
    }
  };

  const handleScheduleJob = async () => {
    if (!selectedLead) return;
    setScheduleError('');
    setScheduleSuccess('');

    if (!schedDate) {
      setScheduleError('Select a date before booking a schedule slot.');
      return;
    }

    const clientConflict = findScheduleSlotConflict(
      bookedSlots,
      selectedLead.requestId,
      schedDate,
      schedTime
    );
    if (clientConflict) {
      setScheduleError(
        `Double-booking refused: ${schedDate} at ${schedTime} is already booked for ${clientConflict.requestId} (${clientConflict.customerName}). Choose a different day or time.`
      );
      return;
    }

    setSavingSchedule(true);
    try {
      const currentStatus = normalizeLeadStatus(selectedLead.status);
      const nextStatus: LeadStatus =
        currentStatus === 'New' || currentStatus === 'Estimate Sent' ? 'Booked' : currentStatus;

      const { slot, status } = await scheduleLeadSlot({
        lead: selectedLead,
        scheduledDate: schedDate,
        scheduledTime: schedTime,
        nextStatus,
      });

      setEditStatus(status);
      setLeads((prev) =>
        prev.map((item) =>
          item.requestId === selectedLead.requestId
            ? {
                ...item,
                scheduledDate: slot.scheduledDate,
                scheduledTime: slot.scheduledTime,
                scheduledSlotKey: slot.slotKey,
                status,
              }
            : item
        )
      );
      const refreshedSlots = await fetchAllBookedSlots();
      setBookedSlots(refreshedSlots);
      setScheduleSuccess(`Booked slot ${slot.scheduledDate} at ${slot.scheduledTime}.`);
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Unable to book schedule slot.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleClearSchedule = async () => {
    if (!selectedLead) return;
    setSavingSchedule(true);
    setScheduleError('');
    setScheduleSuccess('');
    try {
      await clearLeadScheduleSlot(selectedLead);
      setLeads((prev) =>
        prev.map((item) =>
          item.requestId === selectedLead.requestId
            ? { ...item, scheduledDate: '', scheduledTime: '', scheduledSlotKey: '' }
            : item
        )
      );
      setSchedDate('');
      const refreshedSlots = await fetchAllBookedSlots();
      setBookedSlots(refreshedSlots);
      setScheduleSuccess('Scheduled slot cleared.');
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : 'Unable to clear schedule slot.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDeleteLead = async (requestId: string) => {
    if (!isAuthorizedOwner) return;
    setDeletingId(requestId);
    setDeleteError('');
    try {
      await deleteEstimateLead(requestId);
      const remaining = leads.filter((item) => item.requestId !== requestId);
      setLeads(remaining);
      setBookedSlots((prev) => prev.filter((slot) => slot.requestId !== requestId));
      setConfirmDeleteId(null);
      if (selectedId === requestId) {
        setSelectedId(remaining[0]?.requestId ?? null);
        setPhotos([]);
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete estimate lead.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!authReady) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center gap-2 text-sm text-[#535B55]">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking authentication...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white border border-[#D4D0C5] rounded-xl p-8 space-y-5">
          <div className="w-11 h-11 rounded-lg bg-[#143326] text-[#F8F7F3] flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#143326] font-semibold">
              Private Owner Portal
            </p>
            <h1 className="font-display font-bold text-2xl text-[#161917] mt-1">
              MOW &amp; MEND Lead Dashboard
            </h1>
            <p className="text-sm text-[#434A45] mt-2 leading-relaxed">
              Sign in with the verified owner Google account (<span className="font-mono">{OWNER_EMAIL}</span>)
              to manage leads, quotes, invoices, payments, expenses, schedules, and catalog pricing.
            </p>
          </div>
          {authError && (
            <p className="text-xs text-[#991B1B] bg-[#FEF2F2] border border-[#DC2626]/30 rounded-lg p-3">
              {authError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full px-5 py-3 min-h-[44px] bg-[#143326] text-[#F8F7F3] font-display font-bold text-sm rounded-lg hover:bg-[#1B4332] transition-colors cursor-pointer"
          >
            Sign In With Google (Owner Only)
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorizedOwner) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white border border-[#DC2626]/40 rounded-xl p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#991B1B]">
            <ShieldAlert className="w-5 h-5" />
            <h1 className="font-display font-bold text-xl">Access Restricted</h1>
          </div>
          <p className="text-sm text-[#434A45] leading-relaxed">
            Signed in as <span className="font-mono font-semibold">{user.email}</span>. Customer
            estimate records are restricted strictly to the authorized business owner account.
          </p>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] border border-[#D4D0C5] rounded-lg text-sm font-semibold hover:bg-[#EFECE3] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  const newCount = leads.filter((l) => normalizeLeadStatus(l.status) === 'New').length;
  const activeCount = leads.filter((l) =>
    ['Estimate Sent', 'Booked', 'In Progress'].includes(normalizeLeadStatus(l.status))
  ).length;
  const totalPhotos = leads.reduce((sum, l) => sum + (l.photoCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E0D8]">
        <div>
          <p className="text-xs font-mono text-[#143326] font-semibold">
            Private Owner Workspace · Signed in as {user.email}
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#161917] mt-1">
            MOW &amp; MEND Operations Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-[#EAE5D8] border border-[#D4D0C5] rounded-lg">
            <button
              type="button"
              onClick={() => setWorkspaceTab('leads')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                workspaceTab === 'leads' ? 'bg-[#143326] text-[#F8F7F3]' : 'text-[#3E453F]'
              }`}
            >
              Leads &amp; Jobs ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceTab('schedule')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                workspaceTab === 'schedule' ? 'bg-[#143326] text-[#F8F7F3]' : 'text-[#3E453F]'
              }`}
            >
              Schedule ({bookedSlots.length})
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceTab('catalog')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap ${
                workspaceTab === 'catalog' ? 'bg-[#143326] text-[#F8F7F3]' : 'text-[#3E453F]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Services &amp; Pricing</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadWorkspaceData}
            disabled={loadingLeads}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] bg-white border border-[#D4D0C5] rounded-lg text-xs font-semibold hover:bg-[#EFECE3] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] bg-white border border-[#D4D0C5] rounded-lg text-xs font-semibold hover:bg-[#EFECE3] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leads.length },
          { label: 'New Unreviewed', value: newCount },
          { label: 'Active Pipeline', value: activeCount },
          { label: 'Booked Slots / Photos', value: `${bookedSlots.length} / ${totalPhotos}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E2E0D8] rounded-xl p-4">
            <p className="text-xs text-[#535B55]">{stat.label}</p>
            <p className="font-mono font-bold text-2xl text-[#161917] tabular-nums mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {(loadError || deleteError) && (
        <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 text-sm text-[#991B1B] break-words">
          {loadError || deleteError}
        </div>
      )}

      {workspaceTab === 'catalog' && <CatalogManagerTab />}

      {workspaceTab === 'schedule' && (
        <SchedulePanel
          bookedSlots={bookedSlots}
          onOpenLead={(requestId) => {
            setSelectedId(requestId);
            setWorkspaceTab('leads');
            setDetailTab('overview');
          }}
        />
      )}

      {workspaceTab === 'leads' && (
        <>
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6D756E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, Ref (MM-2026-...), city, service, phone..."
                className="w-full pl-9 pr-3.5 py-2 min-h-[40px] bg-white border border-[#D4D0C5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#143326]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#143326] text-[#F8F7F3] border-[#143326]'
                    : 'bg-white text-[#3E453F] border-[#D4D0C5]'
                }`}
              >
                All ({leads.length})
              </button>
              {LEAD_STATUSES.map((status) => {
                const count = leads.filter((l) => normalizeLeadStatus(l.status) === status).length;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap cursor-pointer ${
                      statusFilter === status
                        ? 'bg-[#143326] text-[#F8F7F3] border-[#143326]'
                        : 'bg-white text-[#3E453F] border-[#D4D0C5]'
                    }`}
                  >
                    {status} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Split Workspace: Lead List + Detail Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 bg-white border border-[#E2E0D8] rounded-xl overflow-hidden">
              {loadingLeads ? (
                <div className="p-8 text-center text-sm text-[#535B55]">Loading leads...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#535B55]">
                  No estimate requests match your current filter.
                </div>
              ) : (
                <ul className="divide-y divide-[#ECE9DF] max-h-[760px] overflow-y-auto">
                  {filteredLeads.map((lead) => {
                    const isSelected = lead.requestId === selectedId;
                    const isConfirmingDelete = confirmDeleteId === lead.requestId;
                    const isDeleting = deletingId === lead.requestId;
                    const normalizedStatus = normalizeLeadStatus(lead.status);
                    return (
                      <li
                        key={lead.requestId}
                        className={`transition-colors ${
                          isSelected ? 'bg-[#F0F4F1]' : 'hover:bg-[#FAF9F6]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(lead.requestId)}
                          className="w-full text-left p-4 pb-2.5 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-[#141715] tabular-nums">
                              Ref: {lead.requestId}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${
                                STATUS_BADGE_STYLES[normalizedStatus]
                              }`}
                            >
                              {normalizedStatus}
                            </span>
                          </div>
                          <p className="font-display font-bold text-sm text-[#161917]">
                            {lead.customerName}
                          </p>
                          <p className="text-xs text-[#434A45] truncate mt-0.5">
                            {lead.services?.length ? lead.services.join(', ') : lead.serviceType}
                          </p>
                          {lead.scheduledDate && (
                            <p className="text-[11px] font-mono text-[#166534] font-semibold mt-1">
                              Booked: {lead.scheduledDate} · {lead.scheduledTime}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-[#535B55]">
                            <span>{lead.city}, WA</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {lead.photoCount} photo{lead.photoCount === 1 ? '' : 's'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{formatTimestamp(lead.createdAt)}</span>
                          </div>
                        </button>

                        {isAuthorizedOwner && (
                          <div className="px-4 pb-3 flex items-center justify-end gap-2">
                            {isConfirmingDelete ? (
                              <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E0D8]">
                                <span className="text-xs font-semibold text-[#991B1B]">
                                  Delete {lead.requestId} &amp; photo bytes?
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteLead(lead.requestId)}
                                    className="px-2.5 py-1 min-h-[30px] rounded bg-[#DC2626] text-white text-xs font-semibold hover:bg-[#B91C1C] disabled:opacity-50 cursor-pointer"
                                  >
                                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1 min-h-[30px] rounded border border-[#D4D0C5] bg-white text-xs font-semibold text-[#3E453F] hover:bg-[#EFECE3] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError('');
                                  setConfirmDeleteId(lead.requestId);
                                }}
                                aria-label={`Delete lead ${lead.requestId}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="lg:col-span-8 bg-white border border-[#D4D0C5] rounded-xl p-5 sm:p-7">
              {!selectedLead ? (
                <div className="py-16 text-center text-sm text-[#535B55]">
                  Select a lead from the list to inspect details, photos, quotes, payments, schedule,
                  and contact history.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Lead Header + Quick Communication */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#ECE9DF]">
                    <div>
                      <p className="font-mono text-xs text-[#143326] font-semibold">
                        Ref: {selectedLead.requestId} · Submitted {formatTimestamp(selectedLead.createdAt)}
                      </p>
                      <h2 className="font-display font-bold text-2xl text-[#161917] mt-1">
                        {selectedLead.customerName}
                      </h2>
                      {customerHistoryCount > 0 && (
                        <p className="text-xs text-[#B45309] font-medium mt-1">
                          Returning customer: {customerHistoryCount} other request
                          {customerHistoryCount === 1 ? '' : 's'} on file
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`tel:${selectedLead.phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#143326] text-[#F8F7F3] text-xs font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`sms:${selectedLead.phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4D0C5] text-xs font-semibold text-[#161917]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Text</span>
                      </a>
                      <a
                        href={`mailto:${selectedLead.email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D4D0C5] text-xs font-semibold text-[#161917]"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>

                  {/* 6-Stage Job Status Pipeline */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono uppercase tracking-wider text-[#535B55] font-semibold">
                        Job Status Pipeline
                      </span>
                      <span className="font-mono text-[#535B55]">
                        Paid: {formatCents(totalPaidCents)}
                        {activeJobTotalCents > 0
                          ? ` / ${formatCents(activeJobTotalCents)}`
                          : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                      {LEAD_STATUSES.map((stage, idx) => {
                        const active = editStatus === stage;
                        return (
                          <button
                            key={stage}
                            type="button"
                            disabled={savingLead}
                            onClick={() => handlePipelineStageClick(stage)}
                            className={`px-2 py-2 min-h-[38px] rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#143326] text-[#F8F7F3] border-[#143326]'
                                : 'bg-[#FAF9F6] text-[#3E453F] border-[#D4D0C5] hover:bg-[#EFECE3]'
                            }`}
                          >
                            {idx + 1}. {stage}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lead Detail Sub-Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-[#EFECE3] border border-[#D4D0C5] rounded-lg overflow-x-auto">
                    {(
                      [
                        { id: 'overview', label: 'Overview & Schedule' },
                        { id: 'quotes', label: `Estimates & Invoices (${quotes.length})` },
                        { id: 'payments', label: `Payments & Expenses (${payments.length}/${expenses.length})` },
                        { id: 'contacts', label: `Contact History (${contacts.length})` },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDetailTab(tab.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                          detailTab === tab.id
                            ? 'bg-white text-[#161917] shadow-xs'
                            : 'text-[#434A45] hover:text-[#161917]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {detailTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-3.5 rounded-lg bg-[#F8F7F3] border border-[#ECE9DF]">
                          <p className="text-xs text-[#535B55]">Contact &amp; Preference</p>
                          <p className="font-mono font-semibold text-[#161917] mt-0.5">
                            {selectedLead.phone}
                          </p>
                          <p className="text-xs text-[#434A45] break-all">{selectedLead.email}</p>
                          <p className="text-xs font-semibold text-[#143326] mt-1 capitalize">
                            Prefers: {selectedLead.preferredContact}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-[#F8F7F3] border border-[#ECE9DF]">
                          <p className="text-xs text-[#535B55] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> Private Job Address
                          </p>
                          <p className="font-semibold text-[#161917] mt-0.5">
                            {selectedLead.streetAddress}
                          </p>
                          <p className="text-xs text-[#434A45]">
                            {selectedLead.city}, WA {selectedLead.zipCode}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="text-xs font-mono uppercase tracking-wider text-[#535B55]">
                          Requested Services &amp; Scope
                        </p>
                        {selectedLead.services?.length ? (
                          <ul className="list-disc pl-5 text-sm font-semibold text-[#161917] space-y-0.5">
                            {selectedLead.services.map((svc) => (
                              <li key={svc}>{svc}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-semibold text-[#161917]">{selectedLead.serviceType}</p>
                        )}
                        <p className="text-[#3E453F] whitespace-pre-wrap leading-relaxed bg-[#FAF9F6] p-3.5 rounded-lg border border-[#ECE9DF]">
                          {selectedLead.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-[#535B55] pt-1">
                          <span>
                            Debris Hauling:{' '}
                            <strong className="uppercase">{selectedLead.debrisHauling}</strong>
                          </span>
                          <span>
                            Customer Requested:{' '}
                            <strong>
                              {selectedLead.preferredDate ? `${selectedLead.preferredDate} · ` : ''}
                              {selectedLead.preferredTimeframe}
                            </strong>
                          </span>
                        </div>
                        {selectedLead.additionalDetails && (
                          <p className="text-xs text-[#434A45] pt-1">
                            <strong>Additional Notes:</strong> {selectedLead.additionalDetails}
                          </p>
                        )}
                      </div>

                      {/* Job Scheduling + Double-Booking Prevention */}
                      <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#D4D0C5] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-display font-bold text-base text-[#161917] flex items-center gap-1.5">
                            <CalendarClock className="w-4 h-4 text-[#E86F14]" />
                            <span>Book Job Date &amp; Time Slot</span>
                          </h3>
                          {selectedLead.scheduledDate && (
                            <span className="font-mono text-xs font-bold text-[#166534]">
                              Currently booked: {selectedLead.scheduledDate} · {selectedLead.scheduledTime}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                          <div className="sm:col-span-4">
                            <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                              Job Date
                            </label>
                            <input
                              type="date"
                              value={schedDate}
                              onChange={(e) => {
                                setSchedDate(e.target.value);
                                setScheduleError('');
                                setScheduleSuccess('');
                              }}
                              className="w-full px-3 py-2 min-h-[38px] rounded-lg border border-[#CFCBC0] bg-white text-xs sm:text-sm font-mono"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                              Arrival Time Slot
                            </label>
                            <select
                              value={schedTime}
                              onChange={(e) => {
                                setSchedTime(e.target.value);
                                setScheduleError('');
                                setScheduleSuccess('');
                              }}
                              className="w-full px-3 py-2 min-h-[38px] rounded-lg border border-[#CFCBC0] bg-white text-xs sm:text-sm font-mono"
                            >
                              {STANDARD_TIME_SLOTS.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-4 flex gap-2">
                            <button
                              type="button"
                              disabled={savingSchedule || Boolean(liveConflictSlot)}
                              onClick={handleScheduleJob}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] bg-[#E86F14] text-[#141715] font-bold text-xs rounded-lg hover:bg-[#F37F24] disabled:opacity-50 cursor-pointer"
                            >
                              {savingSchedule ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Book Slot</span>
                            </button>
                            {selectedLead.scheduledSlotKey && (
                              <button
                                type="button"
                                disabled={savingSchedule}
                                onClick={handleClearSchedule}
                                className="px-3 py-2 min-h-[38px] border border-[#D4D0C5] bg-white text-xs font-semibold rounded-lg hover:bg-[#EFECE3] cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        {liveConflictSlot && (
                          <div
                            role="alert"
                            className="p-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/40 text-xs text-[#991B1B] flex items-start gap-2"
                          >
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                              <strong>Slot Already Booked (Double-Booking Blocked):</strong>{' '}
                              {liveConflictSlot.scheduledDate} at {liveConflictSlot.scheduledTime} is
                              reserved for Ref {liveConflictSlot.requestId} ({liveConflictSlot.customerName}
                              , {liveConflictSlot.city}). Pick another date or time slot.
                            </span>
                          </div>
                        )}

                        {scheduleError && !liveConflictSlot && (
                          <p className="text-xs text-[#991B1B] font-semibold">{scheduleError}</p>
                        )}
                        {scheduleSuccess && (
                          <p className="text-xs text-[#166534] font-semibold">{scheduleSuccess}</p>
                        )}
                      </div>

                      {/* Private Photos */}
                      <div className="space-y-2">
                        <p className="text-xs font-mono uppercase tracking-wider text-[#535B55] flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" /> Private Project Photos (
                          {selectedLead.photoCount})
                        </p>
                        {loadingPhotos ? (
                          <p className="text-xs text-[#535B55]">Loading private photos...</p>
                        ) : photos.length === 0 ? (
                          <p className="text-xs text-[#535B55]">
                            No photos attached to this request.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {photos.map((photo) => (
                              <a
                                key={photo.photoId}
                                href={photo.dataUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block border border-[#D4D0C5] rounded-lg overflow-hidden bg-[#F8F7F3]"
                              >
                                <img
                                  src={photo.dataUrl}
                                  alt={photo.fileName}
                                  className="w-full h-32 object-cover"
                                />
                                <p className="px-2 py-1 text-[11px] text-[#535B55] truncate">
                                  {photo.fileName}
                                </p>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Owner Notes & Follow-Up */}
                      <div className="pt-4 border-t border-[#ECE9DF] space-y-4">
                        <h3 className="font-display font-bold text-base text-[#161917]">
                          Owner Notes &amp; Quick Summary
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                              Quoted Summary Amount
                            </label>
                            <input
                              type="text"
                              value={editEstimateAmount}
                              onChange={(e) => setEditEstimateAmount(e.target.value)}
                              placeholder="$280"
                              className="w-full px-3 py-2 min-h-[40px] rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                              Follow-Up Reminder Date
                            </label>
                            <input
                              type="date"
                              value={editFollowUpDate}
                              onChange={(e) => setEditFollowUpDate(e.target.value)}
                              className="w-full px-3 py-2 min-h-[40px] rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-sm font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                            Private Internal Notes
                          </label>
                          <textarea
                            rows={3}
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Gate code, material cost notes, dump fee estimate, follow-up details..."
                            className="w-full px-3 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-sm"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            disabled={savingLead}
                            onClick={handleSaveAdminChanges}
                            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] bg-[#143326] text-[#F8F7F3] text-sm font-semibold rounded-lg hover:bg-[#1B4332] disabled:opacity-50 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>{savingLead ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                          {saveMessage && (
                            <span className="text-xs font-medium text-[#143326]">{saveMessage}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {detailTab === 'quotes' && (
                    <QuoteInvoicePanel
                      key={selectedLead.requestId}
                      lead={selectedLead}
                      quotes={quotes}
                      expenses={expenses}
                      totalPaidCents={totalPaidCents}
                      onQuotesChanged={() => loadLeadSubRecords(selectedLead)}
                      onMarkEstimateSent={() => handlePipelineStageClick('Estimate Sent')}
                    />
                  )}

                  {detailTab === 'payments' && (
                    <PaymentsExpensesPanel
                      key={selectedLead.requestId}
                      requestId={selectedLead.requestId}
                      jobTotalCents={activeJobTotalCents}
                      payments={payments}
                      expenses={expenses}
                      onRefresh={() => loadLeadSubRecords(selectedLead)}
                    />
                  )}

                  {detailTab === 'contacts' && (
                    <ContactHistoryPanel
                      key={selectedLead.requestId}
                      requestId={selectedLead.requestId}
                      contacts={contacts}
                      onRefresh={() => loadLeadSubRecords(selectedLead)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
