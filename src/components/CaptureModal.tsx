import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useEffect, useRef, useState } from 'react';
import { useCapture } from '@/hooks/useCapture';
import { CustomDatePicker } from './CustomDatePicker';
import { Calendar } from 'lucide-react';

export function CaptureModal() {
  const { isCaptureModalOpen, closeCaptureModal } = useStore();
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { capture, isPending } = useCapture();

  useEffect(() => {
    if (isCaptureModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setContent('');
      setDueDate(null);
      setIsCalendarOpen(false);
    }
  }, [isCaptureModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;
    
    await capture({ content: content.trim(), dueDate });
    closeCaptureModal();
  };

  const getRelativeDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  return (
    <AnimatePresence>
      {isCaptureModalOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-md z-40"
            onClick={closeCaptureModal}
          />
          <div className="fixed inset-0 flex items-start justify-center pt-[15vh] z-50 pointer-events-none px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, y: 10, filter: "blur(2px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-2xl bg-popover/90 backdrop-blur-xl border border-border/50 shadow-premium-hover rounded-2xl overflow-hidden pointer-events-auto relative shadow-inset-edge"
            >
              {/* Subtle top glare */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              
              <form onSubmit={handleSubmit} className="flex flex-col relative z-10">
                <div className="relative">
                  <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isPending}
                    className="w-full bg-transparent border-none text-2xl font-medium px-8 pt-7 pb-4 focus:outline-none placeholder:text-muted-foreground/40 text-foreground disabled:opacity-50 selection:bg-primary/20 caret-primary"
                  />
                  
                  <div className="px-8 pb-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => { setDueDate(dueDate && new Date(dueDate).getDate() === new Date().getDate() ? null : getRelativeDate(0)); setIsCalendarOpen(false); }}
                        className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${dueDate && new Date(dueDate).getDate() === new Date().getDate() ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'}`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDueDate(dueDate && new Date(dueDate).getDate() === new Date(getRelativeDate(1)).getDate() ? null : getRelativeDate(1)); setIsCalendarOpen(false); }}
                        className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${dueDate && new Date(dueDate).getDate() === new Date(getRelativeDate(1)).getDate() ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'}`}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDueDate(dueDate && new Date(dueDate).getDate() === new Date(getRelativeDate(7)).getDate() ? null : getRelativeDate(7)); setIsCalendarOpen(false); }}
                        className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${dueDate && new Date(dueDate).getDate() === new Date(getRelativeDate(7)).getDate() ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'}`}
                      >
                        Next Week
                      </button>
                      
                      <div className="w-[1px] h-4 bg-border/40 mx-1" />
                      
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                          isCalendarOpen || (dueDate && 
                          new Date(dueDate).getDate() !== new Date().getDate() && 
                          new Date(dueDate).getDate() !== new Date(getRelativeDate(1)).getDate() && 
                          new Date(dueDate).getDate() !== new Date(getRelativeDate(7)).getDate())
                            ? 'bg-card text-foreground border-border shadow-sm' 
                            : 'bg-transparent text-muted-foreground border-transparent hover:border-border/50 hover:bg-card/40 hover:text-foreground'
                        }`}
                      >
                        <Calendar size={12} className="opacity-70" />
                        {dueDate && 
                          new Date(dueDate).getDate() !== new Date().getDate() && 
                          new Date(dueDate).getDate() !== new Date(getRelativeDate(1)).getDate() && 
                          new Date(dueDate).getDate() !== new Date(getRelativeDate(7)).getDate() 
                          ? new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : 'Pick a date'
                        }
                      </button>
                    </div>

                    <AnimatePresence>
                      {isCalendarOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: 5, height: 0 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="bg-card/40 rounded-xl border border-border/30 inline-block">
                            <CustomDatePicker 
                              selectedDate={dueDate} 
                              onSelect={(date) => {
                                setDueDate(date);
                                setIsCalendarOpen(false);
                              }} 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex items-center justify-between px-8 py-4 border-t border-border/30 bg-accent/10 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  <div className="flex gap-6">
                    <span className="flex items-center gap-1.5"><kbd className="font-sans bg-white/10 border border-white/10 text-white/80 shadow-sm px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> Save</span>
                    <span className="flex items-center gap-1.5"><kbd className="font-sans bg-white/10 border border-white/10 text-white/80 shadow-sm px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> Cancel</span>
                  </div>
                  {isPending && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" 
                    />
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
