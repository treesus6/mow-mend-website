/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Layout } from './components/Layout.tsx';
import { CatalogProvider } from './context/CatalogContext.tsx';
import { getServiceBySlug } from './data/services.ts';
import { testConnection } from './lib/firebase.ts';
import { AboutPage } from './pages/AboutPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { EstimatePage } from './pages/EstimatePage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { OurWorkPage } from './pages/OurWorkPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { ServiceAreasPage } from './pages/ServiceAreasPage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';

function getPageSeo(pathname: string): { title: string; description: string } {
  if (pathname === '/' || pathname === '') {
    return {
      title: 'MOW & MEND LLC | Lawn Care & Handyman Services in Vancouver, WA',
      description:
        'Owner-operated yard maintenance, cleanups, pressure washing, fence repairs, and small home projects in Vancouver & Clark County, WA. Call or text (360) 889-8046.',
    };
  }
  if (pathname === '/services') {
    return {
      title: 'Yard & Handyman Services in Vancouver, WA | MOW & MEND LLC',
      description:
        'Lawn & yard care, exterior pressure washing & gutter cleaning, handyman & property repairs, holiday lighting, and minor hauling in Clark County, WA.',
    };
  }
  if (pathname.startsWith('/services/')) {
    const slug = pathname.replace('/services/', '');
    const service = getServiceBySlug(slug);
    if (service) {
      return {
        title: `${service.title} in Vancouver, WA | MOW & MEND LLC`,
        description: `${service.oneLiner} Serving Vancouver and Clark County, WA. Request a custom estimate or call/text (360) 889-8046.`,
      };
    }
  }
  if (pathname === '/our-work') {
    return {
      title: 'Before & After Yard & Repair Gallery | MOW & MEND LLC',
      description:
        'See yard cleanup, fence repair, and pressure washing project comparisons across Vancouver and Clark County, Washington.',
    };
  }
  if (pathname === '/about') {
    return {
      title: 'About MOW & MEND LLC | Vancouver, WA Yard & Property Services',
      description:
        'Locally operated property services combining yard care and practical home repairs in Vancouver, WA. WA Contractor Reg: MOWMEM*741QZ.',
    };
  }
  if (pathname === '/service-areas') {
    return {
      title: 'Clark County, WA Service Areas | MOW & MEND LLC',
      description:
        'Serving Vancouver, Hazel Dell, Salmon Creek, Orchards, Five Corners, Camas, Ridgefield, Battle Ground, La Center, and Brush Prairie, WA.',
    };
  }
  if (pathname === '/estimate') {
    return {
      title: 'Request a Free Estimate | MOW & MEND LLC — Vancouver, WA',
      description:
        'Submit project details, preferred timeframe, and up to 5 photos for a custom yard or handyman estimate in Clark County, WA.',
    };
  }
  if (pathname === '/contact') {
    return {
      title: 'Contact MOW & MEND LLC | Call or Text (360) 889-8046',
      description:
        'Call, text, or email MOW & MEND LLC in Vancouver, WA for yard maintenance, cleanups, pressure washing, and small home repairs.',
    };
  }
  if (pathname === '/privacy') {
    return {
      title: 'Privacy Notice | MOW & MEND LLC',
      description:
        'How MOW & MEND LLC keeps customer addresses, contact details, and uploaded project photos private.',
    };
  }
  if (pathname === '/admin') {
    return {
      title: 'Owner Dashboard | MOW & MEND LLC',
      description: 'Private owner lead and estimate management portal.',
    };
  }
  return {
    title: 'MOW & MEND LLC | Vancouver, WA',
    description: 'Yard maintenance and handyman services in Vancouver and Clark County, WA.',
  };
}

export default function App() {
  const [locationState, setLocationState] = useState(() => ({
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
  }));

  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setLocationState({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (target: string) => {
    const url = new URL(target, window.location.origin);
    window.history.pushState({}, '', url.pathname + url.search);
    setLocationState({
      pathname: url.pathname || '/',
      search: url.search || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const normalizedPath =
    locationState.pathname.length > 1
      ? locationState.pathname.replace(/\/+$/, '')
      : '/';

  useEffect(() => {
    const seo = getPageSeo(normalizedPath);
    document.title = seo.title;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', seo.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + normalizedPath);
  }, [normalizedPath]);

  const queryParams = new URLSearchParams(locationState.search);
  const preselectedService = queryParams.get('service') || '';

  const renderPage = () => {
    if (normalizedPath === '/') {
      return <HomePage onNavigate={navigate} />;
    }
    if (normalizedPath === '/services') {
      return <ServicesPage onNavigate={navigate} />;
    }
    if (normalizedPath.startsWith('/services/')) {
      const slug = normalizedPath.replace('/services/', '');
      return <ServicesPage slug={slug} onNavigate={navigate} />;
    }
    if (normalizedPath === '/our-work') {
      return <OurWorkPage onNavigate={navigate} />;
    }
    if (normalizedPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (normalizedPath === '/service-areas') {
      return <ServiceAreasPage onNavigate={navigate} />;
    }
    if (normalizedPath === '/estimate') {
      return <EstimatePage initialService={preselectedService} onNavigate={navigate} />;
    }
    if (normalizedPath === '/contact') {
      return <ContactPage onNavigate={navigate} />;
    }
    if (normalizedPath === '/privacy') {
      return <PrivacyPage onNavigate={navigate} />;
    }
    if (normalizedPath === '/admin') {
      return <AdminDashboardPage />;
    }

    return <HomePage onNavigate={navigate} />;
  };

  return (
    <ErrorBoundary>
      <CatalogProvider>
        <Layout currentPath={normalizedPath} onNavigate={navigate}>
          {renderPage()}
        </Layout>
      </CatalogProvider>
    </ErrorBoundary>
  );
}
