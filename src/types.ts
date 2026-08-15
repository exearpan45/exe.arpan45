export type ClockMode = 'clock' | 'world' | 'stopwatch' | 'timer' | 'alarms';

export type ThemeId = 'sleek-void' | 'cyber-cyan' | 'matrix-emerald' | 'amber-glow' | 'sunset-rose' | 'deep-space' | 'minimal-light' | 'retro-quartz';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgClass: string;
  containerBg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentBorder: string;
  glowClass: string;
  digitBg: string;
  isLight?: boolean;
}

export interface ClockSettings {
  is24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
  showMilliseconds: boolean;
  blinkingColon: boolean;
  hourlyChime: boolean;
  soundEnabled: boolean;
  fontStyle: 'mono' | 'tech' | 'sans';
  timeZone: string;
}

export interface AlarmItem {
  id: string;
  time: string; // 'HH:mm' 24-hour format e.g. '07:30'
  label: string;
  enabled: boolean;
  repeatDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat; empty = once
  createdAt: number;
}

export interface WorldClockCity {
  id: string;
  city: string;
  country: string;
  timezone: string;
  flag: string;
}

export interface LapTime {
  lapNumber: number;
  time: number;
  split: number;
}
