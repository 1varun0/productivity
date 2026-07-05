import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { TimetableBlock, BlockFormData, Deadline, DueDateMarker } from '@/features/timetable/types';

export interface DueTask {
  id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  is_priority: boolean;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getWeekKey(start: Date): string {
  return start.toISOString().split('T')[0];
}

function computeDueDateMarkers(
  tasks: DueTask[],
  deadlines: Deadline[],
  weekStart: Date
): Record<number, DueDateMarker[]> {
  const result: Record<number, DueDateMarker[]> = {};
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const addMarker = (dayIndex: number, marker: DueDateMarker) => {
    if (!result[dayIndex]) result[dayIndex] = [];
    result[dayIndex].push(marker);
  };

  tasks.forEach(task => {
    if (!task.due_date) return;
    const due = new Date(task.due_date);
    const dayIndex = Math.floor(
      (due.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayIndex < 0 || dayIndex > 6) return;
    
    // Check overdue
    const is_overdue = due < now && !task.completed;
    
    addMarker(dayIndex, {
      id: task.id,
      name: task.title,
      date: task.due_date,
      type: 'task',
      color: '#AFA9EC',
      is_priority: task.is_priority,
      is_overdue
    });
  });

  deadlines.forEach(dl => {
    const due = new Date(dl.date);
    const dayIndex = Math.floor(
      (due.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayIndex < 0 || dayIndex > 6) return;
    
    addMarker(dayIndex, {
      id: dl.id,
      name: dl.name,
      date: dl.date,
      type: 'deadline',
      color: dl.color,
    });
  });

  // Sort markers within each day
  Object.keys(result).forEach(key => {
    result[Number(key)].sort((a, b) => {
      // 1. deadlines first
      if (a.type !== b.type) {
        return a.type === 'deadline' ? -1 : 1;
      }
      // 2. if both tasks, high priority first
      if (a.type === 'task' && b.type === 'task') {
        const aPri = a.is_priority ? 1 : 0;
        const bPri = b.is_priority ? 1 : 0;
        if (aPri !== bPri) return bPri - aPri;
      }
      return 0;
    });
  });

  return result;
}

export type UndoAction = 
  | { type: 'add'; block: TimetableBlock }
  | { type: 'delete'; block: TimetableBlock }
  | { type: 'update'; oldBlock: TimetableBlock; newBlock: TimetableBlock };

interface WeeklyTimetableStore {
  blocks: TimetableBlock[];
  isLoading: boolean;
  isDirty: boolean;
  lastSaved: Date | null;
  undoStack: UndoAction[];

  currentWeekStart: Date;
  deadlines: Deadline[];
  dueTasks: DueTask[]; // cached raw tasks for re-computing markers
  dueDateMarkers: Record<number, DueDateMarker[]>;
  fetchedWeeks: Record<string, Record<number, DueDateMarker[]>>; // cache keys YYYY-MM-DD

  fetchBlocks: () => Promise<void>;
  addBlock: (day: number, startHour: number, data: BlockFormData) => Promise<void>;
  updateBlock: (id: string, data: BlockFormData) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  manualSave: () => Promise<void>;
  undo: () => Promise<void>;

  setWeekOffset: (offset: number) => void;
  fetchDeadlinesAndTasks: (weekStart: Date) => Promise<void>;
  addDeadline: (data: Omit<Deadline, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteDeadline: (id: string) => Promise<void>;
}

export const useWeeklyTimetableStore = create<WeeklyTimetableStore>((set, get) => ({
  blocks: [],
  isLoading: false,
  isDirty: false,
  lastSaved: null,
  undoStack: [],
  currentWeekStart: getWeekStart(new Date()),
  deadlines: [],
  dueTasks: [],
  dueDateMarkers: {},
  fetchedWeeks: {},

  fetchBlocks: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ isLoading: false }); return; }

    const { data, error } = await supabase
      .from('timetable_blocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('start_hour', { ascending: true });

    if (error) {
      console.error('Failed to fetch timetable blocks:', error);
      set({ isLoading: false });
      return;
    }

    set({ blocks: data ?? [], isLoading: false, lastSaved: new Date() });
  },

  addBlock: async (day: number, startHour: number, data: BlockFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tempId = crypto.randomUUID();
    const optimistic: TimetableBlock = {
      id: tempId,
      user_id: user.id,
      name: data.name,
      category: data.category,
      color: data.color,
      day,
      start_hour: startHour,
      duration: data.duration,
      notes: data.notes ?? null,
      created_at: new Date().toISOString(),
      archived: false,
    };

    // Optimistic update
    set(s => ({
      blocks: [...s.blocks, optimistic],
      isDirty: true,
    }));

    const { data: inserted, error } = await supabase
      .from('timetable_blocks')
      .insert({
        user_id: user.id,
        name: data.name,
        category: data.category,
        color: data.color,
        day,
        start_hour: startHour,
        duration: data.duration,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      // Rollback
      set(s => ({
        blocks: s.blocks.filter(b => b.id !== tempId),
        isDirty: false,
      }));
      console.error('Failed to add timetable block:', error);
      return;
    }

    // Replace temp with real
    set(s => ({
      blocks: s.blocks.map(b => b.id === tempId ? inserted : b),
      isDirty: false,
      lastSaved: new Date(),
      undoStack: [...s.undoStack, { type: 'add', block: inserted }]
    }));
  },

  updateBlock: async (id: string, data: BlockFormData) => {
    const prev = get().blocks;

    // Optimistic
    set(s => ({
      blocks: s.blocks.map(b => b.id === id ? { ...b, ...data } : b),
      isDirty: true,
    }));

    const { error } = await supabase
      .from('timetable_blocks')
      .update({
        name: data.name,
        category: data.category,
        color: data.color,
        duration: data.duration,
        notes: data.notes ?? null,
      })
      .eq('id', id);

    if (error) {
      set({ blocks: prev });
      console.error('Failed to update timetable block:', error);
      return;
    }

    set(s => ({ 
      isDirty: false, 
      lastSaved: new Date(),
      undoStack: [...s.undoStack, { 
        type: 'update', 
        oldBlock: prev.find(b => b.id === id)!, 
        newBlock: s.blocks.find(b => b.id === id)! 
      }]
    }));
  },

  deleteBlock: async (id: string) => {
    const prev = get().blocks;

    // Optimistic
    set(s => ({
      blocks: s.blocks.filter(b => b.id !== id),
      isDirty: true,
    }));

    const { error } = await supabase
      .from('timetable_blocks')
      .update({ archived: true })
      .eq('id', id);

    if (error) {
      set({ blocks: prev });
      console.error('Failed to delete timetable block:', error);
      return;
    }

    set(s => ({ 
      isDirty: false, 
      lastSaved: new Date(),
      undoStack: [...s.undoStack, { type: 'delete', block: prev.find(b => b.id === id)! }]
    }));
  },

  manualSave: async () => {
    set({ isDirty: false, lastSaved: new Date() });
  },

  undo: async () => {
    const stack = get().undoStack;
    if (stack.length === 0) return;
    
    const action = stack[stack.length - 1];
    set({ undoStack: stack.slice(0, -1) });
    
    if (action.type === 'add') {
      set(s => ({ blocks: s.blocks.filter(b => b.id !== action.block.id) }));
      await supabase.from('timetable_blocks').delete().eq('id', action.block.id);
    } else if (action.type === 'delete') {
      set(s => ({ blocks: [...s.blocks, action.block] }));
      await supabase.from('timetable_blocks').update({ archived: false }).eq('id', action.block.id);
    } else if (action.type === 'update') {
      set(s => ({ blocks: s.blocks.map(b => b.id === action.oldBlock.id ? action.oldBlock : b) }));
      await supabase.from('timetable_blocks').update({
        name: action.oldBlock.name,
        category: action.oldBlock.category,
        color: action.oldBlock.color,
        duration: action.oldBlock.duration,
        notes: action.oldBlock.notes
      }).eq('id', action.oldBlock.id);
    }
  },

  setWeekOffset: (offset: number) => {
    const current = get().currentWeekStart;
    const next = new Date(current);
    if (offset === 0) {
      next.setTime(getWeekStart(new Date()).getTime());
    } else {
      next.setDate(current.getDate() + (offset * 7));
    }
    
    set({ currentWeekStart: next });
    get().fetchDeadlinesAndTasks(next);
  },

  fetchDeadlinesAndTasks: async (weekStart: Date) => {
    const key = getWeekKey(weekStart);
    // Use cached fetch if already loaded
    if (get().fetchedWeeks[key]) {
      set({ dueDateMarkers: get().fetchedWeeks[key] });
      return;
    }

    const weekEnd = getWeekEnd(weekStart);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, due_date, is_priority, completed')
      .eq('user_id', user.id)
      .gte('due_date', weekStart.toISOString().split('T')[0])
      .lte('due_date', weekEnd.toISOString().split('T')[0])
      .eq('completed', false);

    // Fetch deadlines
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0]);

    if (tasks && deadlines) {
      const markers = computeDueDateMarkers(tasks, deadlines as Deadline[], weekStart);
      
      set(s => ({ 
        dueTasks: tasks, 
        deadlines: deadlines as Deadline[], 
        dueDateMarkers: markers,
        fetchedWeeks: { ...s.fetchedWeeks, [key]: markers } 
      }));
    }
  },

  addDeadline: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('deadlines').insert({
      user_id: user.id,
      ...data
    });

    if (!error) {
      // Clear cache for this week and refetch
      const key = getWeekKey(get().currentWeekStart);
      set(s => {
        const copy = { ...s.fetchedWeeks };
        delete copy[key];
        return { fetchedWeeks: copy };
      });
      get().fetchDeadlinesAndTasks(get().currentWeekStart);
    }
  },

  deleteDeadline: async (id) => {
    const { error } = await supabase.from('deadlines').delete().eq('id', id);
    if (!error) {
      // Clear cache for this week and refetch
      const key = getWeekKey(get().currentWeekStart);
      set(s => {
        const copy = { ...s.fetchedWeeks };
        delete copy[key];
        return { fetchedWeeks: copy };
      });
      get().fetchDeadlinesAndTasks(get().currentWeekStart);
    }
  }
}));
