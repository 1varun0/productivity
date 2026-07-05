import { motion, AnimatePresence } from 'framer-motion';
import { HabitsMatrix } from '../components/HabitsMatrix';
import { useHabits } from '../store/useHabits';
import { format, addMonths, subMonths } from 'date-fns';
import { useEffect, useState } from 'react';

export function HabitsPage() {
  const allHabits = useHabits(state => state.habits);
  const entriesMap = useHabits(state => state.entriesMap);
  const fetchHabits = useHabits(state => state.fetchHabits);
  const pendingDeleteIds = useHabits(state => state.pendingDeleteIds);
  const undoDelete = useHabits(state => state.undoDelete);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);
  
  const activeHabits = allHabits.filter(h => !h.archived);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const completedToday = activeHabits.filter(h => entriesMap[`${h.id}:${todayStr}`]).length;
  const currentMonth = format(currentDate, 'MMMM yyyy');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.96 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="h-full min-h-[600px] -mr-4 md:-mr-8 lg:-mr-12 flex flex-col overflow-hidden text-white relative pt-4"
    >
      {/* Ambient Vignette Fade */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent pointer-events-none z-10" />

      <div className="flex items-center justify-between mt-2 mb-2 z-20 relative px-4 md:px-8">
        <span className="text-[11px] text-white/40 tracking-widest uppercase font-semibold">
          {activeHabits.length} habits &middot; {completedToday} completed today
        </span>
        <div className="flex items-center gap-4 text-white/40">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="hover:text-white transition-colors"
          >
            &lt;
          </button>
          <span className="text-[11px] tracking-widest uppercase font-semibold">{currentMonth}</span>
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="hover:text-white transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>
      
      <HabitsMatrix currentDate={currentDate} />
      
      {/* Undo Toast */}
      <AnimatePresence>
        {pendingDeleteIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-6 right-8 md:right-12 z-50 flex flex-col gap-2"
          >
            {pendingDeleteIds.map(id => (
              <div key={id} className="bg-[#1a1a1a] border border-white/5 shadow-2xl rounded-md px-4 py-2 flex items-center gap-4">
                <span className="text-[11px] text-white/40 font-medium">Habit deleted</span>
                <button 
                  onClick={() => undoDelete(id)}
                  className="text-[11px] text-white/70 hover:text-white transition-colors tracking-wide font-medium"
                >
                  Undo
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
