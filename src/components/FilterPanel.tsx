import { Sliders } from 'lucide-react';

export interface Filters {
  minPrice: number;
  maxPrice: number;
  maxWeight: number;
  frameMaterial: string[];
  brakes: string;
  wheelSize: string;
  minTireWidth: number;
  condition: 'all' | 'new' | 'used';
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  totalCount: number;
  filteredCount: number;
}

const materials = ['Carbon', 'Aluminium', 'Stahl', 'Titan'];

export default function FilterPanel({ filters, onChange, totalCount, filteredCount }: Props) {
  const set = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const toggleMaterial = (m: string) => {
    const next = filters.frameMaterial.includes(m)
      ? filters.frameMaterial.filter(x => x !== m)
      : [...filters.frameMaterial, m];
    set({ frameMaterial: next });
  };

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5 h-fit sticky top-6">
      <div className="flex items-center gap-2">
        <Sliders size={16} className="text-gray-500" />
        <h2 className="font-bold text-gray-900">Filter</h2>
        <span className="ml-auto text-xs text-gray-400">{filteredCount} / {totalCount} Bikes</span>
      </div>

      {/* Condition */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Zustand</p>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Alle' },
            { value: 'new', label: '🆕 Neu' },
            { value: 'used', label: '♻️ Gebraucht' },
          ].map(o => (
            <button
              key={o.value}
              onClick={() => set({ condition: o.value as Filters['condition'] })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                filters.condition === o.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Preis: <span className="text-green-600">{filters.minPrice.toLocaleString('de-DE')} € – {filters.maxPrice.toLocaleString('de-DE')} €</span>
        </label>
        <div className="flex flex-col gap-1">
          <input
            type="range"
            min={300} max={1200} step={50}
            value={filters.minPrice}
            onChange={e => set({ minPrice: Math.min(+e.target.value, filters.maxPrice - 50) })}
            className="w-full accent-green-500"
          />
          <input
            type="range"
            min={300} max={1200} step={50}
            value={filters.maxPrice}
            onChange={e => set({ maxPrice: Math.max(+e.target.value, filters.minPrice + 50) })}
            className="w-full accent-green-500"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>ab 300 €</span><span>bis 1.200 €</span>
        </div>
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Max. Gewicht: <span className="text-green-600">{filters.maxWeight} kg</span>
        </label>
        <input
          type="range" min={7} max={13} step={0.1}
          value={filters.maxWeight}
          onChange={e => set({ maxWeight: +e.target.value })}
          className="w-full accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>7 kg</span><span>13 kg</span>
        </div>
      </div>

      {/* Tire width */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Min. Reifenbreite: <span className="text-green-600">{filters.minTireWidth} mm</span>
        </label>
        <input
          type="range" min={30} max={60} step={5}
          value={filters.minTireWidth}
          onChange={e => set({ minTireWidth: +e.target.value })}
          className="w-full accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>30 mm</span><span>60 mm</span>
        </div>
      </div>

      {/* Frame material */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Rahmenmaterial</p>
        <div className="flex flex-wrap gap-2">
          {materials.map(m => (
            <button
              key={m}
              onClick={() => toggleMaterial(m)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                filters.frameMaterial.includes(m)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Brakes */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Bremsen</p>
        <div className="flex gap-2">
          {['Alle', 'Hydraulisch', 'Mechanisch'].map(b => (
            <button
              key={b}
              onClick={() => set({ brakes: b })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                filters.brakes === b
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Wheel size */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Laufradgröße</p>
        <div className="flex flex-wrap gap-2">
          {['Alle', '700c', '650b', '700c / 650b'].map(w => (
            <button
              key={w}
              onClick={() => set({ wheelSize: w })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                filters.wheelSize === w
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onChange({
          minPrice: 300, maxPrice: 1200, maxWeight: 13,
          frameMaterial: materials, brakes: 'Alle',
          wheelSize: 'Alle', minTireWidth: 30, condition: 'all',
        })}
        className="text-xs text-gray-400 hover:text-gray-600 underline text-left mt-1"
      >
        Filter zurücksetzen
      </button>
    </aside>
  );
}
