import { ArrowRight, CheckCircle2, Phone, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../config/business.ts';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="max-w-3xl space-y-4">
        <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold">
          About {BUSINESS_INFO.legalName}
        </p>
        <h1
          className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          Practical yard care and small home repairs from one local owner-operator
        </h1>
        <p className="text-base sm:text-lg text-[#3D423E] leading-relaxed">
          MOW &amp; MEND LLC was built around a simple reality for Vancouver and Clark County
          property owners: most homes and rentals need both dependable yard upkeep and small
          practical repairs—and hiring separate companies for every job wastes time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#D6D1C4] rounded-xl p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold uppercase text-2xl text-[#141715]">
            How We Work With Customers
          </h2>
          <p className="text-sm text-[#3D423E] leading-relaxed">
            Whether you own a single-family home, manage a rental property, or are catching up on
            outdoor maintenance, you work directly with the owner from estimate to final walk-through.
          </p>
          <ul className="space-y-3 text-sm text-[#232724]">
            {[
              'Direct communication by phone, text, or email—no call centers',
              'Clear written scope breaking out Labor, Materials, Disposal & WA Sales Tax',
              'Practical repair options instead of unnecessary upsells',
              'Clean job sites with respect for gates, pets, and neighbors',
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E86F14] shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141715] bg-workwear-grid text-[#F5F2EA] border border-[#2C322E] rounded-xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#F59E0B]">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                Licensed WA Contractor
              </span>
            </div>
            <h2 className="font-display font-bold uppercase text-2xl">
              WA Contractor Registration:{' '}
              <span className="font-mono text-[#F59E0B]">
                {BUSINESS_INFO.contractorRegistration}
              </span>
            </h2>
            <p className="text-sm text-[#D5D1C5] leading-relaxed">
              MOW &amp; MEND LLC operates in Vancouver and surrounding Clark County, Washington
              communities. Active registration and insurance details are confirmed directly with
              your written estimate.
            </p>
            <p className="text-xs text-[#A8A396] leading-relaxed">
              {BUSINESS_INFO.oregonExclusionNote}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/estimate')}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm rounded-lg hover:bg-[#F37F24] transition-colors cursor-pointer"
            >
              <span>Request a Free Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={BUSINESS_INFO.phoneHref}
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] border border-[#3B423D] bg-[#212623] text-[#F5F2EA] text-sm font-semibold rounded-lg hover:bg-[#2C332F] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F59E0B]" />
              <span className="font-mono">{BUSINESS_INFO.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
