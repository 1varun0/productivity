import { motion, AnimatePresence } from 'framer-motion';
import { useCaptures } from '../hooks/useCaptures';
import { Sparkles, Trash2, ArrowRightCircle } from 'lucide-react';

export function MentalInbox() {
  const { captures, isLoading, deleteCapture, convertToTask } = useCaptures();

  if (isLoading) return null;
  if (!captures || captures.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-muted-foreground/40" />
        <h2 className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground/40 uppercase">
          Mental Inbox
        </h2>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {captures.map((capture) => (
            <motion.div
              key={capture.id}
              layout
              initial={{ opacity: 0, filter: 'blur(4px)', y: -10 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              className="group relative flex items-start justify-between gap-4 p-3.5 rounded-xl border border-transparent hover:border-border/20 hover:bg-muted/50 transition-all duration-300"
            >
              <div className="text-sm font-light text-foreground/60 leading-relaxed pt-0.5">
                {capture.content}
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => convertToTask(capture)}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Convert to actionable task"
                >
                  <ArrowRightCircle size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => deleteCapture(capture.id)}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Dismiss thought"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
