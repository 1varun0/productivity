import React from 'react';
import { useHabits } from '../store/useHabits';

interface HabitCellProps {
  habitId: string;
  dateString: string;
  isFuture: boolean;
  isToday: boolean;
  color: string;
}

export const HabitCell = React.memo(function HabitCell({ habitId, dateString, isFuture, color }: HabitCellProps) {
  const completed = useHabits(state => !!state.entriesMap[`${habitId}:${dateString}`]);
  const toggleCompletion = useHabits(state => state.toggleCompletion);

  return (
    <div className={`w-[44px] min-w-[44px] h-[48px] flex items-center justify-center relative group bg-transparent`}>
      <div 
        onClick={!isFuture ? () => toggleCompletion(habitId, dateString) : undefined}
        className={`
          w-[16px] h-[16px] rounded-full flex items-center justify-center transition-all duration-500
          ${isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          ${!completed ? 'bg-black/40 border border-white/[0.03] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]' : ''}
        `}
        style={completed && !isFuture ? { 
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}40, inset 0 0 2px rgba(255,255,255,0.2)`
        } : {}}
      />
    </div>
  );
});
