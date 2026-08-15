import React, { useState, useEffect, useRef } from 'react';
import { ClockMode, ThemeConfig, ClockSettings, AlarmItem } from './types';
import { THEMES } from './data/themes';
import { Header } from './components/Header';
import { ClockDisplay } from './components/ClockDisplay';
import { WorldClock } from './components/WorldClock';
import { Stopwatch } from './components/Stopwatch';
import { Timer } from './components/Timer';
import { Alarms } from './components/Alarms';
import { AlarmRingingModal } from './components/AlarmRingingModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';

const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-default-1',
    time: '07:00',
    label: 'Wake Up & Shine',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
    createdAt: 1700000000000,
  },
  {
    id: 'alarm-default-2',
    time: '08:30',
    label: 'Morning Sync / Standup',
    enabled: false,
    repeatDays: [1, 2, 3, 4, 5],
    createdAt: 1700000001000,
  },
  {
    id: 'alarm-default-3',
    time: '22:30',
    label: 'Night Wind-down',
    enabled: true,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    createdAt: 1700000002000,
  },
];

export default function App() {
  const [currentMode, setCurrentMode] = useState<ClockMode>('clock');
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
    try {
      const savedThemeId = localStorage.getItem('digital_clock_theme');
      const found = THEMES.find((t) => t.id === savedThemeId);
      return found || THEMES[0];
    } catch {
      return THEMES[0];
    }
  });

  // Settings state
  const [settings, setSettings] = useState<ClockSettings>(() => {
    const defaults: ClockSettings = {
      is24Hour: false,
      showSeconds: true,
      showDate: true,
      showMilliseconds: false,
      blinkingColon: true,
      hourlyChime: false,
      soundEnabled: false,
      fontStyle: 'mono',
      timeZone: 'local',
    };
    try {
      const saved = localStorage.getItem('digital_clock_settings');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  // Alarms state
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem('digital_clock_alarms');
      return saved ? JSON.parse(saved) : INITIAL_ALARMS;
    } catch {
      return INITIAL_ALARMS;
    }
  });

  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);
  const lastTriggeredMinuteRef = useRef<string>('');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('digital_clock_theme', currentTheme.id);
    } catch {
      // Ignore
    }
  }, [currentTheme]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('digital_clock_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Sync alarms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('digital_clock_alarms', JSON.stringify(alarms));
    } catch {
      // Ignore
    }
  }, [alarms]);

  // Background Alarm Checker Loop
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const currentDay = now.getDay();
      const timeKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}T${currentH}:${currentM}`;

      if (lastTriggeredMinuteRef.current === timeKey) {
        return; // Already evaluated for this minute
      }

      const currentTimeStr = `${currentH}:${currentM}`;

      for (const alarm of alarms) {
        if (!alarm.enabled) continue;

        const isMatchingTime = alarm.time === currentTimeStr;
        const isMatchingDay =
          alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay);

        if (isMatchingTime && isMatchingDay) {
          lastTriggeredMinuteRef.current = timeKey;
          setRingingAlarm(alarm);

          // If it's a one-time alarm, disable it after ringing
          if (alarm.repeatDays.length === 0) {
            setAlarms((prev) =>
              prev.map((a) => (a.id === alarm.id ? { ...a, enabled: false } : a))
            );
          }
          break;
        }
      }
    };

    const interval = setInterval(checkAlarms, 1000);
    checkAlarms(); // Initial check
    return () => clearInterval(interval);
  }, [alarms]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Fullscreen might be restricted in an iframe
    }
  };

  const handleUpdateSettings = (newSettings: Partial<ClockSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Alarm management handlers
  const handleAddAlarm = (newAlarmData: Omit<AlarmItem, 'id' | 'createdAt'>) => {
    const newAlarm: AlarmItem = {
      ...newAlarmData,
      id: `alarm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setAlarms((prev) => [newAlarm, ...prev]);
  };

  const handleUpdateAlarm = (id: string, updates: Partial<AlarmItem>) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDismissRingingAlarm = () => {
    setRingingAlarm(null);
  };

  const handleSnoozeRingingAlarm = () => {
    if (!ringingAlarm) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const snoozeH = now.getHours().toString().padStart(2, '0');
    const snoozeM = now.getMinutes().toString().padStart(2, '0');
    const snoozeTime = `${snoozeH}:${snoozeM}`;

    // Add temporary 5-min snooze alarm
    const snoozedAlarmItem: AlarmItem = {
      id: `snooze-${Date.now()}`,
      time: snoozeTime,
      label: `[Snoozed] ${ringingAlarm.label}`,
      enabled: true,
      repeatDays: [],
      createdAt: Date.now(),
    };

    setAlarms((prev) => [snoozedAlarmItem, ...prev]);
    setRingingAlarm(null);
  };

  return (
    <div
      id="app-root-container"
      className={`min-h-screen ${currentTheme.bgClass} text-neutral-100 flex flex-col justify-between transition-colors duration-300 font-sans-ui select-none overflow-x-hidden`}
    >
      {/* Header bar */}
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        is24Hour={settings.is24Hour}
        onToggle24Hour={() => handleUpdateSettings({ is24Hour: !settings.is24Hour })}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-2">
        {currentMode === 'clock' && (
          <ClockDisplay
            theme={currentTheme}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {currentMode === 'world' && (
          <WorldClock
            theme={currentTheme}
            is24Hour={settings.is24Hour}
          />
        )}

        {currentMode === 'stopwatch' && (
          <Stopwatch
            theme={currentTheme}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {currentMode === 'timer' && (
          <Timer
            theme={currentTheme}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {currentMode === 'alarms' && (
          <Alarms
            theme={currentTheme}
            is24Hour={settings.is24Hour}
            soundEnabled={settings.soundEnabled}
            alarms={alarms}
            onAddAlarm={handleAddAlarm}
            onUpdateAlarm={handleUpdateAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            onToggleAlarm={handleToggleAlarm}
          />
        )}
      </main>

      {/* Alarm Ringing Alert Overlay */}
      <AlarmRingingModal
        alarm={ringingAlarm}
        theme={currentTheme}
        is24Hour={settings.is24Hour}
        onDismiss={handleDismissRingingAlarm}
        onSnooze={handleSnoozeRingingAlarm}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        theme={currentTheme}
      />

      {/* Trademark Attribution Footer */}
      <Footer theme={currentTheme} />
    </div>
  );
}
