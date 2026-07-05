import { useEffect, useMemo, useCallback } from 'react';
import { useTimetableStore } from '@/store/useTimetableStore';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import type { DayBlock } from '../types';
import { getMondayDow, formatDateKey } from '../types';

export function useTimetable() {
  const store = useTimetableStore();
  const { tasks } = useTasks();

  // Fetch template blocks on mount
  useEffect(() => {
    store.fetchTemplateBlocks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch scheduled entries when activeDate changes
  useEffect(() => {
    const date = store.activeDate;
    const from = new Date(date);
    from.setDate(from.getDate() - 1);
    const to = new Date(date);
    to.setDate(to.getDate() + 1);
    store.fetchScheduledEntries(from, to);
  }, [store.activeDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unscheduled tasks for the sidebar
  const unscheduledTasks = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tasks?.filter(t => !t.completed && (!(t as any).status || (t as any).status === 'unscheduled')) ?? [];
  }, [tasks]);

  // Memoized day blocks computation
  const dateKey = formatDateKey(store.activeDate);
  const scheduledForDay = store.scheduledEntries[dateKey];
  const getDayBlocks = useMemo((): DayBlock[] => {
    const dow = getMondayDow(store.activeDate);

    const templateForDay: DayBlock[] = store.templateBlocks
      .filter(b => b.repeat_days.includes(dow) && !b.archived)
      .map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        color: b.color,
        start_slot: b.start_slot,
        duration_slots: b.duration_slots,
        type: 'template' as const,
        locked: true,
      }));

    const scheduled: DayBlock[] = (scheduledForDay ?? []).map(e => ({
      id: e.id,
      name: e.name,
      category: e.category,
      color: e.color,
      start_slot: e.start_slot,
      duration_slots: e.duration_slots,
      type: 'scheduled' as const,
      locked: false,
      task_id: e.task_id,
    }));

    return [...templateForDay, ...scheduled].sort((a, b) => a.start_slot - b.start_slot);
  }, [store.templateBlocks, scheduledForDay, store.activeDate]);

  // Conflict detection
  const isSlotFree = useCallback((startSlot: number, durationSlots: number): boolean => {
    return !getDayBlocks.some(b =>
      b.start_slot < startSlot + durationSlots &&
      b.start_slot + b.duration_slots > startSlot
    );
  }, [getDayBlocks]);

  return {
    ...store,
    unscheduledTasks,
    getDayBlocks,
    isSlotFree,
    tasks,
  };
}
