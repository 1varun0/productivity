import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useThoughtParking } from '../hooks/useThoughtParking';
import { Sparkles } from 'lucide-react';

export function ThoughtParking() {
  const { isThoughtParkingOpen, closeThoughtParking, addSessionCapture } = useStore();
  const [thought, setThought] = useState('');
  const { parkThought, isPending } = useThoughtParking();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isThoughtParkingOpen) {
      setThought('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isThoughtParkingOpen]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isThoughtParkingOpen) {
        closeThoughtParking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isThoughtParkingOpen, closeThoughtParking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim() || isPending) return;
    
    try {
      await parkThought(thought.trim());
      addSessionCapture(thought.trim());
      closeThoughtParking();
    } catch (err) {
      console.error('Failed to park thought:', err);
    }
  };

  return (
    <AnimatePresence>
      {isThoughtParkingOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto"
        >
          <div 
            className="absolute inset-0 bg-background/40 backdrop-blur-md"
            onClick={closeThoughtParking}
          />
          
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: -5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-2xl px-6"
          >
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
              
              <div className="relative bg-card/60 backdrop-blur-xl border border-border/40 shadow-premium rounded-2xl overflow-hidden flex items-center p-2 pl-6">
                <Sparkles size={18} className="text-muted-foreground/50 mr-4" />
                <input
                  ref={inputRef}
                  value={thought}
                  onChange={e => setThought(e.target.value)}
                  placeholder="Park a thought..."
                  className="w-full bg-transparent border-none text-xl font-light text-foreground focus:outline-none placeholder:text-muted-foreground/30 py-4"
                  disabled={isPending}
                />
                
                <div className="flex gap-2 items-center px-4 text-muted-foreground/40 text-[10px] font-semibold tracking-widest uppercase">
                  <span>Enter</span>
                  <span className="text-muted-foreground/20 text-xs">to save</span>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
