import type { Bike } from '../types/bike';
import { X, ExternalLink } from 'lucide-react';

interface Props {
  bikes: Bike[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const rows: { label: string; key: keyof Bike | 'lowestPrice' }[] = [
  { label: 'Richtwert-Preis ⚠️', key: 'lowestPrice' },
  { label: 'Gewicht', key: 'weight' },
  { label: 'Rahmenmaterial', key: 'frameMaterial' },
  { label: 'Schaltgruppe', key: 'groupset' },
  { label: 'Bremsen', key: 'brakes' },
  { label: 'Max. Reifenbreite', key: 'tireWidth' },
  { label: 'Laufradgröße', key: 'wheelSize' },
  { label: 'Stack (mm)', key: 'stack' },
  { label: 'Reach (mm)', key: 'reach' },
  { label: 'Verfügbare Größen', key: 'sizes' },
];

function getValue(bike: Bike, key: string): string {
  if (key === 'lowestPrice') {
    const p = Math.min(...bike.shopLinks.map(s => s.price ?? bike.price));
    return `ca. ${p.toLocaleString('de-DE')} € (Richtwert)`;
  }
  const v = bike[key as keyof Bike];
  if (Array.isArray(v)) return (v as string[]).join(', ');
  if (key === 'weight') return `${v} kg`;
  if (key === 'tireWidth') return `${v} mm`;
  return String(v);
}

export default function CompareDrawer({ bikes, onRemove, onClear }: Props) {
  if (bikes.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">
            Vergleich ({bikes.length}/3)
          </h3>
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600 underline">
            Alle entfernen
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-gray-500 font-medium w-36 pr-4 pb-2"></th>
                {bikes.map(b => (
                  <th key={b.id} className="text-left pb-2 min-w-[160px] pr-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-400">{b.brand}</p>
                        <p className="font-bold text-gray-900">{b.model}</p>
                      </div>
                      <button
                        onClick={() => onRemove(b.id)}
                        className="text-gray-300 hover:text-red-500 mt-0.5 flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className="border-t border-gray-50">
                  <td className="py-1.5 pr-4 text-gray-500 font-medium text-xs whitespace-nowrap">
                    {row.label}
                  </td>
                  {bikes.map(b => (
                    <td key={b.id} className="py-1.5 pr-4 text-gray-800 font-medium">
                      {getValue(b, row.key)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-gray-100">
                <td className="pt-3 text-gray-500 font-medium text-xs">Shop-Links</td>
                {bikes.map(b => (
                  <td key={b.id} className="pt-3 pr-4">
                    <div className="flex flex-col gap-1">
                      {b.shopLinks.map(link => (
                        <a
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <ExternalLink size={10} />
                          {link.name} →
                        </a>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
