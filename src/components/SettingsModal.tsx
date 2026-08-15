import React from 'react';
import { X, Sliders, Volume2, Type, Clock, Calendar, Eye } from 'lucide-react';
import { ClockSettings, ThemeConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClockSettings;
  onUpdateSettings: (newSettings: Partial<ClockSettings>) => void;
  theme: ThemeConfig;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-900 p-6 shadow-2xl overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-zinc-400" />
            <h3 className="font-mono text-sm font-bold text-zinc-200 uppercase tracking-[0.15em]">
              Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="py-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1 font-mono">
          {/* Time Format */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">24-Hour Format</div>
                <div className="text-[10px] text-zinc-500 uppercase">International 24h standard</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ is24Hour: !settings.is24Hour })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.is24Hour ? 'bg-zinc-200' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  settings.is24Hour ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Show Seconds */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Seconds Display</div>
                <div className="text-[10px] text-zinc-500 uppercase">Live second telemetry</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ showSeconds: !settings.showSeconds })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.showSeconds ? 'bg-zinc-200' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  settings.showSeconds ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Show Date */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Calendar Date</div>
                <div className="text-[10px] text-zinc-500 uppercase">Show date & progression</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ showDate: !settings.showDate })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.showDate ? 'bg-zinc-200' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  settings.showDate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Blinking Colon */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 text-center font-bold text-zinc-400 font-mono">:</span>
              <div>
                <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Pulse Colon</div>
                <div className="text-[10px] text-zinc-500 uppercase">Flash delimiter on second tick</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ blinkingColon: !settings.blinkingColon })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.blinkingColon ? 'bg-zinc-200' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  settings.blinkingColon ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Audio */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Audio Feedback</div>
                <div className="text-[10px] text-zinc-500 uppercase">Synthesizer tick & alarms</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-zinc-200' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Typography Choice */}
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
            <div className="flex items-center gap-2.5 mb-2.5">
              <Type className="w-4 h-4 text-zinc-400" />
              <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">Typography</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateSettings({ fontStyle: 'mono' })}
                className={`py-1.5 px-2 text-[11px] rounded-lg font-mono border transition-all ${
                  settings.fontStyle === 'mono'
                    ? 'bg-zinc-100 text-black border-white font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Mono
              </button>
              <button
                onClick={() => onUpdateSettings({ fontStyle: 'tech' })}
                className={`py-1.5 px-2 text-[11px] rounded-lg font-mono border transition-all ${
                  settings.fontStyle === 'tech'
                    ? 'bg-zinc-100 text-black border-white font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Tech
              </button>
              <button
                onClick={() => onUpdateSettings({ fontStyle: 'sans' })}
                className={`py-1.5 px-2 text-[11px] rounded-lg font-mono border transition-all ${
                  settings.fontStyle === 'sans'
                    ? 'bg-zinc-100 text-black border-white font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Sans
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg text-xs font-mono font-bold bg-zinc-100 text-black hover:bg-white uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
