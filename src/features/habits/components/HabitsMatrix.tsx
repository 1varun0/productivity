import React, { useState, useRef, useEffect } from 'react';
import { useHabits } from '../store/useHabits';
import { getCurrentMonthDays } from '../utils';
import { HabitRow } from './HabitRow';
import { Plus } from 'lucide-react';
import { isSameMonth } from 'date-fns';
import { AnimatePresence } from 'framer-motion';

export function HabitsMatrix({ currentDate = new Date() }: { currentDate?: Date }) {
  const allHabits = useHabits((state) => state.habits);
  const fetchMonthEntries = useHabits((state) => state.fetchMonthEntries);
  const addHabit = useHabits((state) => state.addHabit);
  const reorderHabits = useHabits((state) => state.reorderHabits);
  const pendingDeleteIds = useHabits((state) => state.pendingDeleteIds);
  
  const habits = React.useMemo(() => allHabits.filter(h => !h.archived && !pendingDeleteIds.includes(h.id)), [allHabits, pendingDeleteIds]);
  const days = React.useMemo(() => getCurrentMonthDays(currentDate), [currentDate]);

  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#888888');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch entries for viewed month
  useEffect(() => {
    if (days.length > 0) {
      fetchMonthEntries(days[0].dateString, days[days.length - 1].dateString);
    }
  }, [days, fetchMonthEntries]);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (isSameMonth(currentDate, new Date())) {
        const todayIndex = days.findIndex(d => d.isToday);
        if (todayIndex !== -1) {
          const cellWidth = 34;
          const targetScroll = (todayIndex * cellWidth) - (scrollContainerRef.current.clientWidth / 2) + 200 + (cellWidth / 2);
          scrollContainerRef.current.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
        }
      } else {
        // Reset to left edge if viewing a different month
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'auto' });
      }
    }
  }, [currentDate, days]);

  // Horizontal mousewheel scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If we are scrolling vertically and the element has horizontal scrollable area,
      // and we are NOT at the boundaries, we can optionally translate vertical to horizontal.
      // But standard horizontal scrolling with a mousewheel usually requires holding Shift.
      // Let's implement smooth horizontal scrolling for vertical wheel if shift is not pressed
      // only if there is no vertical overflow? Or just strictly translate.
      // A common pattern is:
      if (e.deltaY !== 0 && !e.shiftKey) {
        // Optional: you can uncomment to force vertical scroll to horizontal
        // e.preventDefault();
        // el.scrollLeft += e.deltaY;
      }
    };
    
    // Using passive: false to allow preventDefault if we uncomment the above
    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim(), newHabitColor);
      setNewHabitName('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewHabitName('');
    }
  };

  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);

  const handleDragStart = (id: string, e: React.DragEvent) => {
    setDraggedHabitId(id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Transparent ghost image to keep the drag quiet
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedHabitId && draggedHabitId !== targetId) {
      reorderHabits(draggedHabitId, targetId);
    }
    setDraggedHabitId(null);
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full h-full overflow-auto custom-scrollbar"
      >
        <div className="flex flex-col w-fit min-w-full">
        {/* Sticky Header Row */}
        <div className="flex w-fit sticky top-0 z-40 bg-[#0f0f0f]">
          {/* Top Left Empty Cell (Sticky) */}
          <div className="sticky left-0 z-50 isolate w-[280px] min-w-[280px] bg-[#0f0f0f] flex flex-col justify-center pl-6 pr-8 h-16 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.6)]">
          </div>

          {/* Date Headers */}
          <div className="flex items-end h-16">
            {days.map((day, index) => {
              const isHovered = hoveredColIndex === index;
              return (
                <div 
                  key={day.dateString}
                  className={`w-[44px] min-w-[44px] h-[44px] flex flex-col items-center justify-end pb-1.5 transition-colors duration-500 relative
                    ${day.isToday ? 'bg-white/[0.015]' : ''}
                    ${isHovered ? 'bg-white/[0.02]' : ''}
                  `}
                  onMouseEnter={() => setHoveredColIndex(index)}
                  onMouseLeave={() => setHoveredColIndex(null)}
                >
                  {/* Ambient top fade for Today instead of sharp line */}
                  {day.isToday && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.015] to-transparent pointer-events-none" />
                  )}
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <span className={`text-[10px] uppercase font-bold tracking-[0.15em] ${day.isToday ? 'text-white/90' : 'text-[#555A66]'}`}>
                      {day.dayLetter}
                    </span>
                    <div className={`flex items-center justify-center w-[20px] h-[20px] transition-colors duration-500 ${day.isToday ? 'text-white border-b border-white/20' : 'text-white/40'}`}>
                      <span className="text-[11px] font-bold">
                        {day.dayNumber}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matrix Rows (Localized Graphite Elevation) */}
        <div className="flex flex-col bg-[#111111] rounded-[16px] py-1 w-fit shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <AnimatePresence initial={false}>
            {habits.map((habit) => (
              <HabitRow 
                key={habit.id} 
                habit={habit} 
                days={days} 
                hoveredColIndex={hoveredColIndex}
                setHoveredColIndex={setHoveredColIndex}
                isDragging={draggedHabitId === habit.id}
                onDragStart={(e) => handleDragStart(habit.id, e)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(habit.id, e)}
              />
            ))}
          </AnimatePresence>

          {/* Add Habit Row */}
          <div className="flex w-fit group/add">
            <div className="sticky left-0 z-50 isolate w-[280px] min-w-[280px] bg-[#111111] flex items-center pl-6 pr-8 h-[48px] text-white shadow-[4px_0_24px_-4px_rgba(0,0,0,0.6)]">
              {!isAdding ? (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-3 text-[11px] tracking-[0.12em] uppercase font-medium text-white/20 hover:text-white/50 transition-colors duration-500 w-full h-full text-left"
                >
                  <Plus size={14} className="opacity-50" />
                  CAPTURE
                </button>
              ) : (
                <form onSubmit={handleAddSubmit} className="flex items-center gap-2 w-full">
                  <input
                    type="color"
                    value={newHabitColor}
                    onChange={(e) => setNewHabitColor(e.target.value)}
                    className="w-3 h-3 p-0 border-0 rounded-sm cursor-pointer shrink-0 bg-transparent"
                    style={{ WebkitAppearance: 'none' }}
                  />
                  <input
                    autoFocus
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Habit name..."
                    className="bg-transparent text-[13px] text-white font-medium w-full outline-none placeholder:text-white/40"
                    onBlur={() => {
                      if (!newHabitName.trim()) setIsAdding(false);
                    }}
                  />
                </form>
              )}
            </div>
            
            {/* Empty cells for the Add row to maintain grid width */}
            <div className="flex items-center">
              {days.map((day, index) => {
                const isHovered = hoveredColIndex === index;
                return (
                  <div 
                    key={day.dateString} 
                    className={`w-[44px] min-w-[44px] h-[48px] transition-colors duration-500
                      ${day.isToday ? 'bg-white/[0.015]' : ''}
                      ${isHovered ? 'bg-white/[0.02]' : ''}
                    `}
                    onMouseEnter={() => setHoveredColIndex(index)}
                    onMouseLeave={() => setHoveredColIndex(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Score Footer removed as requested */}
        
        
      </div>
      </div>
    </div>
  );
}
