import { useEffect, useState } from 'react';

import { loadAppData } from '../services/api';

export function useAppData() {
  const [data, setData] = useState({ manifest: null, stats: null, layers: {}, loading: true, error: '' });

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const appData = await loadAppData();
        if (alive) {
          setData({ ...appData, loading: false, error: '' });
        }
      } catch (error) {
        if (alive) {
          setData((current) => ({ ...current, loading: false, error: error.message }));
        }
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
