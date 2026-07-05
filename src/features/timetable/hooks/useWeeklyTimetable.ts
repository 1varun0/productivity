import { useMemo } from 'react';
import { useWeeklyTimetableStore } from '@/store/useWeeklyTimetableStore';
import type { TimetableBlock } from '../types';
import { getMondayDow } from '../types';

export function useWeeklyTimetable() {
  const store = useWeeklyTimetableStore();

  const today = useMemo(() => getMondayDow(new Date()), []);

  const blocksByDay = useMemo<Record<number, TimetableBlock[]>>(() => {
    const map: Record<number, TimetableBlock[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    };
    for (const block of store.blocks) {
      if (!block.archived) {
        if (!map[block.day]) map[block.day] = [];
        map[block.day].push(block);
      }
    }
    return map;
  }, [store.blocks]);

  const blockCount = useMemo(
    () => store.blocks.filter(b => !b.archived).length,
    [store.blocks]
  );

  return {
    ...store,
    today,
    blocksByDay,
    blockCount,
  };
}
