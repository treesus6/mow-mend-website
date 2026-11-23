import React, { useState } from 'react';
import { Menu, MessageSquare, Phone, ShieldCheck, X } from 'lucide-react';
import { BUSINESS_INFO } from '../config/business.ts';
import { BrandLogo } from './BrandLogo.tsx';

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Services', path: '/services' },
  { label: 'Our Work', path: '/our-work' },
  { label: 'Service Areas', path: '/service-areas' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export function Layout({ currentPath, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#141715] overflow-x-clip">
      {/* Strictly conforms to 3-zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#F5F2EA]/95 backdrop-blur-sm border-b-2 border-[#D6D1C4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line Brand Wordmark + Smokiey Lockup */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86F14] rounded min-w-0"
            aria-label="MOW & MEND LLC Home"
          >
            <BrandLogo variant="dark" />
          </a>

          {/* Zone 2: 5 clean single-line text links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#333834]"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                currentPath === item.path ||
                (item.path === '/services' && currentPath.startsWith('/services/'));
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86F14] rounded-sm ${
                    active
                      ? 'border-[#E86F14] text-[#141715]'
                      : 'border-transparent hover:text-[#141715] hover:border-[#B6B0A0]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA + mobile drawer button */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/estimate"
              onClick={(e) => handleLinkClick(e, '/estimate')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 min-h-[42px] text-sm font-display font-bold uppercase tracking-wide bg-[#E86F14] text-[#141715] rounded-lg hover:bg-[#F37F24] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141715]"
            >
              Request Estimate
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#C8C3B4] bg-white text-[#141715] hover:bg-[#EAE5D8] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="lg:hidden border-t border-[#D6D1C4] bg-[#F5F2EA] px-4 py-4 space-y-1"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                currentPath === item.path ||
                (item.path === '/services' && currentPath.startsWith('/services/'));
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`block px-3 py-3 rounded-lg text-base font-semibold min-h-[44px] ${
                    active
                      ? 'bg-[#141715] text-[#F5F2EA]'
                      : 'text-[#141715] hover:bg-[#EAE5D8]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="/estimate"
              onClick={(e) => handleLinkClick(e, '/estimate')}
              className="block mt-2 px-4 py-3 rounded-lg bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-center text-lg min-h-[44px]"
            >
              Request a Free Estimate
            </a>
          </nav>
        )}
      </header>

      <main className="flex-1 min-w-0 pb-20 sm:pb-0">{children}</main>

      {/* Industrial Charcoal Footer */}
      <footer className="bg-[#141715] text-[#E6E4DC] border-t-4 border-[#E86F14] pb-20 sm:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-3">
              <BrandLogo variant="light" showTagline />
              <p className="text-sm text-[#B8BEB9] leading-relaxed">
                Your yard. Your home. One reliable local company serving Vancouver &amp; Clark
                County, Washington.
              </p>
              <p className="text-xs font-mono text-[#F59E0B] pt-1">
                {BUSINESS_INFO.licensedContractorLabel}
              </p>
            </div>

            <div>
              <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#F5F2EA] mb-3">
                Pages
              </h2>
              <ul className="space-y-2 text-sm text-[#B8BEB9]">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'Services & Starting Prices', path: '/services' },
                  { label: 'Our Work', path: '/our-work' },
                  { label: 'Service Areas', path: '/service-areas' },
                  { label: 'About Mow & Mend', path: '/about' },
                  { label: 'Request an Estimate', path: '/estimate' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Privacy Notice', path: '/privacy' },
                ].map((link) => (
                  <li key={link.path}>
                    <a
                      href={link.path}
                      onClick={(e) => handleLinkClick(e, link.path)}
                      className="hover:text-[#F5F2EA] underline-offset-4 hover:underline transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#F5F2EA] mb-3">
                Call, Text, or Email
              </h2>
              <ul className="space-y-2.5 text-sm text-[#B8BEB9]">
                <li>
                  <a
                    href={BUSINESS_INFO.phoneHref}
                    className="inline-flex items-center gap-2 font-mono font-semibold text-[#F5F2EA] hover:text-[#F59E0B] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#E86F14]" />
                    {BUSINESS_INFO.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS_INFO.smsHref}
                    className="inline-flex items-center gap-2 hover:text-[#F5F2EA] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[#E86F14]" />
                    Text {BUSINESS_INFO.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={BUSINESS_INFO.emailHref}
                    className="hover:text-[#F5F2EA] underline-offset-4 hover:underline break-all"
                  >
                    {BUSINESS_INFO.email}
                  </a>
                </li>
                <li className="text-xs text-[#9AA29C] pt-1">
                  Vancouver, WA · Clark County service area only
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-base font-bold uppercase tracking-wide text-[#F5F2EA] mb-3">
                Licensing &amp; Access
              </h2>
              <div className="space-y-3 text-xs text-[#B8BEB9] leading-relaxed">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span>
                    Licensed WA Contractor · Reg.{' '}
                    <span className="font-mono text-[#F5F2EA]">
                      {BUSINESS_INFO.contractorRegistration}
                    </span>
                    . All listed prices are starting estimates; 50% deposit ($50 min.) to book.
                  </span>
                </p>
                <p>{BUSINESS_INFO.oregonExclusionNote}</p>
                <p className="pt-2">
                  <a
                    href="/admin"
                    onClick={(e) => handleLinkClick(e, '/admin')}
                    className="text-xs text-[#9AA29C] hover:text-[#F5F2EA] underline underline-offset-4"
                  >
                    Owner Dashboard
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#2A2F2B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#9AA29C]">
            <p>© {new Date().getFullYear()} {BUSINESS_INFO.legalName}. Vancouver, Washington.</p>
            <p>Customer addresses and project photos are stored privately and never published.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Action Bar: <= 56px height (< 8% mobile viewport height) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#141715] border-t-2 border-[#E86F14] px-3 py-2 flex items-center gap-2">
        <a
          href={BUSINESS_INFO.phoneHref}
          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-[#232825] text-[#F5F2EA] text-xs font-semibold whitespace-nowrap"
        >
          <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Call / Text</span>
        </a>
        <a
          href="/estimate"
          onClick={(e) => handleLinkClick(e, '/estimate')}
          className="flex-[1.3] inline-flex items-center justify-center min-h-[44px] px-3 rounded-lg bg-[#E86F14] text-[#141715] font-display font-extrabold uppercase tracking-wide text-sm whitespace-nowrap"
        >
          Free Estimate
        </a>
      </div>
    </div>
  );
}
