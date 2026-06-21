import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './styles.css';

import { App } from './App';

const EditorPage = lazy(() => import('./editor/EditorPage.jsx'));

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Suspense fallback={<div className="route-loading">Loading...</div>}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </HashRouter>
);
