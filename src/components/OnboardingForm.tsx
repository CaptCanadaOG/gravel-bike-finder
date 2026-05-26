import { useState } from 'react';
import type { UserProfile } from '../types/bike';
import { Bike, ChevronRight, Mountain, Wind, MapPin } from 'lucide-react';

interface Props {
  onSubmit: (profile: UserProfile) => void;
}

const experienceOptions = [
  { value: 'beginner', label: 'Einsteiger', desc: 'Kaum Erfahrung, suche ein unkompliziertes Bike' },
  { value: 'intermediate', label: 'Fortgeschritten', desc: 'Fahre regelmäßig, kenne Schaltgruppen' },
  { value: 'advanced', label: 'Erfahren', desc: 'Viel Fahrpraxis, will das Beste herausholen' },
] as const;

const terrainOptions = [
  { value: 'road', label: 'Asphalt', desc: 'Hauptsächlich Straße, gelegentlich Schotter', icon: Wind },
  { value: 'mixed', label: 'Mix', desc: 'Halb Asphalt, halb Schotter & Feldwege', icon: MapPin },
  { value: 'offroad', label: 'Offroad', desc: 'Schotter, Trails & raueres Gelände', icon: Mountain },
] as const;

const priorityOptions = [
  { value: 'budget', label: 'Preis', desc: 'Möglichst günstig', icon: '💶' },
  { value: 'speed', label: 'Tempo', desc: 'Leicht & schnell', icon: '⚡' },
  { value: 'comfort', label: 'Komfort', desc: 'Entspannte Sitzposition', icon: '🛋️' },
  { value: 'adventure', label: 'Abenteuer', desc: 'Touren & Bikepacking', icon: '🏕️' },
] as const;

export default function OnboardingForm({ onSubmit }: Props) {
  const [height, setHeight] = useState(175);
  const [experience, setExperience] = useState<UserProfile['experience'] | ''>('');
  const [terrain, setTerrain] = useState<UserProfile['terrain'] | ''>('');
  const [priority, setPriority] = useState<UserProfile['priority'] | ''>('');

  const valid = experience && terrain && priority;

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit({ height, experience, terrain, priority });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-stone-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-green-600 text-white p-2 rounded-xl">
            <Bike size={24} />
          </div>
          <span className="font-black text-2xl text-gray-900">Gravel Bike Finder</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welches Bike passt zu dir?</h1>
            <p className="text-gray-500 mt-1">Beantworte 4 Fragen – wir empfehlen die besten Bikes für dich.</p>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Deine Körpergröße: <span className="text-green-600 text-base">{height} cm</span>
            </label>
            <input
              type="range"
              min={155}
              max={205}
              value={height}
              onChange={e => setHeight(+e.target.value)}
              className="w-full accent-green-500 h-2"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>155 cm</span>
              <span>180 cm</span>
              <span>205 cm</span>
            </div>
          </div>

          {/* Experience */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Deine Fahrerfahrung</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {experienceOptions.map(o => (
                <button
                  key={o.value}
                  onClick={() => setExperience(o.value)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    experience === o.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <p className="font-bold text-gray-900 text-sm">{o.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Terrain */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Wo fährst du hauptsächlich?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {terrainOptions.map(o => (
                <button
                  key={o.value}
                  onClick={() => setTerrain(o.value)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    terrain === o.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <o.icon size={18} className={terrain === o.value ? 'text-green-600' : 'text-gray-400'} />
                  <p className="font-bold text-gray-900 text-sm mt-1">{o.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Was ist dir am wichtigsten?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {priorityOptions.map(o => (
                <button
                  key={o.value}
                  onClick={() => setPriority(o.value)}
                  className={`text-center p-4 rounded-2xl border-2 transition-all ${
                    priority === o.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{o.icon}</span>
                  <p className="font-bold text-gray-900 text-sm mt-1">{o.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!valid}
            className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all ${
              valid
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Bikes empfehlen
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
