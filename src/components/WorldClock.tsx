import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe2, Sun, Moon, Search, Clock } from 'lucide-react';
import { ThemeConfig, WorldClockCity } from '../types';
import { DEFAULT_CITIES } from '../data/themes';

interface WorldClockProps {
  theme: ThemeConfig;
  is24Hour: boolean;
}

const ALL_AVAILABLE_CITIES: WorldClockCity[] = [
  ...DEFAULT_CITIES,
  { id: 'sanfrancisco', city: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { id: 'chicago', city: 'Chicago', country: 'United States', timezone: 'America/Chicago', flag: '🇺🇸' },
  { id: 'toronto', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' },
  { id: 'saopaulo', city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { id: 'berlin', city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { id: 'rome', city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', flag: '🇮🇹' },
  { id: 'moscow', city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', flag: '🇷🇺' },
  { id: 'beijing', city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { id: 'hongkong', city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬' },
  { id: 'johannesburg', city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', flag: '🇿🇦' },
  { id: 'auckland', city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿' },
];

export const WorldClock: React.FC<WorldClockProps> = ({ theme, is24Hour }) => {
  const [cities, setCities] = useState<WorldClockCity[]>(() => {
    try {
      const saved = localStorage.getItem('world_clock_cities');
      return saved ? JSON.parse(saved) : DEFAULT_CITIES.slice(0, 6);
    } catch {
      return DEFAULT_CITIES.slice(0, 6);
    }
  });

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('world_clock_cities', JSON.stringify(cities));
    } catch {
      // Ignore
    }
  }, [cities]);

  const handleAddCity = (city: WorldClockCity) => {
    if (!cities.some((c) => c.id === city.id)) {
      setCities([...cities, city]);
    }
    setIsAdding(false);
    setSearchQuery('');
  };

  const handleRemoveCity = (id: string) => {
    setCities(cities.filter((c) => c.id !== id));
  };

  const getCityTime = (timezone: string) => {
    try {
      const timeString = currentTime.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: !is24Hour,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const dateString = currentTime.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      // Calculate hour offset relative to local
      const localHours = currentTime.getHours() + currentTime.getMinutes() / 60;
      const targetDate = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
      const targetHours = targetDate.getHours() + targetDate.getMinutes() / 60;
      let diff = Math.round(targetHours - localHours);
      if (diff > 12) diff -= 24;
      if (diff < -12) diff += 24;

      const isDay = targetDate.getHours() >= 6 && targetDate.getHours() < 18;

      return {
        time: timeString,
        date: dateString,
        isDay,
        offsetStr: diff === 0 ? 'Same time' : diff > 0 ? `+${diff}h ahead` : `${diff}h behind`,
      };
    } catch {
      return { time: '--:--', date: '---', isDay: true, offsetStr: '' };
    }
  };

  const filteredCities = ALL_AVAILABLE_CITIES.filter(
    (c) =>
      !cities.some((existing) => existing.id === c.id) &&
      (c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section className="w-full max-w-5xl mx-auto py-6 px-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider uppercase text-zinc-100">
              World Time Zones
            </h2>
          </div>
          <p className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase mt-0.5">
            Synchronized global chronometer matrix
          </p>
        </div>

        <button
          id="world-clock-add-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-zinc-600 hover:text-white transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Close Search' : '+ Add Location'}</span>
        </button>
      </div>

      {/* City search dialog */}
      {isAdding && (
        <div className="mb-6 p-4 rounded-xl bg-zinc-950 border border-zinc-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="world-clock-search-input"
              type="text"
              placeholder="Search major city or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleAddCity(city)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/30 border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/80 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{city.flag}</span>
                  <div>
                    <div className="text-xs font-mono font-medium text-zinc-200 group-hover:text-white">
                      {city.city}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">{city.country}</div>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300" />
              </button>
            ))}
            {filteredCities.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs font-mono text-zinc-600">
                No matching locations found or already added.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of city clocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => {
          const info = getCityTime(city.timezone);
          return (
            <div
              key={city.id}
              className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-900 hover:border-zinc-800 shadow-md relative group transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{city.flag}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200 font-sans">{city.city}</h3>
                    <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{city.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {info.isDay ? (
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400" title="Daytime">
                      <Sun className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="p-1 rounded bg-indigo-500/10 text-indigo-400" title="Nighttime">
                      <Moon className="w-3 h-3" />
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveCity(city.id)}
                    className="p-1 rounded text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove city"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Time display */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex items-baseline justify-between">
                <div>
                  <div className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight ${theme.textPrimary}`}>
                    {info.time}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
                    {info.date}
                  </div>
                </div>
                <div className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {info.offsetStr}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
