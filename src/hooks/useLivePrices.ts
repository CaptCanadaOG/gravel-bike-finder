import { useState, useEffect } from 'react';

export interface LivePrice {
  price: number;
  shopName: string;
  updatedAt: string;
  source: 'live' | 'fallback';
}

export type LivePrices = Record<string, LivePrice>;

const API_URL = import.meta.env.VITE_PRICES_API_URL as string | undefined;

export function useLivePrices() {
  const [prices, setPrices] = useState<LivePrices>({});
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!API_URL) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    fetch(`${API_URL}/prices`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<LivePrices>;
      })
      .then(data => {
        if (cancelled) return;
        setPrices(data);
        setStatus('ok');
        // Neuestes updatedAt aus allen Einträgen ermitteln
        const dates = Object.values(data).map(e => new Date(e.updatedAt));
        if (dates.length) setLastUpdated(new Date(Math.max(...dates.map(d => d.getTime()))));
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => { cancelled = true; };
  }, []);

  return { prices, status, lastUpdated };
}
