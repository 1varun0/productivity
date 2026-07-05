import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getWeekEnd } from '@/store/useWeeklyTimetableStore';
import { useState, useCallback, useEffect } from 'react';

interface WeekNavigatorProps {
  currentWeekStart: Date;
  setWeekOffset: (offset: number) => void;
  onAddDeadline: () => void;
}

function getWeekLabel(start: Date, end: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}, ${start.getFullYear()}`;
}

export function WeekNavigator({ currentWeekStart, setWeekOffset, onAddDeadline }: WeekNavigatorProps) {
  const [offset, setOffset] = useState(0);

  // Sync internal offset state with actual date changes
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    today.setDate(today.getDate() + diff);

    const weekDiff = Math.round((currentWeekStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));
    setOffset(weekDiff);
  }, [currentWeekStart]);

  const handlePrev = useCallback(() => {
    setWeekOffset(-1);
  }, [setWeekOffset]);

  const handleNext = useCallback(() => {
    setWeekOffset(1);
  }, [setWeekOffset]);

  const handleToday = useCallback(() => {
    setWeekOffset(0);
  }, [setWeekOffset]);

  const weekEnd = getWeekEnd(currentWeekStart);

  return (
    <div
      className="flex items-center justify-between px-5 h-9"
      style={{
        backgroundColor: '#0f0f0f',
        borderBottom: '0.5px solid #1e1e1e',
      }}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrev}
            className="p-1 rounded-md text-[#555] hover:text-[#aaa] hover:bg-[#161616] border border-[#1e1e1e] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-md text-[#555] hover:text-[#aaa] hover:bg-[#161616] border border-[#1e1e1e] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <span className="text-[12px] text-[#666] font-medium tracking-wide">
          Week of {getWeekLabel(currentWeekStart, weekEnd)}
        </span>

        {offset !== 0 && (
          <button
            onClick={handleToday}
            className="text-[10px] font-bold text-[#444] border border-[#222] rounded-[4px] px-[10px] py-[3px] uppercase hover:text-[#aaa] hover:border-[#444] transition-colors"
          >
            TODAY
          </button>
        )}
      </div>

      <button
        onClick={onAddDeadline}
        className="flex items-center space-x-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#AFA9EC] hover:bg-[#161616] rounded-md transition-colors"
      >
        <Plus size={14} className="mr-1" />
        Deadline
      </button>
    </div>
  );
}
