import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMentalInbox } from '../hooks/useMentalInbox';
import { useStore } from '@/store/useStore';

export function GlobalMentalCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const { parkThought } = useMentalInbox();
  const activeListId = useStore(state => state.activeListId);
  const focusState = useStore(state => state.focusState);
  const activeTaskId = useStore(state => state.activeTaskId);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P OR Ctrl/Cmd + Shift + Space
      const isCaptureShortcut = (e.metaKey || e.ctrlKey) && e.shiftKey && (e.code === 'KeyP' || e.code === 'Space');
      if (isCaptureShortcut) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setContent('');
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await parkThought({
        content: content.trim(),
        source: focusState !== 'idle' ? 'focus' : 'quick_capture',
        space_id: activeListId,
        linked_task_id: activeTaskId,
        status: 'unresolved'
      });

      if (focusState === 'active') {
        useStore.getState().addSessionCapture(content.trim());
      }

      setIsOpen(false);
      setContent('');
    } catch (error) {
      console.error('Failed to park thought:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] pointer-events-none">
          {/* Subtle backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/20 backdrop-blur-sm pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="relative pointer-events-auto bg-card/80 backdrop-blur-xl border border-border/30 shadow-2xl rounded-2xl w-full max-w-[400px] overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-1">
              <input
                ref={inputRef}
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dump a thought..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/40 text-lg px-5 py-4 focus:outline-none focus:ring-0 border-none font-light"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] font-medium tracking-widest text-muted-foreground/30 uppercase">
                  Press Enter
                </span>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
