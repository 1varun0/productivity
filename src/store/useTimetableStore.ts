import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { TemplateBlock, ScheduledEntry } from '@/features/timetable/types';
import { formatDateKey } from '@/features/timetable/types';

interface TimetableState {
  // Template
  templateBlocks: TemplateBlock[];
  fetchTemplateBlocks: () => Promise<void>;
  addTemplateBlock: (block: Omit<TemplateBlock, 'id' | 'user_id' | 'created_at' | 'archived'>) => Promise<void>;
  updateTemplateBlock: (id: string, updates: Partial<TemplateBlock>) => Promise<void>;
  deleteTemplateBlock: (id: string) => Promise<void>;

  // Scheduled entries
  scheduledEntries: Record<string, ScheduledEntry[]>; // key = "YYYY-MM-DD"
  fetchScheduledEntries: (from: Date, to: Date) => Promise<void>;
  scheduleTask: (params: {
    taskId: string | null;
    name: string;
    category: string;
    color: string;
    date: Date;
    startSlot: number;
    durationSlots: number;
  }) => Promise<void>;
  unscheduleEntry: (id: string, taskId: string | null) => Promise<void>;

  // UI state
  selectedTaskId: string | null;
  setSelectedTask: (id: string | null) => void;
  activeDate: Date;
  setActiveDate: (date: Date) => void;
  activeTab: 'day' | 'template';
  setActiveTab: (tab: 'day' | 'template') => void;
  isDirty: boolean;
  isSaved: boolean;

  // Modal state
  editingBlock: TemplateBlock | null;
  modalPreset: { day: number; slot: number } | null;
  openModal: (preset?: { day: number; slot: number }, block?: TemplateBlock) => void;
  closeModal: () => void;
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  // ── Template State ──────────────────────────────────────
  templateBlocks: [],

  fetchTemplateBlocks: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('template_blocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('start_slot', { ascending: true });

    if (error) { console.error('Failed to fetch template blocks:', error); return; }
    set({ templateBlocks: data ?? [] });
  },

  addTemplateBlock: async (block) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newBlock = { ...block, user_id: user.id, archived: false };

    // Optimistic: add with temp id
    const tempId = crypto.randomUUID();
    const optimistic: TemplateBlock = {
      ...newBlock,
      id: tempId,
      created_at: new Date().toISOString(),
    };
    set(s => ({ templateBlocks: [...s.templateBlocks, optimistic], isDirty: true, isSaved: false }));

    const { data, error } = await supabase
      .from('template_blocks')
      .insert(newBlock)
      .select()
      .single();

    if (error) {
      // Rollback
      set(s => ({ templateBlocks: s.templateBlocks.filter(b => b.id !== tempId) }));
      console.error('Failed to add template block:', error);
      return;
    }

    // Replace temp with real
    set(s => ({
      templateBlocks: s.templateBlocks.map(b => b.id === tempId ? data : b),
      isDirty: false,
      isSaved: true,
    }));
    setTimeout(() => set({ isSaved: false }), 2000);
  },

  updateTemplateBlock: async (id, updates) => {
    const prev = get().templateBlocks;
    set(s => ({
      templateBlocks: s.templateBlocks.map(b => b.id === id ? { ...b, ...updates } : b),
      isDirty: true,
      isSaved: false,
    }));

    const { error } = await supabase
      .from('template_blocks')
      .update(updates)
      .eq('id', id);

    if (error) {
      set({ templateBlocks: prev });
      console.error('Failed to update template block:', error);
      return;
    }

    set({ isDirty: false, isSaved: true });
    setTimeout(() => set({ isSaved: false }), 2000);
  },

  deleteTemplateBlock: async (id) => {
    const prev = get().templateBlocks;
    set(s => ({
      templateBlocks: s.templateBlocks.filter(b => b.id !== id),
      isDirty: true,
      isSaved: false,
    }));

    const { error } = await supabase
      .from('template_blocks')
      .update({ archived: true })
      .eq('id', id);

    if (error) {
      set({ templateBlocks: prev });
      console.error('Failed to delete template block:', error);
      return;
    }

    set({ isDirty: false, isSaved: true });
    setTimeout(() => set({ isSaved: false }), 2000);
  },

  // ── Scheduled Entries State ─────────────────────────────
  scheduledEntries: {},

  fetchScheduledEntries: async (from, to) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scheduled_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_date', formatDateKey(from))
      .lte('scheduled_date', formatDateKey(to))
      .order('start_slot', { ascending: true });

    if (error) { console.error('Failed to fetch scheduled entries:', error); return; }

    // Group by date
    const grouped: Record<string, ScheduledEntry[]> = {};
    for (const entry of (data ?? [])) {
      const key = entry.scheduled_date;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    }

    set(s => ({ scheduledEntries: { ...s.scheduledEntries, ...grouped } }));
  },

  scheduleTask: async ({ taskId, name, category, color, date, startSlot, durationSlots }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dateKey = formatDateKey(date);
    const newEntry = {
      user_id: user.id,
      task_id: taskId,
      name,
      category,
      color,
      scheduled_date: dateKey,
      start_slot: startSlot,
      duration_slots: durationSlots,
    };

    // Optimistic
    const tempId = crypto.randomUUID();
    const optimistic: ScheduledEntry = {
      ...newEntry,
      id: tempId,
      created_at: new Date().toISOString(),
    };
    set(s => ({
      scheduledEntries: {
        ...s.scheduledEntries,
        [dateKey]: [...(s.scheduledEntries[dateKey] ?? []), optimistic],
      },
      selectedTaskId: null,
    }));

    // Insert entry
    const { data, error } = await supabase
      .from('scheduled_entries')
      .insert(newEntry)
      .select()
      .single();

    if (error) {
      // Rollback
      set(s => ({
        scheduledEntries: {
          ...s.scheduledEntries,
          [dateKey]: (s.scheduledEntries[dateKey] ?? []).filter(e => e.id !== tempId),
        },
      }));
      console.error('Failed to schedule task:', error);
      return;
    }

    // Replace temp with real
    set(s => ({
      scheduledEntries: {
        ...s.scheduledEntries,
        [dateKey]: (s.scheduledEntries[dateKey] ?? []).map(e => e.id === tempId ? data : e),
      },
    }));

    // Update task status if linked
    if (taskId) {
      await supabase.from('tasks').update({ status: 'scheduled' }).eq('id', taskId);
    }
  },

  unscheduleEntry: async (id, taskId) => {
    const prev = get().scheduledEntries;

    // Find and remove optimistically
    const updated = { ...prev };
    for (const key of Object.keys(updated)) {
      updated[key] = updated[key].filter(e => e.id !== id);
    }
    set({ scheduledEntries: updated });

    const { error } = await supabase.from('scheduled_entries').delete().eq('id', id);

    if (error) {
      set({ scheduledEntries: prev });
      console.error('Failed to unschedule entry:', error);
      return;
    }

    // Set task back to unscheduled
    if (taskId) {
      await supabase.from('tasks').update({ status: 'unscheduled' }).eq('id', taskId);
    }
  },

  // ── UI State ────────────────────────────────────────────
  selectedTaskId: null,
  setSelectedTask: (id) => set({ selectedTaskId: id }),

  activeDate: new Date(),
  setActiveDate: (date) => set({ activeDate: date }),

  activeTab: 'day',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isDirty: false,
  isSaved: false,

  // ── Modal State ─────────────────────────────────────────
  editingBlock: null,
  modalPreset: null,
  openModal: (preset, block) => set({ modalPreset: preset ?? null, editingBlock: block ?? null }),
  closeModal: () => set({ modalPreset: null, editingBlock: null }),
}));
