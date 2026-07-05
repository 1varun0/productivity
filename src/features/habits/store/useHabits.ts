import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  archived: boolean;
  created_at: string;
}

interface HabitsState {
  habits: Habit[];
  entriesMap: Record<string, boolean>; // "habitId:YYYY-MM-DD" -> true
  pendingDeleteIds: string[];
  isLoading: boolean;
  
  // Actions
  fetchHabits: () => Promise<void>;
  fetchMonthEntries: (startDate: string, endDate: string) => Promise<void>;
  
  addHabit: (name: string, color?: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => void;
  undoDelete: (id: string) => void;
  reorderHabits: (activeId: string, overId: string) => Promise<void>;
  
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
}

const deleteTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useHabits = create<HabitsState>()((set, get) => ({
  habits: [],
  entriesMap: {},
  pendingDeleteIds: [],
  isLoading: true,
  
  fetchHabits: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }
    
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('archived', false)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      set({ habits: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
  
  fetchMonthEntries: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('habit_entries')
      .select('habit_id, completed_date')
      .gte('completed_date', startDate)
      .lte('completed_date', endDate);
      
    if (!error && data) {
      set((state) => {
        const newMap = { ...state.entriesMap };
        // We only add entries. We don't remove entries that are missing in the fetch 
        // to avoid wiping out optimistic updates, but ideally we'd sync perfectly.
        // For now, caching intelligently by merging is best.
        data.forEach(entry => {
          newMap[`${entry.habit_id}:${entry.completed_date}`] = true;
        });
        return { entriesMap: newMap };
      });
    }
  },
  
  addHabit: async (name, color) => {
    const PRESET_COLORS = ['#534AB7', '#0F6E56', '#BA7517', '#185FA5', '#993556'];
    const { habits } = get();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const assignedColor = color || PRESET_COLORS[habits.length % PRESET_COLORS.length];
    const maxPosition = habits.length > 0 ? Math.max(...habits.map(h => h.position)) : -1;
    
    const newHabit = {
      user_id: user.id,
      name,
      color: assignedColor,
      position: maxPosition + 1,
    };
    
    // Optimistic insert
    const tempId = crypto.randomUUID();
    const optimisticHabit = { ...newHabit, id: tempId, archived: false, created_at: new Date().toISOString() };
    set({ habits: [...habits, optimisticHabit] });
    
    const { data, error } = await supabase.from('habits').insert(newHabit).select().single();
    if (!error && data) {
      set((state) => ({
        habits: state.habits.map(h => h.id === tempId ? data : h)
      }));
    } else {
      // Revert on error
      set((state) => ({ habits: state.habits.filter(h => h.id !== tempId) }));
    }
  },
  
  updateHabit: async (id, updates) => {
    // Optimistic
    const oldHabits = get().habits;
    set({ habits: oldHabits.map(h => h.id === id ? { ...h, ...updates } : h) });
    
    const { error } = await supabase.from('habits').update(updates).eq('id', id);
    if (error) {
      set({ habits: oldHabits });
    }
  },
  
  archiveHabit: async (id) => {
    const oldHabits = get().habits;
    set({ habits: oldHabits.filter(h => h.id !== id) });
    
    const { error } = await supabase.from('habits').update({ archived: true }).eq('id', id);
    if (error) {
      set({ habits: oldHabits });
    }
  },
  
  deleteHabit: (id) => {
    set((state) => ({ pendingDeleteIds: [...state.pendingDeleteIds, id] }));
    
    const timer = setTimeout(async () => {
      // Execute hard delete
      set((state) => ({
        pendingDeleteIds: state.pendingDeleteIds.filter(pid => pid !== id),
        habits: state.habits.filter(h => h.id !== id)
      }));
      deleteTimers.delete(id);
      
      // Fire and forget (ON DELETE CASCADE handles entries)
      await supabase.from('habits').delete().eq('id', id);
    }, 7000);
    
    deleteTimers.set(id, timer);
  },
  
  undoDelete: (id) => {
    const timer = deleteTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      deleteTimers.delete(id);
    }
    set((state) => ({
      pendingDeleteIds: state.pendingDeleteIds.filter(pid => pid !== id)
    }));
  },
  
  reorderHabits: async (activeId, overId) => {
    const { habits } = get();
    const oldIndex = habits.findIndex(h => h.id === activeId);
    const newIndex = habits.findIndex(h => h.id === overId);
    
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    
    const newHabits = [...habits];
    const [moved] = newHabits.splice(oldIndex, 1);
    newHabits.splice(newIndex, 0, moved);
    
    // Re-assign positions
    const updatedHabits = newHabits.map((h, i) => ({ ...h, position: i }));
    set({ habits: updatedHabits });
    
    // Batch update Supabase
    // To avoid multiple requests, we can just update all. But Supabase JS doesn't have an easy upsert multiple without all fields.
    // We can do it using upsert.
    const upsertData = updatedHabits.map(({ id, user_id, name, color, position, archived }) => ({
      id, user_id, name, color, position, archived
    }));
    
    await supabase.from('habits').upsert(upsertData, { onConflict: 'id' });
  },
  
  toggleCompletion: async (habitId, date) => {
    const key = `${habitId}:${date}`;
    const { entriesMap } = get();
    const isCompleted = !!entriesMap[key];
    
    // Optimistic
    const newMap = { ...entriesMap };
    if (isCompleted) {
      delete newMap[key];
    } else {
      newMap[key] = true;
    }
    set({ entriesMap: newMap });
    
    if (isCompleted) {
      const { error } = await supabase
        .from('habit_entries')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_date', date);
        
      if (error) {
        set({ entriesMap }); // revert
      }
    } else {
      const { error } = await supabase
        .from('habit_entries')
        .insert({ habit_id: habitId, completed_date: date });
        
      if (error) {
        set({ entriesMap }); // revert
      }
    }
  }
}));
