import { useEffect, useState } from 'react';

export function useCountUp(target, { duration = 700, enabled = true } = {}) {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return undefined;
    }

    const start = performance.now();
    const end = Number(target) || 0;
    let frame = 0;

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      setValue(end * progress);
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, enabled, target]);

  return value;
}
