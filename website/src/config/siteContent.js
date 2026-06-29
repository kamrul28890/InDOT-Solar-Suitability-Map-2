export const siteContent = {
  brand: {
    eyebrow: 'SPR 4862',
    title: 'INDOT Solar Suitability Map',
    subtitle: 'SPR 4862 / Indiana Solar Roadmap',
    purdueLogo: `${import.meta.env.BASE_URL}brand/purdue-logo.png`,
    indotLogo: `${import.meta.env.BASE_URL}brand/indot-seal.svg`,
    links: {
      purdue: 'https://www.purdue.edu/',
      indot: 'https://www.in.gov/indot/',
      s2hub: 'https://polytechnic.purdue.edu/facilities/s2-hub',
    },
  },
  nav: [
    { label: 'Home', to: '/' },
    { label: 'Insights', to: '/insights' },
    { label: 'Criteria', to: '/criteria' },
    { label: 'Data', to: '/data' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Map Builder', to: '/builder' },
  ],
  hero: {
    headline: 'Solar suitability screening for Indiana transportation sites',
    subhead:
      'Review candidate sites, INDOT facilities, and right-of-way parcels by individual suitability criteria in a public static web map.',
  },
  contact: {
    email: 's2hublab@gmail.com',
    web3formsKey: 'TODO(confirm)',
    privacyNote: 'Submissions are processed by the selected form-delivery provider and emailed to the S2-HUB Lab.',
  },
  footer: {
    blurb:
      'A Purdue S2-HUB Lab research website for SPR 4862 / Indiana Solar Roadmap, built for transparent screening of right-of-way and INDOT-owned facility land.',
    copyright: 'Copyright (c) 2026 S2-HUB Lab, Purdue University.',
    resources: [
      { label: 'Data downloads', to: '/data' },
      { label: 'Citation', to: '/citation' },
      { label: 'Map Builder', to: '/builder' },
    ],
    legal: [
      { label: 'Accessibility', to: '/accessibility' },
      { label: 'Disclaimer', to: '/disclaimer' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
};
