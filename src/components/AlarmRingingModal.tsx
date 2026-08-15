import React, { useEffect } from 'react';
import { Bell, Volume2, Clock, Check, RotateCcw } from 'lucide-react';
import { AlarmItem, ThemeConfig } from '../types';
import { playAlarmSound } from '../utils/audio';

interface AlarmRingingModalProps {
  alarm: AlarmItem | null;
  theme: ThemeConfig;
  is24Hour: boolean;
  onDismiss: () => void;
  onSnooze: () => void;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  alarm,
  is24Hour,
  onDismiss,
  onSnooze,
}) => {
  useEffect(() => {
    if (!alarm) return;

    // Play alarm sound immediately and repeat every 1.2 seconds while active
    playAlarmSound();
    const interval = setInterval(() => {
      playAlarmSound();
    }, 1200);

    return () => clearInterval(interval);
  }, [alarm]);

  if (!alarm) return null;

  const [hStr, mStr] = alarm.time.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  let formattedTime = `${hStr.padStart(2, '0')}:${mStr.padStart(2, '0')}`;
  let ampm = '';
  if (!is24Hour) {
    ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    formattedTime = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-700 p-8 shadow-[0_0_80px_rgba(255,255,255,0.1)] text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsing indicator */}
        <div className="mx-auto w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-6 relative animate-pulse">
          <div className="absolute inset-0 rounded-full bg-white/10 animate-ping"></div>
          <Bell className="w-8 h-8 text-zinc-100" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-[0.25em] text-zinc-400 uppercase mb-2">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Active Chronometer Alert</span>
        </div>

        {/* Time display */}
        <div className="text-5xl sm:text-6xl font-bold font-mono tracking-tighter text-white my-2">
          {formattedTime} <span className="text-xl font-mono text-zinc-400">{ampm}</span>
        </div>

        {/* Alarm custom label */}
        <div className="text-lg font-semibold text-zinc-100 mb-6 font-sans">
          {alarm.label || 'Alarm Notification'}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-900">
          <button
            id="alarm-modal-snooze-btn"
            onClick={onSnooze}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-medium text-zinc-300 hover:border-zinc-600 hover:text-white transition-all uppercase tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Snooze (5m)</span>
          </button>

          <button
            id="alarm-modal-dismiss-btn"
            onClick={onDismiss}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold transition-all uppercase tracking-wider shadow-lg"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
};
