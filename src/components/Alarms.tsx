import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Clock, 
  Volume2, 
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AlarmItem, ThemeConfig } from '../types';
import { playAlarmSound, playButtonBeep } from '../utils/audio';

interface AlarmsProps {
  theme: ThemeConfig;
  is24Hour: boolean;
  soundEnabled: boolean;
  alarms: AlarmItem[];
  onAddAlarm: (alarm: Omit<AlarmItem, 'id' | 'createdAt'>) => void;
  onUpdateAlarm: (id: string, updates: Partial<AlarmItem>) => void;
  onDeleteAlarm: (id: string) => void;
  onToggleAlarm: (id: string) => void;
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Alarms: React.FC<AlarmsProps> = ({
  theme,
  is24Hour,
  soundEnabled,
  alarms,
  onAddAlarm,
  onUpdateAlarm,
  onDeleteAlarm,
  onToggleAlarm,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);

  // Form states
  const [formHours, setFormHours] = useState('07');
  const [formMinutes, setFormMinutes] = useState('00');
  const [formLabel, setFormLabel] = useState('');
  const [formDays, setFormDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri

  const openCreateModal = (presetTime?: string, presetLabel?: string) => {
    if (presetTime) {
      const [h, m] = presetTime.split(':');
      setFormHours(h);
      setFormMinutes(m);
    } else {
      const now = new Date();
      const nextHour = (now.getHours() + 1) % 24;
      setFormHours(nextHour.toString().padStart(2, '0'));
      setFormMinutes('00');
    }
    setFormLabel(presetLabel || '');
    setFormDays([1, 2, 3, 4, 5]);
    setEditingAlarmId(null);
    setIsCreating(true);
  };

  const openEditModal = (alarm: AlarmItem) => {
    const [h, m] = alarm.time.split(':');
    setFormHours(h);
    setFormMinutes(m);
    setFormLabel(alarm.label);
    setFormDays(alarm.repeatDays);
    setEditingAlarmId(alarm.id);
    setIsCreating(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const timeStr = `${formHours.padStart(2, '0')}:${formMinutes.padStart(2, '0')}`;
    const labelStr = formLabel.trim() || 'Alarm';

    if (editingAlarmId) {
      onUpdateAlarm(editingAlarmId, {
        time: timeStr,
        label: labelStr,
        repeatDays: formDays,
        enabled: true,
      });
    } else {
      onAddAlarm({
        time: timeStr,
        label: labelStr,
        repeatDays: formDays,
        enabled: true,
      });
    }

    if (soundEnabled) {
      playButtonBeep();
    }

    setIsCreating(false);
    setEditingAlarmId(null);
  };

  const toggleDay = (dayIndex: number) => {
    if (formDays.includes(dayIndex)) {
      setFormDays(formDays.filter((d) => d !== dayIndex));
    } else {
      setFormDays([...formDays, dayIndex].sort((a, b) => a - b));
    }
  };

  const formatDisplayTime = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);

    if (is24Hour) {
      return {
        formatted: `${hStr.padStart(2, '0')}:${mStr.padStart(2, '0')}`,
        ampm: '',
      };
    }

    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return {
      formatted: `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
      ampm,
    };
  };

  const formatDaysSummary = (repeatDays: number[]) => {
    if (repeatDays.length === 0) return 'Once (No repeat)';
    if (repeatDays.length === 7) return 'Every day';
    if (repeatDays.length === 5 && [1, 2, 3, 4, 5].every((d) => repeatDays.includes(d))) {
      return 'Weekdays (Mon - Fri)';
    }
    if (repeatDays.length === 2 && [0, 6].every((d) => repeatDays.includes(d))) {
      return 'Weekends (Sat - Sun)';
    }
    return repeatDays.map((d) => DAYS_SHORT[d]).join(', ');
  };

  const getTimeUntil = (alarmTimeStr: string, repeatDays: number[]) => {
    const [targetH, targetM] = alarmTimeStr.split(':').map(Number);
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentDay = now.getDay();

    let diffMinutes = (targetH * 60 + targetM) - (currentH * 60 + currentM);

    if (repeatDays.length === 0) {
      if (diffMinutes <= 0) diffMinutes += 24 * 60;
    } else {
      let daysAhead = 0;
      let matched = false;
      while (daysAhead < 7) {
        const checkDay = (currentDay + daysAhead) % 7;
        if (repeatDays.includes(checkDay)) {
          if (daysAhead === 0 && diffMinutes > 0) {
            matched = true;
            break;
          } else if (daysAhead > 0) {
            diffMinutes = (daysAhead * 24 * 60) + ((targetH * 60 + targetM) - (currentH * 60 + currentM));
            matched = true;
            break;
          }
        }
        daysAhead++;
      }
      if (!matched && diffMinutes <= 0) {
        diffMinutes += 24 * 60;
      }
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours === 0 && mins === 0) return 'due in < 1 min';
    if (hours === 0) return `in ${mins}m`;
    return `in ${hours}h ${mins}m`;
  };

  const activeAlarmsCount = alarms.filter((a) => a.enabled).length;

  return (
    <section className="w-full max-w-5xl mx-auto py-6 px-4">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Bell className="w-4 h-4 text-zinc-300" />
            </div>
            <h2 className="text-base sm:text-lg font-bold font-mono tracking-wider uppercase text-zinc-100">
              Alarm Chronometers
            </h2>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              {activeAlarmsCount} Active
            </span>
          </div>
          <p className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase mt-1">
            Precision wake-up schedules with custom recurrence & alerts
          </p>
        </div>

        <button
          id="alarm-add-btn"
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-zinc-100 text-black hover:bg-white transition-all shadow-sm uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Set New Alarm</span>
        </button>
      </div>

      {/* Preset Fast Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-zinc-400" /> Quick Presets:
        </span>
        <button
          onClick={() => openCreateModal('06:30', 'Early Morning Kickoff')}
          className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
        >
          06:30 Early Morning
        </button>
        <button
          onClick={() => openCreateModal('07:00', 'Wake Up & Hydrate')}
          className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
        >
          07:00 Wake Up
        </button>
        <button
          onClick={() => openCreateModal('08:30', 'Work Standup / Focus')}
          className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
        >
          08:30 Work Standup
        </button>
        <button
          onClick={() => openCreateModal('22:30', 'Night Wind-down')}
          className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
        >
          22:30 Night Sleep
        </button>
      </div>

      {/* Alarm Modal / Form Drawer */}
      {isCreating && (
        <div className="mb-8 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-900">
            <h3 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-zinc-200 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              {editingAlarmId ? 'Modify Alarm Parameter' : 'Configure New Alarm'}
            </h3>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingAlarmId(null);
              }}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-5">
            {/* Time Selection Block */}
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center p-5 rounded-xl bg-zinc-900/30 border border-zinc-900">
              <div className="flex items-center space-x-2">
                {/* Hours selector */}
                <div className="flex flex-col items-center">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                    Hours (24H)
                  </label>
                  <select
                    id="alarm-form-hours"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className="appearance-none bg-zinc-950 border border-zinc-800 text-2xl sm:text-3xl font-mono font-bold text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-zinc-600 text-center cursor-pointer"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const val = i.toString().padStart(2, '0');
                      return (
                        <option key={val} value={val} className="bg-zinc-950 text-base">
                          {val}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <span className="text-2xl sm:text-3xl font-mono text-zinc-600 self-end mb-2">:</span>

                {/* Minutes selector */}
                <div className="flex flex-col items-center">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                    Minutes
                  </label>
                  <select
                    id="alarm-form-minutes"
                    value={formMinutes}
                    onChange={(e) => setFormMinutes(e.target.value)}
                    className="appearance-none bg-zinc-950 border border-zinc-800 text-2xl sm:text-3xl font-mono font-bold text-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:border-zinc-600 text-center cursor-pointer"
                  >
                    {Array.from({ length: 60 }, (_, i) => {
                      const val = i.toString().padStart(2, '0');
                      return (
                        <option key={val} value={val} className="bg-zinc-950 text-base">
                          {val}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Converted 12h preview badge */}
              <div className="flex flex-col items-center sm:items-start text-xs font-mono text-zinc-400 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-zinc-900 pt-3 sm:pt-0">
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">Preview</span>
                <span className="text-sm font-semibold text-zinc-300">
                  {formatDisplayTime(`${formHours}:${formMinutes}`).formatted}{' '}
                  <span className="text-zinc-500">{formatDisplayTime(`${formHours}:${formMinutes}`).ampm}</span>
                </span>
                <span className="text-[10px] text-zinc-500 mt-1">
                  Will trigger {getTimeUntil(`${formHours}:${formMinutes}`, formDays)}
                </span>
              </div>
            </div>

            {/* Custom Label Input */}
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
                Alarm Label / Note
              </label>
              <input
                id="alarm-form-label"
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="e.g. Wake Up & Morning Run, Medicine Reminder, Team Meeting..."
                maxLength={48}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Repeat Days Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-zinc-400" /> Repeat Schedule
                </label>
                <div className="flex items-center space-x-2 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setFormDays([1, 2, 3, 4, 5])}
                    className="text-zinc-400 hover:text-zinc-200 underline"
                  >
                    Weekdays
                  </button>
                  <span className="text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={() => setFormDays([0, 1, 2, 3, 4, 5, 6])}
                    className="text-zinc-400 hover:text-zinc-200 underline"
                  >
                    Everyday
                  </button>
                  <span className="text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={() => setFormDays([])}
                    className="text-zinc-400 hover:text-zinc-200 underline"
                  >
                    Once
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_SHORT.map((dayName, idx) => {
                  const isSelected = formDays.includes(idx);
                  return (
                    <button
                      key={dayName}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                        isSelected
                          ? 'bg-zinc-200 text-black border border-white font-bold shadow-sm'
                          : 'bg-zinc-900/60 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {dayName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  playAlarmSound();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Test Audio Alert</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingAlarmId(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  id="alarm-form-save-btn"
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-mono font-bold bg-zinc-100 text-black hover:bg-white uppercase tracking-wider shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingAlarmId ? 'Update Alarm' : 'Save Alarm'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Alarms Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alarms.map((alarm) => {
          const display = formatDisplayTime(alarm.time);
          const daysSummary = formatDaysSummary(alarm.repeatDays);
          const countdown = getTimeUntil(alarm.time, alarm.repeatDays);

          return (
            <div
              key={alarm.id}
              className={`p-5 rounded-xl border transition-all duration-200 relative group select-none ${
                alarm.enabled
                  ? 'bg-zinc-950/90 border-zinc-800 shadow-lg'
                  : 'bg-zinc-950/40 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Left Time & Label */}
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span
                      className={`text-3xl sm:text-4xl font-bold font-mono tracking-tight ${
                        alarm.enabled ? theme.textPrimary : 'text-zinc-600'
                      }`}
                    >
                      {display.formatted}
                    </span>
                    {display.ampm && (
                      <span
                        className={`text-xs font-mono font-bold tracking-widest ${
                          alarm.enabled ? 'text-zinc-400' : 'text-zinc-600'
                        }`}
                      >
                        {display.ampm}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`text-xs font-medium font-sans ${
                        alarm.enabled ? 'text-zinc-200' : 'text-zinc-500'
                      }`}
                    >
                      {alarm.label}
                    </span>
                  </div>
                </div>

                {/* Right Toggle Switch */}
                <button
                  id={`alarm-toggle-${alarm.id}`}
                  onClick={() => onToggleAlarm(alarm.id)}
                  aria-label={`Toggle alarm ${alarm.label}`}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    alarm.enabled ? 'bg-zinc-200' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      alarm.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Bottom Schedule & Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center space-x-2 text-zinc-500">
                  <span>{daysSummary}</span>
                  {alarm.enabled && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-400 font-semibold">{countdown}</span>
                    </>
                  )}
                </div>

                {/* Edit & Delete buttons */}
                <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    id={`alarm-edit-${alarm.id}`}
                    onClick={() => openEditModal(alarm)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                    title="Edit alarm parameters"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`alarm-delete-${alarm.id}`}
                    onClick={() => onDeleteAlarm(alarm.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                    title="Delete alarm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {alarms.length === 0 && (
          <div className="col-span-full py-16 px-4 rounded-2xl bg-zinc-950/40 border border-dashed border-zinc-900 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mb-3 text-zinc-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider mb-1">
              No Alarms Configured
            </h4>
            <p className="text-xs font-mono text-zinc-500 max-w-sm mb-4">
              Set precision wake-up calls and reminders with customized repeating schedules.
            </p>
            <button
              onClick={() => openCreateModal()}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-zinc-100 text-black hover:bg-white uppercase tracking-wider shadow-sm"
            >
              + Create First Alarm
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
