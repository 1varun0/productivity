// ── Legacy types (kept for existing store compatibility) ──────────────

export interface TemplateBlock {
  id: string;
  user_id: string;
  name: string;
  category: string;
  color: string;
  start_slot: number;
  duration_slots: number;
  repeat_days: number[];
  created_at: string;
  archived: boolean;
}

export interface ScheduledEntry {
  id: string;
  user_id: string;
  task_id: string | null;
  name: string;
  category: string;
  color: string;
  scheduled_date: string;
  start_slot: number;
  duration_slots: number;
  created_at: string;
}

export interface DayBlock {
  id: string;
  name: string;
  category: string;
  color: string;
  start_slot: number;
  duration_slots: number;
  type: 'template' | 'scheduled';
  locked: boolean;
  task_id?: string | null;
}

export const BLOCK_COLORS = {
  primary:   '#c5c0ff',
  tertiary:  '#84d6b9',
  secondary: '#a4c9ff',
  error:     '#ffb4ab',
  outline:   '#928f9e',
  sky:       '#a3c8ff',
  neutral:   '#353534',
} as const;

export const BLOCK_COLOR_VALUES = Object.values(BLOCK_COLORS);

export const CATEGORIES = ['Work', 'Study', 'Personal', 'Meeting', 'Exercise', 'Break'] as const;

export const DURATION_OPTIONS = [
  { label: '30 min', slots: 1 },
  { label: '1 hr', slots: 2 },
  { label: '1.5 hrs', slots: 3 },
  { label: '2 hrs', slots: 4 },
  { label: '2.5 hrs', slots: 5 },
  { label: '3 hrs', slots: 6 },
] as const;

export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 22;
export const GRID_HOURS = GRID_END_HOUR - GRID_START_HOUR;
export const SLOTS_PER_HOUR = 2;
export const GRID_START_SLOT = GRID_START_HOUR * SLOTS_PER_HOUR;

export function slotToTime(slot: number): string {
  const hours = Math.floor(slot / 2);
  const minutes = (slot % 2) * 30;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function slotToTime12(slot: number): string {
  const hours = Math.floor(slot / 2);
  const minutes = (slot % 2) * 30;
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return minutes === 0 ? `${h12} ${period}` : `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMondayDow(date: Date): number {
  return (date.getDay() + 6) % 7;
}

// ── New 24-hour weekly grid types ──────────────────────────────────────

export type Category =
  | 'sleep'
  | 'class'
  | 'work'
  | 'health'
  | 'meals'
  | 'personal'
  | 'commute'
  | 'free'
  | (string & {});

export interface TimetableBlock {
  id: string;
  user_id: string;
  name: string;
  category: Category;
  color: string;
  day: number;        // 0=Mon, 1=Tue, ..., 6=Sun
  start_hour: number; // 0–23
  duration: number;   // hours
  notes?: string | null;
  created_at: string;
  archived: boolean;
}

export interface BlockFormData {
  name: string;
  category: Category;
  color: string;
  duration: number;
  notes?: string;
}

export interface Deadline {
  id: string;
  user_id: string;
  name: string;
  date: string; // ISO date string "YYYY-MM-DD"
  color: string;
  notes?: string;
  created_at: string;
}

export interface DueDateMarker {
  id: string;
  name: string;
  date: string;
  type: 'task' | 'deadline';
  color: string;
  is_priority?: boolean; // for tasks
  is_overdue?: boolean;
}

export interface WeekRange {
  start: Date; // Monday of the week
  end: Date;   // Sunday of the week
  label: string; // "Jun 9 – Jun 15"
}

export const CATEGORY_COLORS: Record<Category, { border: string; bg: string; text: string }> = {
  sleep:    { border: '#4A4A6A', bg: '#0d0d18', text: '#9090B0' },
  class:    { border: '#534AB7', bg: '#1a1730', text: '#AFA9EC' },
  work:     { border: '#185FA5', bg: '#0d1a26', text: '#85B7EB' },
  health:   { border: '#0F6E56', bg: '#0e1f18', text: '#5DCAA5' },
  meals:    { border: '#BA7517', bg: '#1f1708', text: '#EF9F27' },
  personal: { border: '#993556', bg: '#1a1015', text: '#ED93B1' },
  commute:  { border: '#7A4010', bg: '#1a1008', text: '#C47A3A' },
  free:     { border: '#3A3A3A', bg: '#161616', text: '#666666' },
};

export const CATEGORY_LABELS: Record<Category, string> = {
  sleep: 'Sleep / Rest',
  class: 'Class / Study',
  work: 'Work',
  health: 'Health / Gym',
  meals: 'Meals',
  personal: 'Personal',
  commute: 'Commute',
  free: 'Free time',
};

export const FULL_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export function hourToLabel(hour: number): string {
  if (hour === 0) return '12AM';
  if (hour < 12) return `${hour}AM`;
  if (hour === 12) return '12PM';
  return `${hour - 12}PM`;
}

export function hourTo12(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

export function formatHourRange(start: number, duration: number): string {
  const fmt = (h: number): string => {
    const wrapped = h % 24;
    if (wrapped === 0) return '12:00 AM';
    if (wrapped < 12) return `${wrapped}:00 AM`;
    if (wrapped === 12) return '12:00 PM';
    return `${wrapped - 12}:00 PM`;
  };
  return `${fmt(start)} – ${fmt(start + duration)}`;
}

export function hasConflict(
  blocks: TimetableBlock[],
  day: number,
  startHour: number,
  duration: number,
  excludeId?: string
): boolean {
  return blocks
    .filter(b => b.day === day && b.id !== excludeId && !b.archived)
    .some(b =>
      startHour < b.start_hour + b.duration &&
      startHour + duration > b.start_hour
    );
}

export function getConflictingBlock(
  blocks: TimetableBlock[],
  day: number,
  startHour: number,
  duration: number,
  excludeId?: string
): TimetableBlock | undefined {
  return blocks
    .filter(b => b.day === day && b.id !== excludeId && !b.archived)
    .find(b =>
      startHour < b.start_hour + b.duration &&
      startHour + duration > b.start_hour
    );
}
