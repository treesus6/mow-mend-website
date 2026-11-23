import { ArrowRight, Mail, MapPin, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../config/business.ts';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const hasGoogleProfile = Boolean(BUSINESS_INFO.socialProfiles.googleBusinessUrl);
  const hasFacebook = Boolean(BUSINESS_INFO.socialProfiles.facebookUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-mono uppercase tracking-wider text-[#B8520A] font-semibold">
          Contact {BUSINESS_INFO.legalName}
        </p>
        <h1
          className="font-display font-extrabold uppercase text-3xl sm:text-4xl text-[#141715] tracking-tight"
          style={{ textWrap: 'balance' }}
        >
          Call, Text, Email, or Request an Estimate Online
        </h1>
        <p className="text-base text-[#3D423E] leading-relaxed">
          Reach the owner directly for yard maintenance and home repair questions across Vancouver
          and Clark County, Washington.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <a
          href={BUSINESS_INFO.phoneHref}
          className="bg-white border border-[#D6D1C4] rounded-xl p-6 hover:border-[#E86F14] transition-colors flex flex-col justify-between gap-4"
        >
          <div className="w-11 h-11 rounded-lg bg-[#141715] text-[#F5F2EA] flex items-center justify-center">
            <Phone className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-xs font-mono text-[#525753]">Click to Call</p>
            <p className="font-mono font-bold text-lg text-[#141715] mt-1">
              {BUSINESS_INFO.phoneDisplay}
            </p>
            <p className="text-xs text-[#525753] mt-1">Leave a message if we are on a mower or ladder.</p>
          </div>
        </a>

        <a
          href={BUSINESS_INFO.smsHref}
          className="bg-white border border-[#D6D1C4] rounded-xl p-6 hover:border-[#E86F14] transition-colors flex flex-col justify-between gap-4"
        >
          <div className="w-11 h-11 rounded-lg bg-[#141715] text-[#F5F2EA] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-xs font-mono text-[#525753]">Click to Text</p>
            <p className="font-mono font-bold text-lg text-[#141715] mt-1">
              {BUSINESS_INFO.phoneDisplay}
            </p>
            <p className="text-xs text-[#525753] mt-1">Fastest way to send quick project questions or photos.</p>
          </div>
        </a>

        <a
          href={BUSINESS_INFO.emailHref}
          className="bg-white border border-[#D6D1C4] rounded-xl p-6 hover:border-[#E86F14] transition-colors flex flex-col justify-between gap-4"
        >
          <div className="w-11 h-11 rounded-lg bg-[#141715] text-[#F5F2EA] flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-xs font-mono text-[#525753]">Click to Email</p>
            <p className="font-semibold text-sm sm:text-base text-[#141715] mt-1 break-all">
              {BUSINESS_INFO.email}
            </p>
            <p className="text-xs text-[#525753] mt-1">Great for landlord punch-lists and detailed scope notes.</p>
          </div>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#D6D1C4] rounded-xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-[#141715]">
            <MapPin className="w-5 h-5 text-[#E86F14]" />
            <h2 className="font-display font-bold uppercase text-lg text-[#141715]">
              Service Areas (No Public Storefront)
            </h2>
          </div>
          <p className="text-sm text-[#3D423E] leading-relaxed">
            We are a mobile yard and property service company based in{' '}
            <strong>Vancouver, Washington</strong>, serving:
          </p>
          <p className="text-sm font-medium text-[#141715] leading-relaxed">
            {BUSINESS_INFO.serviceAreas.map((a) => a.name).join(' · ')}
          </p>
          <p className="text-xs text-[#525753]">{BUSINESS_INFO.oregonExclusionNote}</p>
        </div>

        <div className="bg-[#EAE5D8] border border-[#D6D1C4] rounded-xl p-6 sm:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-xs font-mono font-semibold text-[#141715]">
              <ShieldCheck className="w-4 h-4 text-[#E86F14]" />
              <span>{BUSINESS_INFO.licensedContractorLabel}</span>
            </p>
            <h2 className="font-display font-bold uppercase text-xl text-[#141715]">
              Submit Full Estimate Details &amp; Photos
            </h2>
            <p className="text-sm text-[#3D423E] leading-relaxed">
              Use our online estimate form to attach up to 5 project photos, choose a preferred
              timeframe, and receive a confirmation Request ID.
            </p>
            {(hasGoogleProfile || hasFacebook) ? (
              <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold text-[#141715]">
                {hasGoogleProfile && (
                  <a
                    href={BUSINESS_INFO.socialProfiles.googleBusinessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google Business Profile
                  </a>
                )}
                {hasFacebook && (
                  <a
                    href={BUSINESS_INFO.socialProfiles.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Facebook Page
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#525753]">
                Verified Google Business Profile and Facebook links can be added in{' '}
                <span className="font-mono">src/config/business.ts</span> once confirmed.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/estimate')}
            className="self-start inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm rounded-lg hover:bg-[#F37F24] transition-colors cursor-pointer"
          >
            <span>Open Estimate Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
