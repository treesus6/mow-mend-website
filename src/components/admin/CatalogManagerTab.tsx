import { useEffect, useState } from 'react';
import { Check, Loader2, RotateCcw, Save } from 'lucide-react';
import { PRICING_CONFIG, type PricingKey } from '../../config/pricing.ts';
import { useCatalog } from '../../context/CatalogContext.tsx';
import { SERVICES } from '../../data/services.ts';
import {
  deletePricingOverride,
  deleteServiceOverride,
  savePricingOverride,
  saveServiceOverride,
} from '../../lib/firebase.ts';

interface ServiceDraft {
  title: string;
  shortTitle: string;
  oneLiner: string;
}

interface PricingDraft {
  label: string;
  startingDisplay: string;
  notes: string;
}

export function CatalogManagerTab() {
  const { services, pricingEntries, serviceOverrides, pricingOverrides } = useCatalog();
  const [subTab, setSubTab] = useState<'services' | 'pricing'>('services');

  const [serviceDrafts, setServiceDrafts] = useState<Record<string, ServiceDraft>>({});
  const [pricingDrafts, setPricingDrafts] = useState<Record<string, PricingDraft>>({});

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const nextSvc: Record<string, ServiceDraft> = {};
    for (const s of services) {
      nextSvc[s.id] = {
        title: s.title,
        shortTitle: s.shortTitle,
        oneLiner: s.oneLiner,
      };
    }
    setServiceDrafts(nextSvc);
  }, [services]);

  useEffect(() => {
    const nextPrice: Record<string, PricingDraft> = {};
    for (const p of pricingEntries) {
      nextPrice[p.id] = {
        label: p.label,
        startingDisplay: p.startingDisplay,
        notes: p.notes,
      };
    }
    setPricingDrafts(nextPrice);
  }, [pricingEntries]);

  const handleSaveService = async (serviceId: string) => {
    const draft = serviceDrafts[serviceId];
    if (!draft) return;
    if (draft.title.trim().length < 2 || draft.shortTitle.trim().length < 2 || draft.oneLiner.trim().length < 5) {
      setErrorMsg('Service title, short title, and description must not be blank.');
      return;
    }
    setErrorMsg('');
    setSavingKey(`svc:${serviceId}`);
    try {
      await saveServiceOverride({
        serviceId,
        title: draft.title,
        shortTitle: draft.shortTitle,
        oneLiner: draft.oneLiner,
      });
      setSavedKey(`svc:${serviceId}`);
      setTimeout(() => setSavedKey((curr) => (curr === `svc:${serviceId}` ? null : curr)), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save service update.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleResetService = async (serviceId: string) => {
    setErrorMsg('');
    setSavingKey(`svc:${serviceId}`);
    try {
      await deleteServiceOverride(serviceId);
      const base = SERVICES.find((s) => s.id === serviceId);
      if (base) {
        setServiceDrafts((prev) => ({
          ...prev,
          [serviceId]: {
            title: base.title,
            shortTitle: base.shortTitle,
            oneLiner: base.oneLiner,
          },
        }));
      }
      setSavedKey(`svc:${serviceId}`);
      setTimeout(() => setSavedKey((curr) => (curr === `svc:${serviceId}` ? null : curr)), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reset service.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSavePricing = async (pricingKey: string) => {
    const draft = pricingDrafts[pricingKey];
    if (!draft) return;
    if (draft.label.trim().length < 2 || draft.startingDisplay.trim().length < 2) {
      setErrorMsg('Pricing label and starting price text are required.');
      return;
    }
    setErrorMsg('');
    setSavingKey(`price:${pricingKey}`);
    try {
      await savePricingOverride({
        pricingKey,
        label: draft.label,
        startingDisplay: draft.startingDisplay,
        notes: draft.notes,
      });
      setSavedKey(`price:${pricingKey}`);
      setTimeout(() => setSavedKey((curr) => (curr === `price:${pricingKey}` ? null : curr)), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save pricing update.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleResetPricing = async (pricingKey: string) => {
    setErrorMsg('');
    setSavingKey(`price:${pricingKey}`);
    try {
      await deletePricingOverride(pricingKey);
      const base = PRICING_CONFIG.entries[pricingKey as PricingKey];
      if (base) {
        setPricingDrafts((prev) => ({
          ...prev,
          [pricingKey]: {
            label: base.label,
            startingDisplay: base.startingDisplay,
            notes: base.notes,
          },
        }));
      }
      setSavedKey(`price:${pricingKey}`);
      setTimeout(() => setSavedKey((curr) => (curr === `price:${pricingKey}` ? null : curr)), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reset pricing entry.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#D4D0C5] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-[#161917]">
            Live Services &amp; Pricing Editor
          </h2>
          <p className="text-xs sm:text-sm text-[#434A45] mt-1">
            Edits save to Firestore and immediately update the public Homepage, Services directory,
            Price Guide, and Estimate Form. Static defaults can be restored anytime.
          </p>
        </div>

        <div className="inline-flex p-1 bg-[#EFECE3] border border-[#D4D0C5] rounded-lg self-start shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('services')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'services' ? 'bg-[#143326] text-[#F8F7F3]' : 'text-[#3E453F]'
            }`}
          >
            Services ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('pricing')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'pricing' ? 'bg-[#143326] text-[#F8F7F3]' : 'text-[#3E453F]'
            }`}
          >
            Starting Prices ({pricingEntries.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 text-xs sm:text-sm text-[#991B1B]">
          {errorMsg}
        </div>
      )}

      {subTab === 'services' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc) => {
            const draft = serviceDrafts[svc.id] ?? {
              title: svc.title,
              shortTitle: svc.shortTitle,
              oneLiner: svc.oneLiner,
            };
            const isOverridden = Boolean(serviceOverrides[svc.id]);
            const isSaving = savingKey === `svc:${svc.id}`;
            const isSaved = savedKey === `svc:${svc.id}`;

            return (
              <div
                key={svc.id}
                className="bg-white border border-[#D4D0C5] rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#535B55]">
                  <span>
                    {svc.number}. {svc.categoryLabel}
                  </span>
                  <span className={isOverridden ? 'text-[#B8520A] font-semibold' : ''}>
                    {isOverridden ? 'Custom Saved' : 'Default'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                    Full Service Name
                  </label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) =>
                      setServiceDrafts((prev) => ({
                        ...prev,
                        [svc.id]: { ...draft, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 min-h-[38px] rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-sm font-semibold text-[#161917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                    Short Card Label
                  </label>
                  <input
                    type="text"
                    value={draft.shortTitle}
                    onChange={(e) =>
                      setServiceDrafts((prev) => ({
                        ...prev,
                        [svc.id]: { ...draft, shortTitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 min-h-[38px] rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-sm text-[#161917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                    One-Line Description
                  </label>
                  <textarea
                    rows={2}
                    value={draft.oneLiner}
                    onChange={(e) =>
                      setServiceDrafts((prev) => ({
                        ...prev,
                        [svc.id]: { ...draft, oneLiner: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs sm:text-sm text-[#161917]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSaveService(svc.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] bg-[#143326] text-[#F8F7F3] text-xs font-semibold rounded-lg hover:bg-[#1B4332] disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isSaved ? (
                      <Check className="w-3.5 h-3.5 text-[#F59E0B]" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaved ? 'Saved Live' : 'Save Service'}</span>
                  </button>

                  {isOverridden && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleResetService(svc.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] border border-[#D4D0C5] rounded-lg text-xs font-semibold text-[#3E453F] hover:bg-[#EFECE3] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Default</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {pricingEntries.map((entry) => {
            const draft = pricingDrafts[entry.id] ?? {
              label: entry.label,
              startingDisplay: entry.startingDisplay,
              notes: entry.notes,
            };
            const isOverridden = Boolean(pricingOverrides[entry.id]);
            const isSaving = savingKey === `price:${entry.id}`;
            const isSaved = savedKey === `price:${entry.id}`;

            return (
              <div
                key={entry.id}
                className="bg-white border border-[#D4D0C5] rounded-xl p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3 items-end"
              >
                <div className="lg:col-span-4">
                  <p className="text-[11px] font-mono text-[#535B55] mb-1">
                    {entry.categoryLabel} · {isOverridden ? 'Custom Saved' : 'Default'}
                  </p>
                  <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                    Price Guide Label
                  </label>
                  <input
                    type="text"
                    value={draft.label}
                    onChange={(e) =>
                      setPricingDrafts((prev) => ({
                        ...prev,
                        [entry.id]: { ...draft, label: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 min-h-[38px] rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-sm font-semibold text-[#161917]"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                    Starting Price / Range
                  </label>
                  <input
                    type="text"
                    value={draft.startingDisplay}
                    onChange={(e) =>
                      setPricingDrafts((prev) => ({
                        ...prev,
                        [entry.id]: { ...draft, startingDisplay: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 min-h-[38px] rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-sm font-mono font-bold text-[#B8520A]"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-semibold text-[#3E453F] mb-1">
                    Scope Note
                  </label>
                  <input
                    type="text"
                    value={draft.notes}
                    onChange={(e) =>
                      setPricingDrafts((prev) => ({
                        ...prev,
                        [entry.id]: { ...draft, notes: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 min-h-[38px] rounded-lg border border-[#CFCBC0] bg-[#FAF9F6] text-xs text-[#161917]"
                  />
                </div>

                <div className="lg:col-span-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSavePricing(entry.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] bg-[#143326] text-[#F8F7F3] text-xs font-semibold rounded-lg hover:bg-[#1B4332] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isSaved ? (
                      <Check className="w-3.5 h-3.5 text-[#F59E0B]" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  {isOverridden && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleResetPricing(entry.id)}
                      title="Reset to default pricing"
                      aria-label={`Reset ${entry.label} to default`}
                      className="inline-flex items-center justify-center p-2 min-h-[38px] border border-[#D4D0C5] rounded-lg text-xs text-[#3E453F] hover:bg-[#EFECE3] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
