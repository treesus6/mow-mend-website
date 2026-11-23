import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Info, Phone, ShieldAlert } from 'lucide-react';
import { BUSINESS_INFO } from '../config/business.ts';
import { PRICING_CONFIG } from '../config/pricing.ts';
import { useCatalog } from '../context/CatalogContext.tsx';
import { SERVICE_CATEGORIES, type ServiceCategoryKey } from '../data/services.ts';

interface ServicesPageProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

export function ServicesPage({ slug, onNavigate }: ServicesPageProps) {
  const { services, pricingEntries, getServiceBySlug } = useCatalog();
  const [categoryFilter, setCategoryFilter] = useState<'all' | ServiceCategoryKey>('all');

  if (slug) {
    const service = getServiceBySlug(slug);
    if (!service) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="font-display font-extrabold uppercase text-2xl mb-3">Service not found</h1>
          <p className="text-sm text-[#525753] mb-6">
            The requested service page could not be located. Browse our full list of yard and home
            services below.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/services')}
            className="px-5 py-2.5 bg-[#141715] text-[#F5F2EA] text-sm font-semibold rounded-lg cursor-pointer"
          >
            View All Services
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/services')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#141715] hover:text-[#B8520A] hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E86F14]" />
            <span>All Yard &amp; Home Services</span>
          </button>

          <p className="text-xs font-mono text-[#525753] mb-2">
            {service.number}. {service.categoryLabel} · Clark County, WA
          </p>
          <h1
            className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            {service.title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#3D423E] max-w-3xl leading-relaxed">
            {service.oneLiner}
          </p>

          <div className="mt-5 p-4 rounded-xl bg-white border border-[#D6D1C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#525753]">
                Starting Estimate / Typical Range (Never a Guaranteed Quote)
              </p>
              <p className="font-mono font-bold text-lg text-[#B8520A] tabular-nums mt-0.5">
                {service.priceLabel}
              </p>
            </div>
            <div className="text-xs text-[#525753] max-w-sm">
              <p className="font-semibold text-[#141715]">
                Written Quote Lines: {service.costLines.join(' · ')}
              </p>
              <p className="mt-0.5">{PRICING_CONFIG.depositPolicy.label}</p>
              <p className="mt-0.5">{PRICING_CONFIG.tripFee.detail}</p>
            </div>
          </div>

          {service.seasonalNote && (
            <p className="mt-3 text-xs font-mono text-[#B8520A]">
              Seasonal note: {service.seasonalNote}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-[#D6D1C4] rounded-xl p-6 sm:p-7 space-y-4">
            <h2 className="font-display font-bold uppercase text-xl text-[#141715]">
              What Is Included
            </h2>
            <ul className="space-y-3 text-sm text-[#232724]">
              {service.included.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E86F14] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-[#D6D1C4] rounded-xl p-6 sm:p-7 space-y-4">
            <h2 className="font-display font-bold uppercase text-xl text-[#141715]">
              Helpful Info for Your Estimate
            </h2>
            <ul className="space-y-3 text-sm text-[#232724]">
              {service.helpfulInfoForEstimate.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#E86F14] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="bg-[#EAE5D8] border border-[#D6D1C4] rounded-xl p-6 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#141715] shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-sm text-[#232724]">
              <h2 className="font-display font-bold text-base text-[#141715]">
                Pricing, Scope &amp; Service Area
              </h2>
              <p>{service.scopeBoundaries}</p>
              <p className="text-xs text-[#525753]">{PRICING_CONFIG.generalDisclaimer}</p>
              <p className="text-xs text-[#525753]">
                Offered throughout Vancouver, Hazel Dell, Salmon Creek, Orchards, Five Corners,
                Battle Ground, Ridgefield, Camas, La Center, and Brush Prairie, WA.{' '}
                {BUSINESS_INFO.licensedContractorLabel}.
              </p>
            </div>
          </div>
        </section>

        <div className="bg-[#141715] text-[#F5F2EA] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-display font-bold uppercase text-2xl">
              Ready for a custom estimate on {service.shortTitle}?
            </h2>
            <p className="text-sm text-[#C8C3B4] mt-1">
              Send project details and up to 5 photos online, or call/text {BUSINESS_INFO.phoneDisplay}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                onNavigate(`/estimate?service=${encodeURIComponent(service.title)}`)
              }
              className="px-5 py-3 min-h-[44px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm rounded-lg hover:bg-[#F37F24] transition-colors cursor-pointer"
            >
              Request Custom Estimate
            </button>
            <a
              href={BUSINESS_INFO.phoneHref}
              className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[44px] border border-[#3B423D] bg-[#212623] text-[#F5F2EA] text-sm font-semibold rounded-lg hover:bg-[#2C332F] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F59E0B]" />
              <span className="font-mono">{BUSINESS_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const filteredServices = services.filter((s) =>
    categoryFilter === 'all' ? true : s.category === categoryFilter
  );

  const allPricingEntries = pricingEntries;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="flex flex-col gap-6 pb-8 border-b border-[#D6D1C4]">
        <div className="max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
            Services Directory · Clark County, WA
          </p>
          <h1
            className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Yard Maintenance, Exterior Cleaning &amp; Handyman Services
          </h1>
          <p className="mt-3 text-base text-[#3D423E] leading-relaxed">
            {PRICING_CONFIG.generalDisclaimer} Select a category below to explore included tasks and
            starting estimates.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter services by category"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EAE5D8] border border-[#D6D1C4] rounded-lg self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#141715] text-[#F5F2EA]'
                : 'text-[#3D423E] hover:text-[#141715]'
            }`}
          >
            All ({services.length})
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={categoryFilter === cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === cat.key
                  ? 'bg-[#141715] text-[#F5F2EA]'
                  : 'text-[#3D423E] hover:text-[#141715]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <article
            key={service.id}
            className="bg-white border border-[#D6D1C4] rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#525753]">
                <span>
                  {service.number}. {service.categoryLabel}
                </span>
                {service.seasonalNote && (
                  <span className="text-[#B8520A] font-sans font-semibold">Seasonal</span>
                )}
              </div>

              <h2 className="font-display font-bold text-2xl text-[#141715]">
                <a
                  href={`/services/${service.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/services/${service.slug}`);
                  }}
                  className="hover:text-[#B8520A] transition-colors"
                >
                  {service.title}
                </a>
              </h2>

              <p className="text-sm text-[#3D423E] leading-relaxed">{service.oneLiner}</p>

              <div className="p-3 rounded-lg bg-[#F5F2EA] border border-[#E2DDD0] space-y-1">
                <p className="text-xs font-mono font-bold text-[#B8520A] tabular-nums">
                  {service.priceLabel}
                </p>
                <p className="text-[11px] text-[#525753]">
                  Quote lines: {service.costLines.join(' · ')}
                </p>
              </div>

              <ul className="space-y-1.5 pt-1 text-xs sm:text-sm text-[#232724]">
                {service.included.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#E86F14] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-[#525753] pt-2 border-t border-[#ECE8DC]">
                {service.scopeBoundaries}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate(`/services/${service.slug}`)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#141715] hover:text-[#B8520A] hover:underline cursor-pointer"
              >
                <span>Full service details</span>
                <ArrowRight className="w-4 h-4 text-[#E86F14]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate(`/estimate?service=${encodeURIComponent(service.title)}`)
                }
                className="px-4 py-2 min-h-[40px] rounded-lg bg-[#E86F14] text-[#141715] text-xs sm:text-sm font-bold hover:bg-[#F37F24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Request Custom Estimate
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Common Everyday Handyman Checklist */}
      <section className="bg-white border border-[#D6D1C4] rounded-xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#ECE8DC]">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold">
              Everyday Handyman Punch-List
            </p>
            <h2 className="font-display font-bold uppercase text-2xl sm:text-3xl text-[#141715] mt-1">
              Common small home &amp; rental repairs we handle
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              onNavigate(
                `/estimate?service=${encodeURIComponent(
                  'Cabinets, Doors, Locks, Shelving & Furniture Assembly'
                )}`
              )
            }
            className="self-start sm:self-auto px-4 py-2.5 min-h-[40px] rounded-lg bg-[#141715] text-[#F5F2EA] text-xs font-semibold hover:bg-[#232825] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Send Your Punch-List
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm text-[#232724]">
          {[
            'Kitchen & bathroom sink faucet swaps',
            'Cabinet hinges, misaligned doors & drawer slides',
            'Sticking interior/exterior doors & weatherstripping',
            'Doorknob, deadbolt & lock hardware replacements',
            'Drywall hole patches & interior room painting',
            'Tub, shower, sink & baseboard caulking',
            'Showerheads, toilet flappers, fill valves & installs',
            'Stud-mounted shelving, blinds, curtain rods & TVs',
            'Baseboard, trim, fascia & minor carpentry repairs',
            'Flat-pack furniture assembly & storage racks',
            'Fence posts, broken pickets, sagging gates & latches',
            'Small concrete patches, minor hauling & rental turnovers',
          ].map((task) => (
            <div key={task} className="flex items-start gap-2 py-1">
              <Check className="w-4 h-4 text-[#E86F14] shrink-0 mt-0.5" />
              <span>{task}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Complete Starting Price Guide (100% driven by src/config/pricing.ts) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-1">
              Complete Starting Price Guide
            </p>
            <h2 className="font-display font-extrabold uppercase text-2xl sm:text-3xl text-[#141715]">
              All Starting Estimates &amp; Typical Job Ranges
            </h2>
            <p className="mt-2 text-sm text-[#3D423E] leading-relaxed">
              {PRICING_CONFIG.generalDisclaimer}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#141715] text-[#F5F2EA] text-xs space-y-1.5 sm:max-w-sm">
            <div>
              <p className="font-mono text-[#F59E0B] font-semibold uppercase">Deposit Policy</p>
              <p>{PRICING_CONFIG.depositPolicy.label}</p>
            </div>
            <div className="pt-1.5 border-t border-[#2E3430]">
              <p className="font-mono text-[#F59E0B] font-semibold uppercase">Trip Fee</p>
              <p className="text-[#D5D1C5] leading-relaxed">{PRICING_CONFIG.tripFee.detail}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#D6D1C4] rounded-xl overflow-hidden">
          <div className="hidden sm:grid sm:grid-cols-12 px-5 py-3 bg-[#141715] text-[#F5F2EA] text-xs font-mono uppercase tracking-wider">
            <span className="col-span-5">Task / Service</span>
            <span className="col-span-3">Written Quote Lines</span>
            <span className="col-span-4 text-right">Starting Estimate / Range</span>
          </div>
          <div className="divide-y divide-[#ECE8DC]">
            {allPricingEntries.map((entry) => (
              <div
                key={entry.id}
                className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start sm:items-center"
              >
                <div className="sm:col-span-5">
                  <p className="text-sm font-bold text-[#141715]">{entry.label}</p>
                  <p className="text-xs text-[#525753] mt-0.5">{entry.notes}</p>
                </div>
                <div className="sm:col-span-3 text-xs text-[#525753]">
                  <span className="sm:hidden font-semibold text-[#141715]">Quote lines: </span>
                  {entry.applicableLines.join(' · ')}
                </div>
                <div className="sm:col-span-4 sm:text-right">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#B8520A] tabular-nums">
                    {entry.startingDisplay}
                  </span>
                </div>
              </div>
            ))}
            <div className="px-5 py-3.5 bg-[#F5F2EA] grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start sm:items-center">
              <div className="sm:col-span-5">
                <p className="text-sm font-bold text-[#141715]">On-Site Estimate Visit (Trip Fee)</p>
                <p className="text-xs text-[#525753] mt-0.5">
                  Send clear photos online or by text for free pricing before scheduling a site visit.
                </p>
              </div>
              <div className="sm:col-span-3 text-xs text-[#525753]">
                Credited toward job if booked
              </div>
              <div className="sm:col-span-4 sm:text-right">
                <span className="text-xs sm:text-sm font-mono font-bold text-[#B8520A] tabular-nums">
                  {PRICING_CONFIG.tripFee.detail}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#EAE5D8] border border-[#D6D1C4] rounded-xl p-5 text-xs sm:text-sm text-[#3D423E] leading-relaxed space-y-1.5">
          <p>
            <strong className="text-[#141715]">Written Estimate Breakdown:</strong>{' '}
            {PRICING_CONFIG.lineItemExplanation}
          </p>
          <p>
            <strong className="text-[#141715]">Deposit Terms:</strong>{' '}
            {PRICING_CONFIG.depositPolicy.detail}
          </p>
          <p>
            <strong className="text-[#141715]">On-Site Trip Fee:</strong>{' '}
            {PRICING_CONFIG.tripFee.detail}
          </p>
        </div>
      </section>

      {/* Scope Boundary Notice */}
      <section className="bg-white border border-[#D6D1C4] rounded-xl p-6 text-sm text-[#3D423E] leading-relaxed">
        <strong className="text-[#141715]">Work Scope &amp; Licensing Notice:</strong>{' '}
        {BUSINESS_INFO.legalName} ({BUSINESS_INFO.licensedContractorLabel}) handles yard
        maintenance, exterior cleaning, fence/gate/deck repairs, like-for-like plumbing fixture
        swaps, and permitted general handyman maintenance across Clark County, WA. We do not
        perform electrical circuit wiring, regulated plumbing re-piping or water heaters, chemical
        pesticide application, or structural remodeling.
      </section>
    </div>
  );
}
