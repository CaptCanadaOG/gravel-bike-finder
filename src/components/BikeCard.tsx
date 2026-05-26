import type { Bike } from '../types/bike';
import { Scale, ExternalLink, Check } from 'lucide-react';

interface Props {
  bike: Bike;
  onCompare: (bike: Bike) => void;
  isComparing: boolean;
  compareCount: number;
}

const materialColors: Record<string, string> = {
  Carbon: 'bg-blue-100 text-blue-800',
  Aluminium: 'bg-gray-100 text-gray-700',
  Stahl: 'bg-amber-100 text-amber-800',
  Titan: 'bg-purple-100 text-purple-800',
};

export default function BikeCard({ bike, onCompare, isComparing, compareCount }: Props) {
  const lowestPrice = Math.min(...bike.shopLinks.map(s => s.price ?? bike.price));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-48 overflow-hidden bg-gray-50">
        <img
          src={bike.image}
          alt={`${bike.brand} ${bike.model}`}
          className="w-full h-full object-cover"
        />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full ${materialColors[bike.frameMaterial]}`}>
          {bike.frameMaterial}
        </span>
        {bike.shopLinks.length > 1 && (
          <span className="absolute top-3 right-3 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
            {bike.shopLinks.length} Shops
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{bike.brand}</p>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{bike.model}</h2>
          <p className="text-2xl font-bold text-green-600 mt-1">ab {lowestPrice.toLocaleString('de-DE')} €</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
          <span>⚖️ {bike.weight} kg</span>
          <span>🔧 {bike.groupset.split(' ').slice(0, 3).join(' ')}</span>
          <span>🛞 {bike.tireWidth} mm Reifen</span>
          <span>🛑 {bike.brakes}</span>
          <span>🔵 {bike.wheelSize}</span>
          <span>📐 {bike.year}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {bike.highlights.map(h => (
            <span key={h} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
              {h}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            {bike.shopLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <span className="flex items-center gap-1">
                  <ExternalLink size={12} />
                  {link.name}
                </span>
                {link.price && (
                  <span className="font-semibold">{link.price.toLocaleString('de-DE')} €</span>
                )}
              </a>
            ))}
          </div>

          <button
            onClick={() => onCompare(bike)}
            disabled={!isComparing && compareCount >= 3}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
              isComparing
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : compareCount >= 3
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            {isComparing ? (
              <><Check size={14} /> Im Vergleich</>
            ) : (
              <><Scale size={14} /> Vergleichen</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
