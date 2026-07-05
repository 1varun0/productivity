import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMentalInbox } from '../hooks/useMentalInbox';
import type { InboxItem } from '../hooks/useMentalInbox';
import { useStore } from '@/store/useStore';
import { useLists } from '@/features/lists/hooks/useLists';

export function MentalInboxPanel() {
  const { inboxItems, updateItem, isLoading } = useMentalInbox();
  const { isMentalInboxOpen, setMentalInboxOpen, focusState } = useStore();
  const { lists } = useLists();
  const isFocusing = focusState !== 'idle';
  const trayRef = useRef<HTMLDivElement>(null);

  const unresolvedItems = inboxItems?.filter(item => item.status === 'unresolved') || [];

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setMentalInboxOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMentalInboxOpen(false);
    };
    
    if (isMentalInboxOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMentalInboxOpen, setMentalInboxOpen]);

  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* The Ambient Indicator - Hides in Focus Mode (FocusEnvironment handles its own) */}
      {!isFocusing && unresolvedItems.length > 0 && (
        <button
          onClick={() => setMentalInboxOpen(true)}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-border/10 bg-transparent hover:bg-white/5 transition-all duration-300 w-full mb-2"
        >
          <span className="text-[11px] font-medium text-muted-foreground/40 group-hover:text-muted-foreground/60 tracking-wider uppercase transition-colors">&bull; {unresolvedItems.length} parked</span>
        </button>
      )}

      {/* The Floating Tray */}
      <AnimatePresence>
        {isMentalInboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-background/20 backdrop-blur-[2px]">
            <motion.div
              ref={trayRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto mx-4"
            >
              <div className="px-5 py-3 border-b border-border/10 flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/50">
                  Cognitive Residue
                </h3>
                <span className="text-[10px] text-muted-foreground/40 font-mono">ESC</span>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                {unresolvedItems.length === 0 ? (
                  <div className="py-12 text-center text-sm font-light text-muted-foreground/50">
                    Your mind is clear.
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {unresolvedItems.map((item) => (
                      <TrayItemRow key={item.id} item={item} updateItem={updateItem} lists={lists} />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function TrayItemRow({ item, updateItem, lists }: { item: InboxItem; updateItem: any; lists: any[] | undefined }) {
  const { convertToTask } = useMentalInbox();
  const { setActiveTaskId, setFocusState, setMentalInboxOpen } = useStore();
  const [isAssigning, setIsAssigning] = useState(false);

  const handleDismiss = () => {
    updateItem({ id: item.id, updates: { status: 'resolved', resolved_at: new Date().toISOString() } });
  };

  const handleConvert = async () => {
    try {
      await convertToTask(item);
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleFocus = async () => {
    try {
      const newTaskId = await convertToTask(item);
      setActiveTaskId(newTaskId);
      setFocusState('setup');
      setMentalInboxOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignSpace = (spaceId: string) => {
    updateItem({ id: item.id, updates: { space_id: spaceId } });
    setIsAssigning(false);
  };

  const contextLabel = item.source === 'focus' 
    ? 'deep work' 
    : (lists?.find(l => l.id === item.space_id)?.name || 'unassigned');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group flex flex-col px-4 py-3 rounded-xl hover:bg-white/5 transition-colors relative"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground/30 text-lg flex-shrink-0 leading-none">&bull;</span>
            <p className="text-sm font-light text-foreground/90 truncate">
              {item.content}
            </p>
          </div>
          <span className="text-[9px] font-medium tracking-widest uppercase text-muted-foreground/30 ml-5 pl-0.5">
            {contextLabel}
          </span>
        </div>
        
        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity pl-4 flex-shrink-0">
          <button 
            onClick={() => setIsAssigning(!isAssigning)}
            className={`text-[10px] font-medium transition-colors uppercase tracking-wider ${isAssigning ? 'text-primary' : 'text-muted-foreground/50 hover:text-foreground'}`}
          >
            Assign Space
          </button>
          <button 
            onClick={handleFocus}
            className="text-[10px] font-medium text-muted-foreground/50 hover:text-foreground transition-colors uppercase tracking-wider"
          >
            Focus
          </button>
          <button 
            onClick={handleConvert}
            className="text-[10px] font-medium text-primary/60 hover:text-primary transition-colors uppercase tracking-wider"
          >
            Extract Task
          </button>
          <button 
            onClick={handleDismiss}
            className="text-[10px] font-medium text-destructive/60 hover:text-destructive transition-colors uppercase tracking-wider"
          >
            Let Go
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAssigning && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex flex-wrap gap-2 ml-5 overflow-hidden"
          >
            {lists?.map(l => {
              const isSelected = item.space_id === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => handleAssignSpace(l.id)}
                  className={`px-2.5 py-1 rounded border text-[9px] uppercase tracking-wider font-medium transition-colors ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/30 text-primary' 
                      : 'bg-transparent border-white/10 text-muted-foreground/50 hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {l.name}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
