import { Camera, Lock, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import { EstimateForm } from '../components/EstimateForm.tsx';
import { BUSINESS_INFO } from '../config/business.ts';
import { PRICING_CONFIG } from '../config/pricing.ts';

interface EstimatePageProps {
  initialService?: string;
  onNavigate: (path: string) => void;
}

export function EstimatePage({ initialService = '', onNavigate }: EstimatePageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold mb-2">
          Free Estimate Request · Clark County, WA
        </p>
        <h1
          className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          Request a Custom Estimate
        </h1>
        <p className="mt-3 text-base text-[#3D423E] leading-relaxed">
          Share your contact details, job description, preferred timeframe, and up to 5 project
          photos. Mow &amp; Mend LLC will review your request and follow up directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <EstimateForm initialService={initialService} onNavigate={onNavigate} />
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-[#141715] bg-workwear-grid text-[#F5F2EA] border border-[#2C322E] rounded-xl p-6 space-y-4">
            <h2 className="font-display font-bold uppercase text-xl">Prefer to call or text?</h2>
            <p className="text-sm text-[#D5D1C5] leading-relaxed">
              You can reach the owner directly to ask a quick question or text photos of the job.
            </p>
            <div className="space-y-2.5">
              <a
                href={BUSINESS_INFO.phoneHref}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm rounded-lg hover:bg-[#F37F24] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="font-mono">Call {BUSINESS_INFO.phoneDisplay}</span>
              </a>
              <a
                href={BUSINESS_INFO.smsHref}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] border border-[#3B423D] bg-[#212623] text-[#F5F2EA] text-sm font-semibold rounded-lg hover:bg-[#2C332F] transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
                <span>Text {BUSINESS_INFO.phoneDisplay}</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-[#D6D1C4] rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#141715]">
              <Camera className="w-4 h-4 text-[#E86F14]" />
              <h2 className="font-display font-bold uppercase text-base text-[#141715]">
                Tips for Helpful Photos
              </h2>
            </div>
            <ul className="space-y-2 text-xs text-[#3D423E] leading-relaxed list-disc pl-4">
              <li>Take one wide shot showing access (driveway, side gate, or slope).</li>
              <li>Take one closer shot of the problem area (rotted post, faucet valve, or moss).</li>
              <li>For debris hauling, include one photo showing the full pile size.</li>
            </ul>
            <p className="pt-2 border-t border-[#ECE8DC] text-xs font-medium text-[#141715] leading-relaxed">
              <strong>Trip fee policy:</strong> {PRICING_CONFIG.tripFee.detail}
            </p>
          </div>

          <div className="bg-[#EAE5D8] border border-[#D6D1C4] rounded-xl p-5 space-y-2.5 text-xs text-[#3D423E] leading-relaxed">
            <p className="flex items-center gap-2 font-semibold text-[#141715]">
              <Lock className="w-4 h-4 text-[#E86F14]" />
              <span>Your Privacy</span>
            </p>
            <p>
              Street addresses and project photos are stored privately for preparing your estimate and
              are never shown on the public website.
            </p>
            <p className="flex items-center gap-2 pt-1 text-[#141715] font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#E86F14] shrink-0" />
              <span>{BUSINESS_INFO.licensedContractorLabel}</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
