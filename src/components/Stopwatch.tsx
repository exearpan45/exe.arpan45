import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Timer, Award } from 'lucide-react';
import { ThemeConfig, LapTime } from '../types';
import { playButtonBeep } from '../utils/audio';

interface StopwatchProps {
  theme: ThemeConfig;
  soundEnabled: boolean;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ theme, soundEnabled }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<LapTime[]>([]);
  
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTime;
      
      const loop = () => {
        setElapsedTime(performance.now() - startTimeRef.current);
        animationFrameRef.current = requestAnimationFrame(loop);
      };
      
      animationFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  const handleStartPause = () => {
    if (soundEnabled) playButtonBeep();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    if (soundEnabled) playButtonBeep();
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning) return;
    if (soundEnabled) playButtonBeep();

    const previousTotal = laps.length > 0 ? laps[0].time : 0;
    const split = elapsedTime - previousTotal;

    const newLap: LapTime = {
      lapNumber: laps.length + 1,
      time: elapsedTime,
      split: split > 0 ? split : elapsedTime,
    };

    setLaps([newLap, ...laps]);
  };

  const formatTimeParts = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      centiseconds: String(centiseconds).padStart(2, '0'),
    };
  };

  const currentFormatted = formatTimeParts(elapsedTime);

  // Find fastest & slowest lap splits
  let fastestSplit = Infinity;
  let slowestSplit = -Infinity;

  if (laps.length > 1) {
    laps.forEach((l) => {
      if (l.split < fastestSplit) fastestSplit = l.split;
      if (l.split > slowestSplit) slowestSplit = l.split;
    });
  }

  return (
    <section className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="rounded-2xl p-6 sm:p-10 bg-zinc-950/80 border border-zinc-900 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#1e1b4b_0%,_transparent_60%)] opacity-20 pointer-events-none"></div>

        {/* Header tag */}
        <div className="relative z-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase mb-4">
          <Timer className="w-3.5 h-3.5 text-zinc-400" />
          <span>Chronograph Precision Engine</span>
        </div>

        {/* Stopwatch Main Display */}
        <div className="relative z-10 flex items-baseline justify-center font-mono my-4 select-none">
          {parseInt(currentFormatted.hours, 10) > 0 && (
            <>
              <span className={`text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter ${theme.textPrimary}`}>
                {currentFormatted.hours}
              </span>
              <span className="text-3xl sm:text-5xl font-light text-zinc-700 px-1">:</span>
            </>
          )}
          <span className={`text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter ${theme.textPrimary}`}>
            {currentFormatted.minutes}
          </span>
          <span className="text-3xl sm:text-5xl font-light text-zinc-700 px-1">:</span>
          <span className={`text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter ${theme.textPrimary}`}>
            {currentFormatted.seconds}
          </span>
          <span className="text-2xl sm:text-4xl font-light text-zinc-600 ml-2">
            .{currentFormatted.centiseconds}
          </span>
        </div>

        {/* Controls */}
        <div className="relative z-10 flex items-center justify-center gap-3 mt-6">
          <button
            id="stopwatch-lap-btn"
            onClick={handleLap}
            disabled={!isRunning && elapsedTime === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:border-zinc-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="uppercase">Lap</span>
          </button>

          <button
            id="stopwatch-start-pause-btn"
            onClick={handleStartPause}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-mono font-bold shadow-lg transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                : 'bg-zinc-100 hover:bg-white text-black'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="uppercase">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="uppercase">{elapsedTime > 0 ? 'Resume' : 'Start'}</span>
              </>
            )}
          </button>

          <button
            id="stopwatch-reset-btn"
            onClick={handleReset}
            disabled={elapsedTime === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:border-zinc-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="uppercase">Reset</span>
          </button>
        </div>

        {/* Laps List */}
        {laps.length > 0 && (
          <div className="relative z-10 w-full mt-8 pt-6 border-t border-zinc-900">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-3 px-2">
              <span>Lap</span>
              <span>Split Time</span>
              <span>Overall Time</span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
              {laps.map((lap) => {
                const isFastest = laps.length > 1 && lap.split === fastestSplit;
                const isSlowest = laps.length > 1 && lap.split === slowestSplit;

                const splitFmt = formatTimeParts(lap.split);
                const overallFmt = formatTimeParts(lap.time);

                return (
                  <div
                    key={lap.lapNumber}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      isFastest
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : isSlowest
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                        : 'bg-zinc-900/40 border-zinc-900 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">#{lap.lapNumber}</span>
                      {isFastest && (
                        <span className="flex items-center gap-1 text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                          <Award className="w-2.5 h-2.5" /> Best
                        </span>
                      )}
                    </div>
                    <div className="font-semibold">
                      +{splitFmt.minutes}:{splitFmt.seconds}.{splitFmt.centiseconds}
                    </div>
                    <div className="text-zinc-500">
                      {overallFmt.minutes}:{overallFmt.seconds}.{overallFmt.centiseconds}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
