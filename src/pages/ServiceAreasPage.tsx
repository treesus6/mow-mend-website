import { useState } from 'react';
import { ArrowRight, MapPin, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '../config/business.ts';

interface ServiceAreasPageProps {
  onNavigate: (path: string) => void;
}

export function ServiceAreasPage({ onNavigate }: ServiceAreasPageProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(BUSINESS_INFO.serviceAreas[0].slug);
  const activeArea =
    BUSINESS_INFO.serviceAreas.find((a) => a.slug === selectedSlug) ||
    BUSINESS_INFO.serviceAreas[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold">
          Service Coverage · Clark County, Washington
        </p>
        <h1
          className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          Serving Vancouver &amp; Clark County Communities
        </h1>
        <p className="text-base text-[#3D423E] leading-relaxed">
          Based in Vancouver, WA, MOW &amp; MEND LLC provides mobile yard maintenance and handyman
          services directly at your property—we do not operate a public walk-in storefront.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-3">
          {BUSINESS_INFO.serviceAreas.map((area) => {
            const isSelected = area.slug === activeArea.slug;
            return (
              <button
                key={area.slug}
                type="button"
                onClick={() => setSelectedSlug(area.slug)}
                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#141715] text-[#F5F2EA] border-[#141715]'
                    : 'bg-white text-[#141715] border-[#D6D1C4] hover:border-[#E86F14]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-lg">{area.name}, WA</span>
                  <MapPin
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-[#F59E0B]' : 'text-[#525753]'
                    }`}
                  />
                </div>
                <p
                  className={`mt-1.5 text-xs font-mono ${
                    isSelected ? 'text-[#C8C3B4]' : 'text-[#525753]'
                  }`}
                >
                  ZIP: {area.zipCodes.slice(0, 3).join(', ')}
                  {area.zipCodes.length > 3 ? '…' : ''}
                </p>
              </button>
            );
          })}
        </div>

        <aside className="lg:col-span-5 bg-white border border-[#D6D1C4] rounded-xl p-6 sm:p-7 space-y-5">
          <div>
            <p className="text-xs font-mono text-[#B8520A] font-semibold mb-1">
              Selected Area · Washington State
            </p>
            <h2 className="font-display font-bold uppercase text-2xl text-[#141715]">
              {activeArea.name}, WA
            </h2>
            <p className="mt-2.5 text-sm text-[#3D423E] leading-relaxed">{activeArea.highlights}</p>
          </div>

          <div className="pt-3 border-t border-[#ECE8DC]">
            <p className="text-xs font-semibold text-[#141715] mb-1">Covered ZIP Codes</p>
            <p className="text-xs font-mono text-[#525753] leading-relaxed">
              {activeArea.zipCodes.join(' · ')}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F5F2EA] border border-[#E2DDD0] text-xs text-[#3D423E] leading-relaxed">
            <strong className="text-[#141715]">Not sure if your property is inside our route?</strong>{' '}
            Submit an estimate request with your city and ZIP code or text{' '}
            <span className="font-mono font-semibold text-[#141715]">
              {BUSINESS_INFO.phoneDisplay}
            </span>{' '}
            and we will confirm coverage right away. ({BUSINESS_INFO.oregonExclusionNote})
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/estimate')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm rounded-lg hover:bg-[#F37F24] transition-colors cursor-pointer"
            >
              <span>Request Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={BUSINESS_INFO.phoneHref}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] border border-[#D6D1C4] text-[#141715] text-sm font-semibold rounded-lg hover:bg-[#EAE5D8] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#E86F14]" />
              <span>Call</span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
