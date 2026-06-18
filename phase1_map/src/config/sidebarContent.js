export const sidebarContent = {
  header: {
    eyebrow: 'SPR 4862',
    title: 'INDOT Solar Suitability Map',
  },
  stats: {
    visible: 'Visible',
    total: 'Total No. of Sites',
    fixedGeometry: 'Fixed Geometry',
    layers: 'Layers',
  },
  projectInfo: {
    title: 'Project Information',
    logo: {
      src: `${import.meta.env.BASE_URL}brand/purdue-logo.png`,
      alt: 'Purdue University logo',
    },
    summary:
      'This map supports the INDOT solar suitability research effort for screening right-of-way and INDOT-owned facility locations.',
    stakeholders: [
      {
        label: 'Research lead',
        value: 'S2-HUB Lab, Dr. Soowon Chang',
      },
      {
        label: 'Institutional stakeholder',
        value: 'Purdue University',
      },
      {
        label: 'Academic home',
        value: 'School of Construction Management Technology',
      },
    ],
    links: [
      {
        label: 'S2-HUB Lab',
        href: 'https://polytechnic.purdue.edu/facilities/s2-hub',
      },
      {
        label: 'Purdue Polytechnic',
        href: 'https://polytechnic.purdue.edu/',
      },
      {
        label: 'Contact S2-HUB Lab',
        href: 'mailto:s2hublab@gmail.com',
      },
    ],
    contactLabel: 'Feedback or data questions',
    contactEmail: 's2hublab@gmail.com',
  },
};
