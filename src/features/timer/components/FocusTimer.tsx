import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw } from 'lucide-react';
import { useFocusTimer } from '../hooks/useFocusTimer';

export function FocusTimer() {
  const DEFAULT_MINUTES = 25;
  const [timeLeft, setTimeLeft] = useState(DEFAULT_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const { completeSession } = useFocusTimer();

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000) as unknown as number;
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      completeSession({
        durationMinutes: DEFAULT_MINUTES,
        taskId: 'unassigned',
        intention: '',
        completionState: 'completed',
        reflection: '',
        parkedThoughtCount: 0,
        startedAt: Date.now() - DEFAULT_MINUTES * 60 * 1000,
        endsAt: Date.now()
      }).catch(console.error);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, completeSession]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setTimeLeft(DEFAULT_MINUTES * 60); };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (DEFAULT_MINUTES * 60));

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-card border border-border/40 rounded-3xl relative overflow-hidden group transition-all duration-500 shadow-premium hover:shadow-premium-hover">
      
      {/* Immersive Ambient Glow */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.03, 0.08, 0.03], 
              scale: [1, 1.05, 1],
            }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5 } }}
            transition={{ 
              repeat: Infinity, 
              duration: 6, 
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-background to-transparent blur-3xl pointer-events-none will-change-transform"
          />
        )}
      </AnimatePresence>

      {/* Subtle edge lighting on the top */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-50" />

      {/* Progress Bar */}
      <motion.div 
        className="absolute bottom-0 left-0 h-[2px] bg-primary/30"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 1, ease: "linear" }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          animate={isActive ? { scale: [1, 1.01, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="text-7xl font-thin tracking-[-0.04em] tabular-nums mb-12 text-foreground/90 drop-shadow-sm"
        >
          {formatTime(timeLeft)}
        </motion.div>

        <div className="flex items-center gap-6">
          <button 
            onClick={toggle}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-premium active:scale-90 ${
              isActive 
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
            }`}
          >
            {isActive ? <Square size={18} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          
          <AnimatePresence>
            {!isActive && timeLeft !== DEFAULT_MINUTES * 60 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8, width: 0, marginLeft: -24 }}
                animate={{ opacity: 1, scale: 1, width: 48, marginLeft: 0 }}
                exit={{ opacity: 0, scale: 0.8, width: 0, marginLeft: -24 }}
                onClick={reset}
                className="flex items-center justify-center h-12 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-90 border border-border/30 shadow-inset-edge overflow-hidden"
              >
                <RotateCcw size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
