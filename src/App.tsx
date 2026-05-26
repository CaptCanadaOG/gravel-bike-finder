import { useState, useMemo } from 'react';
import { bikes as allBikes } from './data/bikes';
import type { Bike, UserProfile, ScoredBike } from './types/bike';
import { scoreBikes } from './utils/recommendation';
import BikeCard from './components/BikeCard';
import FilterPanel, { type Filters } from './components/FilterPanel';
import CompareDrawer from './components/CompareDrawer';
import OnboardingForm from './components/OnboardingForm';
import { Bike as BikeIcon, SlidersHorizontal, X, RotateCcw } from 'lucide-react';

const defaultFilters: Filters = {
  minPrice: 300,
  maxPrice: 1200,
  maxWeight: 13,
  frameMaterial: ['Carbon', 'Aluminium', 'Stahl', 'Titan'],
  brakes: 'Alle',
  wheelSize: 'Alle',
  minTireWidth: 30,
};

type SortKey = 'score' | 'price-asc' | 'price-desc' | 'weight-asc';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scored, setScored] = useState<ScoredBike[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [compareBikes, setCompareBikes] = useState<Bike[]>([]);
  const [sort, setSort] = useState<SortKey>('score');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleProfile = (p: UserProfile) => {
    setProfile(p);
    setScored(scoreBikes(allBikes, p));
  };

  const filtered = useMemo(() => {
    let list = scored.filter(b => {
      const lowestPrice = Math.min(...b.shopLinks.map(s => s.price ?? b.price));
      if (lowestPrice < filters.minPrice) return false;
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
      if (sort === 'score') return b.matchScore - a.matchScore;
      if (sort === 'price-asc') return aPrice - bPrice;
      if (sort === 'price-desc') return bPrice - aPrice;
      return a.weight - b.weight;
    });
    return list;
  }, [scored, filters, sort, search]);

  const toggleCompare = (bike: Bike) => {
    setCompareBikes(prev => {
      if (prev.find(b => b.id === bike.id)) return prev.filter(b => b.id !== bike.id);
      if (prev.length >= 3) return prev;
      return [...prev, bike];
    });
  };

  if (!profile) {
    return <OnboardingForm onSubmit={handleProfile} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BikeIcon className="text-green-600" size={22} />
            <span className="font-black text-lg text-gray-900 hidden sm:block">Gravel Bike Finder</span>
          </div>

          <input
            type="search"
            placeholder="Marke, Modell, Schaltgruppe…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
          >
            <option value="score">Beste Übereinstimmung</option>
            <option value="price-asc">Preis ↑</option>
            <option value="price-desc">Preis ↓</option>
            <option value="weight-asc">Leichteste zuerst</option>
          </select>

          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm hover:bg-gray-50 lg:hidden"
          >
            <SlidersHorizontal size={14} />
            Filter
          </button>

          <button
            onClick={() => { setProfile(null); setScored([]); setCompareBikes([]); }}
            title="Neu starten"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl px-3 py-2"
          >
            <RotateCcw size={13} />
            Neu
          </button>
        </div>

        {/* Profile summary bar */}
        <div className="max-w-7xl mx-auto px-4 pb-2 flex flex-wrap gap-2">
          {[
            { label: `${profile.height} cm` },
            { label: profile.experience === 'beginner' ? 'Einsteiger' : profile.experience === 'intermediate' ? 'Fortgeschritten' : 'Erfahren' },
            { label: profile.terrain === 'road' ? 'Asphalt' : profile.terrain === 'mixed' ? 'Mix' : 'Offroad' },
            { label: profile.priority === 'budget' ? 'Preis' : profile.priority === 'speed' ? 'Tempo' : profile.priority === 'comfort' ? 'Komfort' : 'Abenteuer' },
          ].map(tag => (
            <span key={tag.label} className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              {tag.label}
            </span>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Desktop filter sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            totalCount={scored.length}
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
                totalCount={scored.length}
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
              <p className="text-sm mt-1">Filter anpassen oder <button className="underline text-green-600" onClick={() => setFilters(defaultFilters)}>zurücksetzen</button></p>
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
                  showScore
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CompareDrawer
        bikes={compareBikes}
        onRemove={id => setCompareBikes(prev => prev.filter(b => b.id !== id))}
        onClear={() => setCompareBikes([])}
      />

      {compareBikes.length > 0 && <div className="h-64" />}
    </div>
  );
}
