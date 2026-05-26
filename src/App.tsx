import { useState, useMemo } from 'react';
import { bikes } from './data/bikes';
import type { Bike } from './types/bike';
import BikeCard from './components/BikeCard';
import FilterPanel, { type Filters } from './components/FilterPanel';
import CompareDrawer from './components/CompareDrawer';
import { Bike as BikeIcon, SlidersHorizontal, X } from 'lucide-react';

const defaultFilters: Filters = {
  maxPrice: 8000,
  maxWeight: 13,
  frameMaterial: ['Carbon', 'Aluminium', 'Stahl', 'Titan'],
  brakes: 'Alle',
  wheelSize: 'Alle',
  minTireWidth: 30,
};

type SortKey = 'price-asc' | 'price-desc' | 'weight-asc' | 'name-asc';

export default function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [compareBikes, setCompareBikes] = useState<Bike[]>([]);
  const [sort, setSort] = useState<SortKey>('price-asc');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = bikes.filter(b => {
      const lowestPrice = Math.min(...b.shopLinks.map(s => s.price ?? b.price));
      if (lowestPrice > filters.maxPrice) return false;
      if (b.weight > filters.maxWeight) return false;
      if (!filters.frameMaterial.includes(b.frameMaterial)) return false;
      if (filters.brakes !== 'Alle' && b.brakes !== filters.brakes) return false;
      if (filters.wheelSize !== 'Alle' && b.wheelSize !== filters.wheelSize) return false;
      if (b.tireWidth < filters.minTireWidth) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${b.brand} ${b.model} ${b.groupset}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      const aPrice = Math.min(...a.shopLinks.map(s => s.price ?? a.price));
      const bPrice = Math.min(...b.shopLinks.map(s => s.price ?? b.price));
      if (sort === 'price-asc') return aPrice - bPrice;
      if (sort === 'price-desc') return bPrice - aPrice;
      if (sort === 'weight-asc') return a.weight - b.weight;
      return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
    });
    return list;
  }, [filters, sort, search]);

  const toggleCompare = (bike: Bike) => {
    setCompareBikes(prev => {
      if (prev.find(b => b.id === bike.id)) return prev.filter(b => b.id !== bike.id);
      if (prev.length >= 3) return prev;
      return [...prev, bike];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 mr-2">
            <BikeIcon className="text-green-600" size={24} />
            <span className="font-black text-xl text-gray-900">Gravel Bike Finder</span>
          </div>

          <input
            type="search"
            placeholder="Suche nach Marke, Modell, Schaltgruppe…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
          >
            <option value="price-asc">Preis ↑</option>
            <option value="price-desc">Preis ↓</option>
            <option value="weight-asc">Leichteste zuerst</option>
            <option value="name-asc">Name A–Z</option>
          </select>

          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm hover:bg-gray-50 lg:hidden"
          >
            <SlidersHorizontal size={14} />
            Filter
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Filter sidebar — desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            totalCount={bikes.length}
            filteredCount={filtered.length}
          />
        </div>

        {/* Mobile filter overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Filter</span>
                <button onClick={() => setShowFilters(false)}><X size={18} /></button>
              </div>
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                totalCount={bikes.length}
                filteredCount={filtered.length}
              />
            </div>
          </div>
        )}

        {/* Bike grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <BikeIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Keine Bikes gefunden</p>
              <p className="text-sm mt-1">Versuche die Filter anzupassen</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(bike => (
                <BikeCard
                  key={bike.id}
                  bike={bike}
                  onCompare={toggleCompare}
                  isComparing={!!compareBikes.find(b => b.id === bike.id)}
                  compareCount={compareBikes.length}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Compare drawer */}
      <CompareDrawer
        bikes={compareBikes}
        onRemove={id => setCompareBikes(prev => prev.filter(b => b.id !== id))}
        onClear={() => setCompareBikes([])}
      />

      {compareBikes.length > 0 && <div className="h-64" />}
    </div>
  );
}
