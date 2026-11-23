import { Lock } from 'lucide-react';
import { BUSINESS_INFO } from '../config/business.ts';

interface PrivacyPageProps {
  onNavigate: (path: string) => void;
}

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
      <div className="flex items-center gap-2 text-[#143326]">
        <Lock className="w-5 h-5" />
        <p className="text-xs font-mono uppercase tracking-wider font-semibold">Privacy Notice</p>
      </div>
      <h1 className="font-display font-extrabold text-3xl text-[#161917]">
        Customer Information &amp; Photo Privacy
      </h1>

      <div className="bg-white border border-[#E2E0D8] rounded-xl p-6 sm:p-8 space-y-4 text-sm text-[#3E453F] leading-relaxed">
        <p>
          <strong>Information We Collect:</strong> When you request an estimate from{' '}
          {BUSINESS_INFO.legalName}, we collect your name, phone number, email address, preferred
          contact method, job street address, city, ZIP code, work description, preferred timeframe,
          and any project photos you choose to upload.
        </p>
        <p>
          <strong>How We Use It:</strong> Your details and project photos are used strictly to
          review your project scope, contact you regarding an estimate, and coordinate requested work
          in Clark County, Washington.
        </p>
        <p>
          <strong>Private Storage:</strong> Customer street addresses, phone numbers, email
          addresses, and uploaded project photos are stored in a private database protected by
          strict access rules. They are never publicly readable, never sold, and never displayed in
          our public project gallery without explicit owner-approved redaction and consent.
        </p>
        <p>
          <strong>Questions or Removal Requests:</strong> Contact{' '}
          <a href={BUSINESS_INFO.emailHref} className="font-semibold text-[#143326] underline">
            {BUSINESS_INFO.email}
          </a>{' '}
          or call{' '}
          <a href={BUSINESS_INFO.phoneHref} className="font-mono font-semibold text-[#143326] underline">
            {BUSINESS_INFO.phoneDisplay}
          </a>
          .
        </p>
      </div>

      <button
        type="button"
        onClick={() => onNavigate('/estimate')}
        className="px-5 py-2.5 min-h-[44px] bg-[#143326] text-[#F8F7F3] text-sm font-semibold rounded-lg hover:bg-[#1B4332] transition-colors cursor-pointer"
      >
        Back to Estimate Form
      </button>
    </div>
  );
}
