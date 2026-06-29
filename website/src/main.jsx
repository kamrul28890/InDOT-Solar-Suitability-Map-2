import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/600.css';
import '@fontsource/sora/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import 'leaflet/dist/leaflet.css';
import './styles/tokens.css';
import './styles.css';
import './styles/globals.css';

import { SiteShell } from './components/SiteShell';
import AboutPage from './routes/About/AboutPage.jsx';
import ContactPage from './routes/Contact/ContactPage.jsx';
import DataPage from './routes/Data/DataPage.jsx';
import FaqPage from './routes/Faq/FaqPage.jsx';
import HomePage from './routes/Home/HomePage.jsx';
import InsightsPage from './routes/Insights/InsightsPage.jsx';
import AccessibilityPage from './routes/Legal/AccessibilityPage.jsx';
import CitationPage from './routes/Legal/CitationPage.jsx';
import DisclaimerPage from './routes/Legal/DisclaimerPage.jsx';
import MapPage from './routes/Map/MapPage.jsx';
import CriteriaPage from './routes/Criteria/CriteriaPage.jsx';

// The builder loads only when requested so public-map visitors do not download
// shapefile parsing and geometry-repair dependencies.
const BuilderPage = lazy(() => import('./builder/BuilderPage.jsx'));

// Hash routing works on GitHub Pages and static servers without rewrite rules.
createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Suspense fallback={<div className="route-loading">Loading...</div>}>
      <Routes>
        <Route element={<SiteShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/criteria" element={<CriteriaPage />} />
          <Route path="/methodology" element={<Navigate to="/criteria" replace />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/citation" element={<CitationPage />} />
        </Route>
        <Route element={<SiteShell full footer={false} />}>
          <Route path="/map" element={<MapPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/editor" element={<Navigate to="/builder" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </HashRouter>
);
