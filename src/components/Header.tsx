import React from 'react';
import { Clock, Globe, Timer as TimerIcon, Play, Bell, Volume2, VolumeX, Maximize2, Minimize2, Settings, ShieldCheck } from 'lucide-react';
import { ClockMode, ThemeConfig } from '../types';
import { THEMES } from '../data/themes';

interface HeaderProps {
  currentMode: ClockMode;
  onModeChange: (mode: ClockMode) => void;
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  is24Hour: boolean;
  onToggle24Hour: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  currentTheme,
  onThemeChange,
  is24Hour,
  onToggle24Hour,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
}) => {
  return (
    <header className="w-full border-b border-zinc-900 bg-[#050505]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4 transition-colors">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left Telemetry / System status */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-zinc-400 uppercase font-medium">
                System Active / Lat 22.57° N
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-600">|</span>
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono tracking-[0.15em] text-zinc-500 uppercase">
                <ShieldCheck className="w-3 h-3 text-zinc-400" />
                <span>® 2026 Arpan Goswami</span>
              </span>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              id="mobile-sound-toggle"
              onClick={onToggleSound}
              aria-label="Toggle Sound"
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-zinc-200" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
            </button>
            <button
              id="mobile-settings-btn"
              onClick={onOpenSettings}
              aria-label="Settings"
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center Navigation Modes */}
        <nav className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-900 text-xs font-mono tracking-wider shadow-inner">
          <button
            id="nav-mode-clock"
            onClick={() => onModeChange('clock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'clock'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="uppercase text-[11px]">Clock</span>
          </button>
          <button
            id="nav-mode-world"
            onClick={() => onModeChange('world')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'world'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase text-[11px]">World</span>
          </button>
          <button
            id="nav-mode-stopwatch"
            onClick={() => onModeChange('stopwatch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'stopwatch'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span className="uppercase text-[11px]">Stopwatch</span>
          </button>
          <button
            id="nav-mode-alarms"
            onClick={() => onModeChange('alarms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'alarms'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="uppercase text-[11px]">Alarms</span>
          </button>
          <button
            id="nav-mode-timer"
            onClick={() => onModeChange('timer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'timer'
                ? 'bg-zinc-800 text-white font-semibold border border-zinc-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <TimerIcon className="w-3.5 h-3.5" />
            <span className="uppercase text-[11px]">Timer</span>
          </button>
        </nav>

        {/* Desktop Controls & Location/UTC readout */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase pr-2 border-r border-zinc-900">
            UTC +5.5 / KOLKATA, IN
          </div>

          {/* 12H / 24H Toggle */}
          <button
            id="header-toggle-format"
            onClick={onToggle24Hour}
            className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-900 text-[11px] font-mono font-medium text-zinc-400 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
            title="Toggle 12/24 hour format"
          >
            {is24Hour ? '24H' : '12H'}
          </button>

          {/* Theme Selector */}
          <div className="relative group">
            <select
              id="header-theme-selector"
              value={currentTheme.id}
              onChange={(e) => {
                const selected = THEMES.find((t) => t.id === e.target.value);
                if (selected) onThemeChange(selected);
              }}
              className="appearance-none px-2.5 py-1 pr-6 rounded-lg bg-zinc-950 border border-zinc-900 text-[11px] font-mono text-zinc-400 cursor-pointer hover:border-zinc-700 hover:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            >
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id} className="bg-zinc-950 text-zinc-200">
                  {theme.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 text-[9px]">
              ▼
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            id="header-toggle-sound"
            onClick={onToggleSound}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-zinc-200" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="header-toggle-fullscreen"
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Settings Modal */}
          <button
            id="header-open-settings"
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
            title="Clock Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
