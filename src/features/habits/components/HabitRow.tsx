import { useHabits } from '../store/useHabits';
import type { Habit } from '../store/useHabits';
import { HabitCell } from './HabitCell';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';


interface HabitRowProps {
  habit: Habit;
  days: any[];
  hoveredColIndex: number | null;
  setHoveredColIndex: (index: number | null) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function HabitRow({ habit, days, hoveredColIndex, setHoveredColIndex, isDragging, onDragStart, onDragOver, onDrop }: HabitRowProps) {
  // Calculate live streak dynamically and optimally
  const streak = useHabits((state) => {
    let s = 0;
    let i = days.findIndex(d => d.isToday);
    if (i === -1) i = days.length - 1; // Fallback if no today

    // Check today first
    if (state.entriesMap[`${habit.id}:${days[i].dateString}`]) {
      s++;
      i--;
    } else {
      // If today is not checked, check yesterday
      i--;
    }

    // Count backwards
    while (i >= 0 && state.entriesMap[`${habit.id}:${days[i].dateString}`]) {
      s++;
      i--;
    }
    return s;
  });

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteHabit = useHabits((state) => state.deleteHabit);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConfirmingDelete) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsConfirmingDelete(false);
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setIsConfirmingDelete(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isConfirmingDelete]);

  return (
    <motion.div 
      ref={rowRef}
      initial={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`flex w-fit group/row transition-opacity duration-300 ${isDragging ? 'opacity-40' : 'opacity-100'}`}
      onDragOver={isConfirmingDelete ? undefined : onDragOver}
      onDrop={isConfirmingDelete ? undefined : onDrop}
    >
      {/* Sticky Left Column */}
      <div 
        draggable={!isConfirmingDelete}
        onDragStart={isConfirmingDelete ? undefined : onDragStart}
        className={`sticky left-0 z-50 isolate w-[280px] min-w-[280px] bg-[#111111] group-hover/row:bg-[#161616] flex items-center pl-6 pr-8 h-[48px] transition-colors duration-500 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.6)] ${isConfirmingDelete ? '' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <AnimatePresence mode="wait">
          {!isConfirmingDelete ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, x: -2 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -2 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-4 w-full pointer-events-none"
            >
              <div 
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-80 group-hover/row:opacity-100 transition-opacity duration-500" 
                style={{ backgroundColor: habit.color }} 
              />
              <span className="text-[12px] tracking-wide text-[#e2e2e2] font-medium truncate w-full group-hover/row:text-white transition-colors duration-500" style={{ WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)' }}>
                {habit.name}
              </span>
              <div className="flex items-center justify-end gap-1 ml-auto flex-shrink-0 w-12">
                <span className="text-[10px] tracking-widest font-bold text-white/30 group-hover/row:text-white/50 transition-colors duration-500">{streak}d</span>
                {streak >= 3 && <span className="text-[10px] grayscale opacity-50 group-hover/row:grayscale-0 group-hover/row:opacity-100 transition-all duration-500">🔥</span>}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, x: 2 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 2 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full"
            >
              <span className="text-[11px] text-white/40 tracking-wide">Delete habit?</span>
              <div className="flex items-center gap-3">
                <button 
                  onMouseDown={(e) => { e.stopPropagation(); setIsConfirmingDelete(false); }}
                  className="text-[11px] text-white/30 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onMouseDown={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                  className="text-[11px] text-red-400/50 hover:text-red-400 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Affordance (absolute right edge) */}
        {!isConfirmingDelete && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => setIsConfirmingDelete(true)}
              className="p-1 text-white/20 hover:text-red-300/70 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Cells */}
      <div className="flex items-center">
        {days.map((day, index) => {
          const isHoveredCol = hoveredColIndex === index;

          return (
            <div 
              key={day.dateString} 
              onMouseEnter={() => setHoveredColIndex(index)}
              onMouseLeave={() => setHoveredColIndex(null)}
              className="relative w-[44px] min-w-[44px] h-[48px]"
            >
              {/* Col crosshair highlight */}
              {isHoveredCol && (
                <div className="absolute inset-0 bg-white/[0.02] pointer-events-none z-10 transition-colors duration-500" />
              )}
              {/* Today column ambient tint */}
              {day.isToday && (
                <div className="absolute inset-0 bg-white/[0.015] pointer-events-none z-0" />
              )}
              
              {/* Row crosshair highlight handled by group-hover/row above and maybe background on cell */}
              <div className="group-hover/row:bg-white/[0.015] transition-colors duration-500 w-full h-full relative z-20 flex items-center justify-center">
                <HabitCell 
                  habitId={habit.id}
                  dateString={day.dateString}
                  isFuture={day.isFuture}
                  isToday={day.isToday}
                  color={habit.color}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
