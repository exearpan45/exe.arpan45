import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, CheckCircle2, Plus } from 'lucide-react';
import { ThemeConfig } from '../types';
import { playAlarmSound, playButtonBeep } from '../utils/audio';

interface TimerProps {
  theme: ThemeConfig;
  soundEnabled: boolean;
}

const PRESETS = [
  { label: '1 Min', seconds: 60 },
  { label: '3 Min', seconds: 180 },
  { label: '5 Min', seconds: 300 },
  { label: '10 Min', seconds: 600 },
  { label: '15 Min', seconds: 900 },
  { label: '25m Focus', seconds: 1500 },
  { label: '45 Min', seconds: 2700 },
  { label: '1 Hour', seconds: 3600 },
];

export const Timer: React.FC<TimerProps> = ({ theme, soundEnabled }) => {
  const [totalSeconds, setTotalSeconds] = useState(300); // default 5m
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Custom inputs
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customSecs, setCustomSecs] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            if (soundEnabled) {
              playAlarmSound();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, remainingSeconds, soundEnabled]);

  const handleStartPause = () => {
    if (soundEnabled) playButtonBeep();
    if (isCompleted) {
      setIsCompleted(false);
      setRemainingSeconds(totalSeconds);
      setIsRunning(true);
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (soundEnabled) playButtonBeep();
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleSelectPreset = (secs: number) => {
    if (soundEnabled) playButtonBeep();
    setIsRunning(false);
    setIsCompleted(false);
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setIsEditing(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const calculated = customHours * 3600 + customMinutes * 60 + customSecs;
    if (calculated > 0) {
      if (soundEnabled) playButtonBeep();
      setTotalSeconds(calculated);
      setRemainingSeconds(calculated);
      setIsRunning(false);
      setIsCompleted(false);
      setIsEditing(false);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressFraction = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const strokeDashoffset = 440 * (1 - (1 - progressFraction));

  return (
    <section className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="rounded-2xl p-6 sm:p-10 bg-zinc-950/80 border border-zinc-900 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#1e1b4b_0%,_transparent_60%)] opacity-20 pointer-events-none"></div>

        {/* Preset quick buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 mb-6">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSelectPreset(p.seconds)}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
                totalSeconds === p.seconds && !isEditing
                  ? 'bg-zinc-100 text-black border-white font-semibold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 rounded-lg text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
          >
            Custom...
          </button>
        </div>

        {/* Custom duration editor form */}
        {isEditing && (
          <form
            onSubmit={handleApplyCustom}
            className="relative z-10 mb-6 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-center gap-3 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-zinc-500 uppercase">H:</label>
              <input
                type="number"
                min="0"
                max="99"
                value={customHours}
                onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-14 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-center text-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-zinc-500 uppercase">M:</label>
              <input
                type="number"
                min="0"
                max="59"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-14 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-center text-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-mono text-zinc-500 uppercase">S:</label>
              <input
                type="number"
                min="0"
                max="59"
                value={customSecs}
                onChange={(e) => setCustomSecs(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-14 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-center text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-100 text-black hover:bg-white uppercase"
            >
              Set
            </button>
          </form>
        )}

        {/* Circular / Big Digital Display */}
        <div className="relative z-10 flex items-center justify-center my-4">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-zinc-900"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                className={`transition-all duration-500 ease-out ${
                  isCompleted
                    ? 'stroke-emerald-400 animate-pulse'
                    : 'stroke-zinc-300'
                }`}
                strokeWidth="4"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Center time readout */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              {isCompleted ? (
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <span className="text-base font-mono font-bold text-emerald-300 uppercase tracking-widest">
                    TIME EXPIRED
                  </span>
                </div>
              ) : (
                <>
                  <span
                    className={`text-5xl sm:text-6xl font-bold font-mono tracking-tight ${theme.textPrimary}`}
                  >
                    {formatTime(remainingSeconds)}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                    {Math.ceil(remainingSeconds / 60)}m remaining
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex items-center justify-center gap-3 mt-2">
          <button
            id="timer-start-pause-btn"
            onClick={handleStartPause}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-mono font-bold shadow-lg transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                : isCompleted
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                : 'bg-zinc-100 hover:bg-white text-black'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="uppercase">Pause</span>
              </>
            ) : isCompleted ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="uppercase">Restart</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="uppercase">Start</span>
              </>
            )}
          </button>

          <button
            id="timer-reset-btn"
            onClick={handleReset}
            disabled={remainingSeconds === totalSeconds && !isCompleted}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:border-zinc-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="uppercase">Reset</span>
          </button>
        </div>
      </div>
    </section>
  );
};
