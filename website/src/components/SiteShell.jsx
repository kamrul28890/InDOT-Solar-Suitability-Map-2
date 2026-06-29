import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem('indot-site-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function SiteShell({ full = false, footer = true }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('indot-site-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    const titles = {
      '/': 'Home',
      '/map': 'Map',
      '/insights': 'Insights',
      '/criteria': 'Criteria',
      '/methodology': 'Criteria',
      '/data': 'Data',
      '/about': 'About',
      '/contact': 'Contact',
      '/builder': 'Map Builder',
      '/editor': 'Map Builder',
      '/faq': 'FAQ',
      '/accessibility': 'Accessibility',
      '/disclaimer': 'Disclaimer',
      '/citation': 'Citation',
    };
    const page = titles[location.pathname] || 'INDOT Solar Suitability Map';
    document.title = page === 'Home' ? 'INDOT Solar Suitability Map' : `${page} | INDOT Solar Suitability Map`;
  }, [location.pathname]);

  return (
    <div className="site-root" data-theme={theme}>
      <SiteHeader theme={theme} onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))} />
      <main className={`site-main ${full ? 'site-main--full' : ''}`.trim()}>
        <Outlet />
      </main>
      {footer ? <SiteFooter /> : null}
    </div>
  );
}
