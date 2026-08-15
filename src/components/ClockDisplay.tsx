import React, { useEffect, useState } from 'react';
import { Calendar, Globe2, Sun, Moon, Compass, Sparkles } from 'lucide-react';
import { ThemeConfig, ClockSettings } from '../types';
import { playTickSound } from '../utils/audio';

interface ClockDisplayProps {
  theme: ThemeConfig;
  settings: ClockSettings;
  onUpdateSettings: (newSettings: Partial<ClockSettings>) => void;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  theme,
  settings,
  onUpdateSettings,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [colonVisible, setColonVisible] = useState(true);

  // Synchronized clock update
  useEffect(() => {
    let animationFrameId: number;

    const updateTime = () => {
      const now = new Date();
      setTime(now);

      // Blinking colon toggles every 500ms
      if (settings.blinkingColon) {
        setColonVisible(now.getMilliseconds() < 500);
      } else {
        setColonVisible(true);
      }

      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings.blinkingColon]);

  // Hourly chime and second tick
  useEffect(() => {
    if (!settings.soundEnabled) return;
    
    // Optional tick sound
    const interval = setInterval(() => {
      // Gentle tick if sound enabled
      playTickSound();
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.soundEnabled]);

  // Calculate local time for selected timezone if customized
  const getTimeInZone = () => {
    if (!settings.timeZone || settings.timeZone === 'local') {
      return time;
    }
    try {
      const invDate = new Date(time.toLocaleString('en-US', { timeZone: settings.timeZone }));
      return invDate;
    } catch {
      return time;
    }
  };

  const displayTime = getTimeInZone();

  // Extract hours, minutes, seconds, milliseconds
  let rawHours = displayTime.getHours();
  const isPM = rawHours >= 12;
  const ampm = isPM ? 'PM' : 'AM';

  let displayHours = rawHours;
  if (!settings.is24Hour) {
    displayHours = rawHours % 12 || 12;
  }

  const hoursStr = String(displayHours).padStart(2, '0');
  const minutesStr = String(displayTime.getMinutes()).padStart(2, '0');
  const secondsStr = String(displayTime.getSeconds()).padStart(2, '0');
  const millisecondsStr = String(Math.floor(displayTime.getMilliseconds() / 10)).padStart(2, '0');

  // Date formatting
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: settings.timeZone && settings.timeZone !== 'local' ? settings.timeZone : undefined,
  };
  const dateFormatted = displayTime.toLocaleDateString(undefined, options);

  // Day calculations
  const startOfYear = new Date(displayTime.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((displayTime.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weekOfYear = Math.ceil(dayOfYear / 7);

  // Day progress (0 to 100%)
  const totalSecondsToday = displayTime.getHours() * 3600 + displayTime.getMinutes() * 60 + displayTime.getSeconds();
  const dayProgressPercent = ((totalSecondsToday / 86400) * 100).toFixed(1);

  // Timezone string
  const resolvedTimeZone = settings.timeZone && settings.timeZone !== 'local'
    ? settings.timeZone
    : Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fontClass =
    settings.fontStyle === 'tech'
      ? 'font-tech'
      : settings.fontStyle === 'sans'
      ? 'font-sans-ui'
      : 'font-mono-digital';

  return (
    <section className="w-full flex-grow flex flex-col items-center justify-center py-6 sm:py-10 px-4 relative overflow-hidden">
      {/* Sleek radial atmospheric glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#1e1b4b_0%,_transparent_60%)] opacity-25 pointer-events-none"></div>

      <div
        id="digital-clock-container"
        className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center transition-all duration-300"
      >
        {/* Top subtle micro-indicator */}
        <div className="flex items-center gap-2 mb-2 sm:mb-4 text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase">
          {rawHours >= 6 && rawHours < 18 ? (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Sun className="w-3 h-3 text-amber-400/80" /> Solar Transit Phase
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Moon className="w-3 h-3 text-indigo-400/80" /> Nocturnal Phase
            </span>
          )}
          <span>•</span>
          <span>CHRONO REF 2026</span>
        </div>

        {/* Hero Time Display */}
        <div className="flex flex-col items-center justify-center my-2 sm:my-6 select-none">
          <div className="flex items-baseline justify-center space-x-2 sm:space-x-4 md:space-x-6">
            {/* Hours : Minutes */}
            <div className="flex items-baseline">
              <span
                className={`text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-bold tracking-tighter leading-none ${theme.textPrimary} ${fontClass}`}
              >
                {hoursStr}
              </span>
              <span
                className={`text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-light leading-none mx-0.5 sm:mx-1 ${
                  colonVisible ? 'text-zinc-400 opacity-100' : 'text-zinc-700 opacity-20'
                } transition-opacity duration-150 font-mono`}
              >
                :
              </span>
              <span
                className={`text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-bold tracking-tighter leading-none ${theme.textPrimary} ${fontClass}`}
              >
                {minutesStr}
              </span>
            </div>

            {/* Seconds (Sleek side column or trailing) */}
            {settings.showSeconds && (
              <div className="flex items-baseline self-end pb-2 sm:pb-6 md:pb-8">
                <span className="text-3xl sm:text-5xl md:text-6xl font-light text-zinc-600 font-mono tracking-tighter">
                  {secondsStr}
                </span>
                {settings.showMilliseconds && (
                  <span className="text-xs sm:text-sm font-mono text-zinc-600 ml-1">
                    .{millisecondsStr}
                  </span>
                )}
              </div>
            )}

            {/* AM / PM badge if 12h */}
            {!settings.is24Hour && (
              <div className="self-start mt-2 sm:mt-4">
                <span
                  id="clock-ampm-badge"
                  className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase bg-zinc-900 border border-zinc-800 text-zinc-300"
                >
                  {ampm}
                </span>
              </div>
            )}
          </div>

          {/* Date row with sleek horizontal rules */}
          {settings.showDate && (
            <div className="flex items-center justify-center space-x-4 sm:space-x-8 md:space-x-12 mt-4 sm:mt-8">
              <div className="h-px w-8 sm:w-16 md:w-24 bg-zinc-800/80"></div>
              <div className="text-xs sm:text-base md:text-lg font-light tracking-[0.25em] sm:tracking-[0.35em] uppercase text-zinc-400 font-sans text-center">
                {dateFormatted}
              </div>
              <div className="h-px w-8 sm:w-16 md:w-24 bg-zinc-800/80"></div>
            </div>
          )}
        </div>

        {/* Minimalist Day Progress Bar */}
        <div className="w-full max-w-xl mx-auto mt-4 px-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
            <span>Diurnal Progress</span>
            <span className="text-zinc-400 font-semibold">{dayProgressPercent}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-zinc-400 transition-all duration-300"
              style={{ width: `${dayProgressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Sleek Bottom Quick-Action Toggles */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <button
            id="quick-toggle-seconds"
            onClick={() => onUpdateSettings({ showSeconds: !settings.showSeconds })}
            className={`px-3 py-1 rounded-lg border transition-all text-[11px] ${
              settings.showSeconds
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {settings.showSeconds ? 'Seconds: ON' : 'Seconds: OFF'}
          </button>
          <button
            id="quick-toggle-format"
            onClick={() => onUpdateSettings({ is24Hour: !settings.is24Hour })}
            className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all text-[11px]"
          >
            Mode: <span className="font-semibold text-zinc-200">{settings.is24Hour ? '24H' : '12H'}</span>
          </button>
          <button
            id="quick-toggle-colon"
            onClick={() => onUpdateSettings({ blinkingColon: !settings.blinkingColon })}
            className={`px-3 py-1 rounded-lg border transition-all text-[11px] ${
              settings.blinkingColon
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {settings.blinkingColon ? 'Pulse: ACTIVE' : 'Pulse: STATIC'}
          </button>
        </div>
      </div>
    </section>
  );
};
