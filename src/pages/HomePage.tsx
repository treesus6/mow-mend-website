import {
  ArrowRight,
  Check,
  Hammer,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Trees,
  Wrench,
} from 'lucide-react';
import { BeforeAfterCompare } from '../components/BeforeAfterCompare.tsx';
import { ContractorToolBag } from '../components/ContractorToolBag.tsx';
import { EstimateForm } from '../components/EstimateForm.tsx';
import { BUSINESS_INFO } from '../config/business.ts';
import { PRICING_CONFIG, type PricingKey } from '../config/pricing.ts';
import { useCatalog } from '../context/CatalogContext.tsx';
import { COMPLETED_JOB_PHOTOS, PROJECT_SHOWCASE } from '../data/projects.ts';
import {
  SERVICE_CATEGORIES,
  type ServiceCategoryKey,
} from '../data/services.ts';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const FEATURED_SERVICE_IDS = [
  'lawn-mowing',
  'pressure-washing',
  'faucet-toilet-plumbing-fixtures',
  'handyman-hardware-assembly',
  'fence-gate-deck-repairs',
  'holiday-lights',
];

const HOME_PRICING_KEYS: PricingKey[] = [
  'smallLawnMowing',
  'leafCleanup',
  'yardCleanup',
  'brushRemoval',
  'pressureWashDriveway',
  'pressureWashHouse',
  'gutterCleaning',
  'fenceGateRepair',
  'fencePostReplacement',
  'faucetBath',
  'faucetKitchen',
  'toiletRepair',
  'toiletInstall',
  'handymanGeneral',
  'handymanSkilledCarpentry',
  'drywallPatching',
  'interiorPainting',
  'holidayLights',
];

function CategoryIcon({ category }: { category: ServiceCategoryKey }) {
  switch (category) {
    case 'lawn-yard':
      return <Trees className="w-5 h-5 text-[#E86F14]" />;
    case 'exterior-cleaning':
      return <Sparkles className="w-5 h-5 text-[#E86F14]" />;
    case 'handyman-repairs':
      return <Wrench className="w-5 h-5 text-[#E86F14]" />;
    case 'additional':
      return <Hammer className="w-5 h-5 text-[#E86F14]" />;
  }
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { services, pricingByKey, getServicesByCategory } = useCatalog();

  const featuredServices = FEATURED_SERVICE_IDS.map((id) =>
    services.find((s) => s.id === id)
  ).filter((s): s is (typeof services)[number] => Boolean(s));

  const homePricingHighlights = HOME_PRICING_KEYS.map((key) => pricingByKey[key]);

  return (
    <div>
      {/* Hero Section — Industrial Charcoal Workwear Stage */}
      <section className="bg-[#141715] bg-workwear-grid text-[#F5F2EA] border-b-4 border-[#E86F14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-7 min-w-0 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono text-[#D5D1C5] tracking-wide">
                  <span className="w-7 h-0.5 bg-[#E86F14]" aria-hidden="true" />
                  <span>Vancouver &amp; Clark County, WA</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#F59E0B]">{BUSINESS_INFO.licensedContractorLabel}</span>
                </div>

                <h1
                  className="font-display font-extrabold uppercase tracking-[0.01em] text-[#F5F2EA] leading-[0.95]"
                  style={{ fontSize: 'clamp(2.4rem, 5.2vw, 4.3rem)', textWrap: 'balance' }}
                >
                  Your yard. Your home.{' '}
                  <span className="text-[#F59E0B]">One reliable local company.</span>
                </h1>

                <p className="text-base sm:text-lg text-[#D8D4C8] max-w-2xl leading-relaxed">
                  Owner-operated mowing, brush clearing, pressure washing, and gutter cleaning—plus
                  everyday handyman repairs like sink faucet swaps, cabinet hardware, drywall
                  patching, interior painting, doors, locks, and fences across Clark County.
                </p>

                <p className="text-base font-display font-bold uppercase tracking-wider text-[#F59E0B]">
                  &ldquo;{BUSINESS_INFO.tagline}&rdquo;
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <a
                  href="/estimate"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/estimate');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-lg rounded-lg hover:bg-[#F37F24] transition-colors whitespace-nowrap"
                >
                  <span>Request a Free Estimate</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={BUSINESS_INFO.phoneHref}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] bg-[#212623] border border-[#3B423D] text-[#F5F2EA] text-sm font-semibold rounded-lg hover:bg-[#2C332F] transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4 text-[#F59E0B]" />
                    <span className="font-mono tabular-nums">{BUSINESS_INFO.phoneDisplay}</span>
                  </a>
                  <a
                    href={BUSINESS_INFO.smsHref}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] bg-[#212623] border border-[#3B423D] text-[#F5F2EA] text-sm font-semibold rounded-lg hover:bg-[#2C332F] transition-colors whitespace-nowrap"
                  >
                    <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
                    <span>Text</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Official Smokiey Mascot + Contractor Tool Bag Stage */}
            <aside className="lg:col-span-5 min-w-0 bg-[#1D211E] border border-[#343A36] rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5">
              <div className="bg-[#F5F2EA] bg-shop-dots border-2 border-[#E86F14] rounded-lg px-4 py-5 flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 overflow-hidden">
                <img
                  src="/images/smokiey-mascot.png"
                  alt="Smokiey the Mower mascot holding a hammer for MOW & MEND LLC"
                  referrerPolicy="no-referrer"
                  className="max-h-44 sm:max-h-52 max-w-full w-auto object-contain"
                />
                <ContractorToolBag className="w-28 sm:w-32 max-w-full h-auto shrink-0 sm:mb-1" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#303632]">
                  <span className="font-display font-bold uppercase tracking-wide text-base text-[#F5F2EA]">
                    Yard + Home Dispatch
                  </span>
                  <span className="text-xs font-mono text-[#F59E0B]">
                    {BUSINESS_INFO.contractorRegistration}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#D5D1C5] leading-relaxed">
                  Serving {BUSINESS_INFO.serviceAreas.map((a) => a.name).join(', ')} (Clark County,
                  WA only).
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#C8C3B4] pt-1">
                  <a
                    href={BUSINESS_INFO.emailHref}
                    className="inline-flex items-center gap-1.5 hover:text-[#F59E0B] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#E86F14]" />
                    <span>{BUSINESS_INFO.email}</span>
                  </a>
                  <span aria-hidden="true">·</span>
                  <span>Attach up to 5 job photos online</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Four Service Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
              Four Core Service Divisions
            </p>
            <h2
              className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              One local call for yard care, washing, and handyman work
            </h2>
            <p className="mt-2.5 text-base text-[#3D423E] leading-relaxed">
              Practical workmanship for Clark County homeowners, landlords, and small property
              managers—without juggling separate crews.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/services')}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-lg border border-[#C8C3B4] bg-white text-sm font-semibold text-[#141715] hover:bg-[#EAE5D8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Browse Full Catalog ({services.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICE_CATEGORIES.map((category) => {
            const catServices = getServicesByCategory(category.key);
            return (
              <div
                key={category.key}
                className="min-w-0 bg-white border border-[#D6D1C4] rounded-xl p-5 sm:p-7 flex flex-col justify-between gap-6"
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryIcon category={category.key} />
                      <h3 className="font-display font-extrabold uppercase text-2xl text-[#141715]">
                        {category.label}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-[#525753] tabular-nums shrink-0">
                      {catServices.length} services
                    </span>
                  </div>

                  <p className="text-sm text-[#3D423E] leading-relaxed mb-4">{category.tagline}</p>

                  <ul className="divide-y divide-[#ECE8DC] border-y border-[#ECE8DC]">
                    {catServices.map((svc) => (
                      <li
                        key={svc.id}
                        className="py-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-3"
                      >
                        <a
                          href={`/services/${svc.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/services/${svc.slug}`);
                          }}
                          className="text-sm font-semibold text-[#141715] hover:text-[#B8520A] transition-colors min-w-0"
                        >
                          {svc.shortTitle}
                        </a>
                        <span className="text-xs font-mono text-[#525753] sm:text-right sm:max-w-[58%] tabular-nums leading-snug break-words">
                          {svc.priceLabel}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/services')}
                  className="self-start inline-flex items-center gap-1.5 text-sm font-bold text-[#141715] hover:text-[#B8520A] transition-colors cursor-pointer"
                >
                  <span>See scope &amp; starting estimates</span>
                  <ArrowRight className="w-4 h-4 text-[#E86F14]" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Services with One-Line Descriptions & Starting Estimates */}
      <section className="bg-[#EAE5D8]/65 bg-shop-dots border-y border-[#D6D1C4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
                Featured Services
              </p>
              <h2
                className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Everyday yard &amp; repair work with transparent starting rates
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/services')}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-lg border border-[#C8C3B4] bg-white text-sm font-semibold text-[#141715] hover:bg-[#F5F2EA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>All {services.length} Services &amp; Price Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredServices.map((service) => (
              <article
                key={service.id}
                className="min-w-0 bg-white border border-[#D6D1C4] rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#525753]">
                    <span className="break-words">
                      {service.number}. {service.categoryLabel}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#141715] leading-snug break-words">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[#3D423E] leading-relaxed">{service.oneLiner}</p>

                  <div className="pt-2 border-t border-[#ECE8DC] space-y-1">
                    <p className="text-xs font-mono font-bold text-[#141715] tabular-nums break-words">
                      {service.priceLabel}
                    </p>
                    <p className="text-[11px] text-[#525753] break-words">
                      Estimate lines: {service.costLines.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ECE8DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/services/${service.slug}`)}
                    className="font-semibold text-[#141715] hover:text-[#B8520A] hover:underline cursor-pointer"
                  >
                    See what&apos;s included
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate(`/estimate?service=${encodeURIComponent(service.title)}`)
                    }
                    className="font-bold text-[#B8520A] hover:underline cursor-pointer"
                  >
                    Request estimate
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Starting Price Guide & Deposit Policy (sourced strictly from src/config/pricing.ts) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 min-w-0 space-y-4">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold">
              Starting Price Guide
            </p>
            <h2
              className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Clear starting estimates—never surprise billing
            </h2>
            <p className="text-sm text-[#3D423E] leading-relaxed">
              {PRICING_CONFIG.generalDisclaimer}
            </p>

            <div className="p-4 rounded-xl bg-[#141715] text-[#F5F2EA] space-y-2.5">
              <p className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-semibold">
                Separate Quote Lines, Deposit &amp; Trip Fee
              </p>
              <p className="text-xs text-[#D5D1C5] leading-relaxed">
                {PRICING_CONFIG.lineItemExplanation}
              </p>
              <p className="text-xs font-semibold text-[#F5F2EA] pt-2 border-t border-[#2E3430]">
                Booking deposit: {PRICING_CONFIG.depositPolicy.label}
              </p>
              <p className="text-xs text-[#D5D1C5] pt-2 border-t border-[#2E3430] leading-relaxed">
                <strong className="text-[#F59E0B]">Trip fee:</strong> {PRICING_CONFIG.tripFee.detail}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/services')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#141715] hover:text-[#B8520A] cursor-pointer"
            >
              <span>View full 23-line price guide</span>
              <ArrowRight className="w-4 h-4 text-[#E86F14]" />
            </button>
          </div>

          <div className="lg:col-span-8 min-w-0 bg-white border border-[#D6D1C4] rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 bg-[#141715] text-[#F5F2EA] flex flex-wrap items-center justify-between gap-2 text-xs font-mono uppercase tracking-wider">
              <span>Service / Task</span>
              <span className="sm:text-right">Starting Estimate / Range</span>
            </div>
            <div className="divide-y divide-[#ECE8DC]">
              {homePricingHighlights.map((entry) => (
                <div
                  key={entry.id}
                  className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#141715] break-words">
                      {entry.label}
                    </p>
                    <p className="text-xs text-[#525753] break-words">
                      {entry.categoryLabel} · {entry.applicableLines.join(' · ')}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm font-mono font-bold text-[#B8520A] tabular-nums sm:text-right sm:max-w-[46%] break-words">
                    {entry.startingDisplay}
                  </p>
                </div>
              ))}
              <div className="px-4 sm:px-5 py-3.5 bg-[#F5F2EA] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#141715]">
                    On-Site Estimate Visit (Trip Fee)
                  </p>
                  <p className="text-xs text-[#525753] break-words">
                    Free pricing from photos; on-site fee credited back if you book.
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-mono font-bold text-[#B8520A] tabular-nums sm:text-right sm:max-w-[46%] break-words">
                  {PRICING_CONFIG.tripFee.detail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Mow & Mend + 3-Step Estimate Process */}
      <section className="bg-[#EAE5D8]/50 border-y border-[#D6D1C4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6 min-w-0 space-y-5">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
                  Why Choose Mow &amp; Mend
                </p>
                <h2 className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight">
                  Direct accountability from quote to cleanup
                </h2>
              </div>

              <div className="divide-y divide-[#D6D1C4] border-y border-[#D6D1C4]">
                {[
                  {
                    title: 'Owner-operated from start to finish',
                    body: 'You talk directly with the person quoting and completing the job—no sales layers or surprise handoffs.',
                  },
                  {
                    title: 'Yard maintenance plus handyman repairs',
                    body: 'Knock out blackberry brush, a leaning fence post, and a leaky bathroom faucet in one coordinated plan.',
                  },
                  {
                    title: 'Clear written scopes & honest pricing',
                    body: 'Written estimates list Labor, Materials, Disposal, and WA Sales Tax on separate lines before any deposit is collected.',
                  },
                  {
                    title: 'Built for homeowners and local landlords',
                    body: 'Photo completion updates and reliable communication keep Clark County homes and rental units in top shape.',
                  },
                ].map((item) => (
                  <div key={item.title} className="py-4">
                    <h3 className="font-display font-bold text-lg text-[#141715] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#E86F14] shrink-0" />
                      <span>{item.title}</span>
                    </h3>
                    <p className="mt-1 text-sm text-[#3D423E] leading-relaxed pl-6">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 min-w-0 bg-[#141715] bg-workwear-grid text-[#F5F2EA] border border-[#2C322E] rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[#F59E0B] font-semibold mb-2">
                  How Estimates Work
                </p>
                <h2 className="font-display font-extrabold uppercase text-3xl sm:text-4xl tracking-tight">
                  Three simple steps to get on the schedule
                </h2>
              </div>

              <ol className="space-y-5">
                {[
                  {
                    step: '01',
                    title: 'Send your details and job photos',
                    desc: `Fill out the quick estimate form below (or text photos to ${BUSINESS_INFO.phoneDisplay}) with what needs mowing, washing, or repairing.`,
                  },
                  {
                    step: '02',
                    title: 'Owner review & written breakdown',
                    desc: 'We review access, materials, and disposal needs, then send a written estimate breaking out Labor, Materials, Disposal, and WA Sales Tax.',
                  },
                  {
                    step: '03',
                    title: 'Approve, deposit & get the work done',
                    desc: `Once approved, a ${PRICING_CONFIG.depositPolicy.label.toLowerCase()}, we lock in your date, and finish the job cleanly.`,
                  },
                ].map((step) => (
                  <li key={step.step} className="flex items-start gap-4">
                    <span className="font-mono font-bold text-sm px-2.5 py-1 rounded bg-[#E86F14] text-[#141715] shrink-0 tabular-nums">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-lg text-[#F5F2EA]">{step.title}</h3>
                      <p className="mt-1 text-sm text-[#C8C3B4] leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="#home-estimate-form"
                  className="px-5 py-3 min-h-[44px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm rounded-lg hover:bg-[#F37F24] transition-colors"
                >
                  Start Estimate Request
                </a>
                <a
                  href={BUSINESS_INFO.smsHref}
                  className="px-5 py-3 min-h-[44px] border border-[#3B423D] bg-[#212623] text-[#F5F2EA] font-semibold text-sm rounded-lg hover:bg-[#2C332F] transition-colors"
                >
                  Text Photos to {BUSINESS_INFO.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seasonal Services Band */}
      <section className="bg-white border-b border-[#D6D1C4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
              Clark County Seasons
            </p>
            <h2 className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight">
              Seasonal yard &amp; exterior care year-round
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                season: 'Spring & Summer',
                focus:
                  'Recurring mowing, bed edging, blackberry removal, fence/deck repairs, and driveway pressure washing.',
                action: 'Lawn Mowing, Edging & Trimming',
              },
              {
                season: 'Autumn',
                focus:
                  'Leaf cleanups, hedge pruning, garden cutbacks, and gutter clearing before heavy Pacific Northwest rain.',
                action: 'Leaf Cleanup & Yard Debris Removal',
              },
              {
                season: 'Late Fall & Winter',
                focus:
                  'Holiday roofline light installation, January takedown, wind-branch hauling, and indoor handyman punch-lists.',
                action: 'Holiday Light Installation & Removal',
              },
            ].map((item) => (
              <div
                key={item.season}
                className="p-6 rounded-xl bg-[#F5F2EA] border border-[#D6D1C4] flex flex-col justify-between gap-4"
              >
                <div>
                  <h3 className="font-display font-bold text-xl text-[#141715] mb-2">
                    {item.season}
                  </h3>
                  <p className="text-sm text-[#3D423E] leading-relaxed">{item.focus}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(`/estimate?service=${encodeURIComponent(item.action)}`)
                  }
                  className="self-start text-xs font-bold text-[#B8520A] hover:underline cursor-pointer"
                >
                  Request seasonal estimate →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Project Photos + Before & After Project Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
              Our Work
            </p>
            <h2 className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight">
              Completed Vancouver yard photos
            </h2>
            <p className="mt-1.5 text-sm text-[#525753]">
              Real completed lawn mowing, edging, and cleanup photos from Vancouver, WA—never stock
              photography or invented reviews.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/our-work')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-lg border border-[#C8C3B4] bg-white text-sm font-semibold text-[#141715] hover:bg-[#EAE5D8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>View Project Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMPLETED_JOB_PHOTOS.map((photo) => (
            <figure
              key={photo.id}
              className="min-w-0 bg-white border border-[#D6D1C4] rounded-xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] bg-[#EAE5D8] overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-4 space-y-1">
                <p className="text-[11px] font-mono text-[#525753]">
                  {photo.category} · {photo.area}
                </p>
                <h3 className="font-display font-bold text-lg text-[#141715] leading-snug">
                  {photo.title}
                </h3>
                <p className="text-xs text-[#3D423E] leading-relaxed">{photo.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {PROJECT_SHOWCASE.slice(0, 2).map((project) => (
            <BeforeAfterCompare key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Main Estimate Request Section */}
      <section
        id="home-estimate-form"
        className="bg-[#EAE5D8]/75 border-t border-[#D6D1C4] py-14 sm:py-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 min-w-0">
          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
              Free Estimate Request
            </p>
            <h2 className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight">
              Tell us about your yard or home project
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#3D423E] leading-relaxed">
              Attach up to 5 photos from your phone or gallery. Street addresses and photos stay
              strictly private.
            </p>
          </div>

          <EstimateForm onNavigate={onNavigate} />

          <div className="mt-6 flex items-center gap-2 text-xs text-[#525753]">
            <ShieldCheck className="w-4 h-4 text-[#E86F14] shrink-0" />
            <span>{BUSINESS_INFO.contractorRegistrationNote}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
