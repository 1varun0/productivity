import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { Play, Square } from 'lucide-react';
import { useFocusTimer } from '../hooks/useFocusTimer';

export function FocusRecoveryBanner() {
  const { 
    isRecoveringSession, 
    resumeFocusSession, 
    resetFocusSession,
    activeTaskId,
    sessionEndsAt,
    sessionStartedAt,
    sessionDuration,
    sessionIntention,
    sessionCaptures
  } = useStore();
  const { tasks } = useTasks();
  const { completeSession } = useFocusTimer();
  
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isRecoveringSession && sessionEndsAt) {
      interval = window.setInterval(() => {
        const remainingMs = sessionEndsAt - Date.now();
        setTimeLeft(Math.max(0, Math.floor(remainingMs / 1000)));
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [isRecoveringSession, sessionEndsAt]);

  const activeTask = tasks?.find(t => t.id === activeTaskId);
  
  if (!isRecoveringSession) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    completeSession({
      durationMinutes: sessionDuration,
      taskId: activeTaskId,
      intention: sessionIntention,
      completionState: timeLeft === 0 ? 'completed' : 'interrupted',
      reflection: 'Ended from recovery mode',
      parkedThoughtCount: sessionCaptures.length,
      startedAt: sessionStartedAt,
      endsAt: sessionEndsAt
    }).catch(console.error);
    resetFocusSession();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mb-8 w-full bg-card/40 backdrop-blur-md border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_-8px_rgba(var(--primary),0.1)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-2xl font-light tabular-nums tracking-tight text-primary">
            {formatTime(timeLeft)}
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest text-muted-foreground/60 uppercase mb-0.5">Session In Progress</div>
            <div className="text-sm font-medium text-foreground/90">
              {activeTaskId === 'deep-thinking' ? 'Deep Thinking Session' : activeTask?.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <button 
            onClick={resumeFocusSession}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 font-medium text-xs tracking-wide transition-all duration-300 shadow-inset-edge"
          >
            <Play size={14} /> Return to Focus
          </button>
          <button 
            onClick={handleEndSession}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/80 font-medium text-xs tracking-wide transition-all duration-300"
          >
            <Square size={14} /> End Session
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
