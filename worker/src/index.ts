/**
 * Gravel Bike Price Worker
 * - Cron: täglich 06:00 UTC → fetcht Shopseiten, extrahiert Preise, speichert in KV
 * - GET /prices → liefert aktuelle Preise als JSON an die React-App
 * - POST /refresh → manueller Trigger (für Tests)
 */

export interface Env {
  PRICES: KVNamespace;
  CORS_ORIGIN: string;
}

interface PriceEntry {
  price: number;
  shopName: string;
  updatedAt: string;
  source: 'live' | 'fallback';
}

// Bike-ID → primäre Shop-URL zum Preisfetch
// Nur Neuräder mit stabilen Produkt-URLs; Gebraucht-Marktplätze werden übersprungen.
const PRICE_SOURCES: { id: string; url: string; shopName: string; fallback: number }[] = [
  {
    id: 'cube-nuroad-pro',
    url: 'https://www.cube.eu/de/bikes/road/gravel-cross-cyclocross/nuroad/cube-nuroad-pro-grey-n-black-2024/',
    shopName: 'Cube Bikes',
    fallback: 549,
  },
  {
    id: 'trek-checkpoint-al1',
    url: 'https://www.trekbikes.com/de/de_DE/fahrr%C3%A4der/gravelbikes/checkpoint/checkpoint-al-1/p/37934/',
    shopName: 'Trek',
    fallback: 699,
  },
  {
    id: 'giant-revolt-2',
    url: 'https://www.giant-bicycles.com/de/revolt-2-2024',
    shopName: 'Giant Store',
    fallback: 749,
  },
  {
    id: 'specialized-diverge-e5-elite',
    url: 'https://www.specialized.com/de/de/diverge-e5-elite/p/199483',
    shopName: 'Specialized',
    fallback: 999,
  },
  {
    id: 'canyon-grail-al-6',
    url: 'https://www.canyon.com/de-de/gravel-bikes/race/grail/al/grail-al-6/3816.html',
    shopName: 'Canyon',
    fallback: 1099,
  },
  {
    id: 'orbea-terra-h40',
    url: 'https://www.orbea.com/de-de/bicycles/road/terra/cat/terra-h40-2024',
    shopName: 'Orbea',
    fallback: 1149,
  },
  {
    id: 'cube-nuroad-race-fe',
    url: 'https://www.cube.eu/de/bikes/road/gravel-cross-cyclocross/nuroad/cube-nuroad-race-fe-grey-n-black-2024/',
    shopName: 'Cube Bikes',
    fallback: 1199,
  },
];

// ─── Preisextraktion ────────────────────────────────────────────────────────

function parsePrice(raw: unknown): number | null {
  if (typeof raw === 'number' && raw > 50 && raw < 15000) return raw;
  if (typeof raw === 'string') {
    const n = parseFloat(raw.replace(',', '.'));
    if (!isNaN(n) && n > 50 && n < 15000) return n;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function priceFromJsonLd(data: any): number | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const p = priceFromJsonLd(item);
      if (p) return p;
    }
    return null;
  }
  // @graph
  if (data['@graph']) return priceFromJsonLd(data['@graph']);

  const type: string = Array.isArray(data['@type']) ? data['@type'][0] : (data['@type'] ?? '');
  if (type.includes('Product')) {
    const offers = data.offers ?? data.Offers;
    if (!offers) return null;
    if (Array.isArray(offers)) {
      const prices = offers.map((o: Record<string, unknown>) => parsePrice(o.price)).filter((p): p is number => p !== null);
      return prices.length ? Math.min(...prices) : null;
    }
    return parsePrice((offers as Record<string, unknown>).price);
  }
  return null;
}

async function fetchLivePrice(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
      },
      // @ts-expect-error – Cloudflare-spezifische Option
      cf: { cacheTtl: 0 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // 1. JSON-LD (zuverlässigste Methode – Standard-Schema.org)
    const jsonLdBlocks = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdBlocks) {
      try {
        const price = priceFromJsonLd(JSON.parse(match[1]));
        if (price) return price;
      } catch { /* JSON parse error – weiter */ }
    }

    // 2. Open Graph / Meta-Tags
    const ogMatch = html.match(/<meta[^>]+property="product:price:amount"[^>]+content="([0-9.,]+)"/i)
      ?? html.match(/<meta[^>]+content="([0-9.,]+)"[^>]+property="product:price:amount"/i);
    if (ogMatch) {
      const p = parsePrice(ogMatch[1]);
      if (p) return p;
    }

    // 3. Generisches JSON-Pattern im HTML (viele SPAs injizieren Preis als JSON-Variable)
    const jsonPriceMatch = html.match(/"price"\s*:\s*"?([0-9]+(?:[.,][0-9]{1,2})?)"?/);
    if (jsonPriceMatch) {
      const p = parsePrice(jsonPriceMatch[1]);
      if (p) return p;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Haupt-Aktualisierungslogik ─────────────────────────────────────────────

async function refreshPrices(env: Env): Promise<Record<string, PriceEntry>> {
  // Bestehende Daten laden (als Fallback bei Fetch-Fehler)
  const existing: Record<string, PriceEntry> = JSON.parse(
    (await env.PRICES.get('current')) ?? '{}'
  );

  const now = new Date().toISOString();
  const results: Record<string, PriceEntry> = { ...existing };

  // Anfragen in 3er-Batches, um Shop-Sperren zu vermeiden
  for (let i = 0; i < PRICE_SOURCES.length; i += 3) {
    const batch = PRICE_SOURCES.slice(i, i + 3);
    const fetched = await Promise.all(
      batch.map(async (src) => {
        const live = await fetchLivePrice(src.url);
        return { ...src, live };
      })
    );

    for (const { id, shopName, fallback, live } of fetched) {
      if (live !== null) {
        results[id] = { price: live, shopName, updatedAt: now, source: 'live' };
      } else if (!results[id]) {
        // Noch kein Eintrag → statischen Fallback speichern
        results[id] = { price: fallback, shopName, updatedAt: now, source: 'fallback' };
      }
      // Sonst: bestehender Wert bleibt erhalten
    }
  }

  await env.PRICES.put('current', JSON.stringify(results), { expirationTtl: 60 * 60 * 48 });
  return results;
}

// ─── Worker-Handler ─────────────────────────────────────────────────────────

export default {
  // Cron-Trigger (täglich 06:00 UTC)
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(refreshPrices(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.CORS_ORIGIN ?? '*';

    const cors: Record<string, string> = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // GET /prices → aktuelle Preise
    if (url.pathname === '/prices' && request.method === 'GET') {
      const data = (await env.PRICES.get('current')) ?? '{}';
      return new Response(data, {
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    // POST /refresh → manueller Trigger (z.B. zum Testen)
    if (url.pathname === '/refresh' && request.method === 'POST') {
      const results = await refreshPrices(env);
      return new Response(JSON.stringify(results, null, 2), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404, headers: cors });
  },
};
