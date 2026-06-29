import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // PUBLIC_BASE supports project-site deployment while defaulting to root for
  // FastAPI and Windows-package builds.
  base: process.env.VITE_PUBLIC_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During development Vite owns the UI and forwards data routes to FastAPI.
      '/api': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
    },
  },
});
