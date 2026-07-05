import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useAttachments } from '@/features/tasks/hooks/useAttachments';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { X, Target } from 'lucide-react';
import { useMentalInbox } from '@/features/inbox/hooks/useMentalInbox';
import { FocusChamber } from '@/features/focus-chamber/FocusChamber';
import type { FocusMode } from '@/store/useStore';
import { NexusOverlay } from '@/features/focus-chamber/NexusOverlay';
import { useNexusStore } from '@/features/nexus/store/useNexusStore';

export function FocusEnvironment() {
  const { 
    focusState, setFocusState, 
    activeTaskId, setActiveTaskId,
    sessionIntention,
    sessionDuration, setSessionDuration,
    sessionCaptures,
    sessionEndsAt,
    sessionStartedAt,
    isTimerPaused, pauseTimer, resumeTimer,
    resetFocusSession
  } = useStore();
  
  // Cache the last non-idle state to prevent layout shift during exit animations
  const [renderState, setRenderState] = useState(focusState);
  useEffect(() => {
    if (focusState !== 'idle') {
      setRenderState(focusState);
    }
  }, [focusState]);

  const { tasks, updateTask } = useTasks();
  const { attachments, getFileUrl } = useAttachments(activeTaskId === 'deep-thinking' ? null : activeTaskId);
  const { completeSession } = useFocusTimer();
  
  const [timeLeft, setTimeLeft] = useState(sessionDuration * 60);
  const [markComplete, setMarkComplete] = useState(false);
  const [isConfirmingEarlyExit, setIsConfirmingEarlyExit] = useState(false);
  const [appendToJournal, setAppendToJournal] = useState(true);
  const [isNexusOpen, setIsNexusOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');
  
  const { parkThought } = useMentalInbox();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleParkThoughtSubmit = async (thoughtText: string) => {
    if (!thoughtText.trim()) {
      return;
    }
    
    try {
      await parkThought({
        content: thoughtText,
        source: 'focus',
        linked_task_id: activeTaskId !== 'deep-thinking' ? activeTaskId : null,
        space_id: useStore.getState().activeListId,
        status: 'unresolved'
      });
      useStore.getState().addSessionCapture(thoughtText);
    } catch (err) {
      console.error('Failed to park thought', err);
    }
  };

  // Global Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Ctrl+Shift+P to be handled by GlobalMentalCapture
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'KeyP') {
        if (focusState === 'active') {
          e.preventDefault();
        }
      }

      if (focusState === 'setup') {
        if (e.key === 'Escape') {
          resetFocusSession();
        } else if (e.key === 'Enter') {
          if (!useStore.getState().activeTaskId) return;
          if (isCustomDuration && (!customDurationInput || parseInt(customDurationInput) <= 0)) return;
          
          if (isCustomDuration && parseInt(customDurationInput) > 0) {
            useStore.getState().setSessionDuration(parseInt(customDurationInput));
          }
          
          setTimeout(() => {
            useStore.getState().startFocusSession();
            setTimeLeft(useStore.getState().sessionDuration * 60);
          }, 0);
        }
      } else if (focusState === 'active' && isConfirmingEarlyExit) {
        if (e.key === 'Escape') {
          setIsConfirmingEarlyExit(false);
        } else if (e.key === 'Enter') {
          handleEndSessionConfirm();
        }
      } else if (focusState === 'active' && !isConfirmingEarlyExit) {
        if (e.key === 'n' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          // If a modal is open in the nexus store, we shouldn't toggle it off abruptly, 
          // but we'll let the overlay's ESC handler deal with modal closing.
          setIsNexusOpen(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusState, isCustomDuration, customDurationInput, resetFocusSession, isConfirmingEarlyExit, markComplete]);

  // Timer & Distraction logic
  useEffect(() => {
    let interval: number;

    const handleVisibilityChange = () => {};
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const effectivelyPaused = isTimerPaused || isConfirmingEarlyExit;

    if (focusState === 'active' && sessionEndsAt && !effectivelyPaused) {
      interval = window.setInterval(() => {
        const remainingMs = sessionEndsAt - Date.now();
        const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
        
        setTimeLeft(remainingSeconds);

        if (remainingSeconds === 0) {
          window.clearInterval(interval);
          setIsConfirmingEarlyExit(true);
        }
      }, 500); 
    } else if (focusState === 'active' && timeLeft === 0 && !effectivelyPaused) {
      setIsConfirmingEarlyExit(true); 
    }

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [focusState, sessionEndsAt, sessionStartedAt, setFocusState, isTimerPaused, isConfirmingEarlyExit, timeLeft]);

  const handleEndSessionConfirm = async () => {
    try {
      await completeSession({
        durationMinutes: sessionDuration,
        taskId: activeTaskId,
        intention: sessionIntention,
        completionState: timeLeft === 0 ? 'completed' : 'interrupted',
        reflection: '',
        parkedThoughtCount: sessionCaptures.length,
        startedAt: sessionStartedAt,
        endsAt: sessionEndsAt
      });
      
      // Handle appending captures
      if (appendToJournal && sessionCaptures.length > 0) {
        await useNexusStore.getState().appendCapturesToDailyNote(sessionCaptures, sessionDuration);
      }
      
      // Deliberately DO NOT create automatic session memory anymore
    } catch (err) {
      console.error(err);
    }
    
    if (markComplete && activeTaskId && activeTaskId !== 'deep-thinking') {
      updateTask(activeTaskId, { completed: true });
    }
    
    setIsConfirmingEarlyExit(false);
    resetFocusSession();
  };

  const activeTask = tasks?.find(t => t.id === activeTaskId);

  if (renderState === 'setup') {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-16">
        <button 
          onClick={resetFocusSession}
          className="fixed top-8 right-8 md:top-12 md:right-12 text-muted-foreground/60 hover:text-foreground transition-all duration-500 hover:rotate-90 z-50 bg-accent/20 p-3 rounded-full backdrop-blur-md"
          title="Close (Esc)"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        <div className="w-full space-y-6">
          <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground/40 uppercase">Commit to one task</p>
          <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto p-4 -mx-2 scrollbar-none group">
            <button
              onClick={() => setActiveTaskId('deep-thinking')}
              className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-[300ms] ease-out group-hover:opacity-40 hover:!opacity-100 ${
                activeTaskId === 'deep-thinking' 
                  ? 'bg-primary text-primary-foreground border-primary shadow-premium !opacity-100' 
                  : 'bg-card/20 border-border/10 text-foreground/60 hover:bg-card/40 hover:border-border/30 hover:-translate-y-[2px] hover:shadow-[0_8px_30px_-8px_rgba(255,255,255,0.04)] hover:text-foreground/90'
              }`}
            >
              <div className="flex items-center gap-4">
                <Target size={18} className={activeTaskId === 'deep-thinking' ? 'opacity-100' : 'opacity-50'} />
                <span className="font-medium text-lg">Deep Thinking Session</span>
              </div>
            </button>
            {tasks?.filter(t => !t.completed).map(task => (
              <button
                key={task.id}
                onClick={() => setActiveTaskId(task.id)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-[300ms] ease-out group-hover:opacity-40 hover:!opacity-100 ${
                  activeTaskId === task.id 
                    ? 'bg-primary text-primary-foreground border-primary shadow-premium !opacity-100' 
                    : 'bg-card/20 border-border/10 text-foreground/60 hover:bg-card/40 hover:border-border/30 hover:-translate-y-[2px] hover:shadow-[0_8px_30px_-8px_rgba(255,255,255,0.04)] hover:text-foreground/90'
                }`}
              >
                <span className="font-medium text-lg truncate block">{task.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col items-center gap-8">
          <div className="flex items-center gap-2">
            {[15, 25, 45, 60, 90].map(duration => (
              <button 
                key={duration}
                onClick={() => {
                  setSessionDuration(duration);
                  setIsCustomDuration(false);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${sessionDuration === duration && !isCustomDuration ? 'bg-primary/10 text-primary border border-primary/20 shadow-inset-edge' : 'text-muted-foreground/50 hover:bg-card/50 hover:text-foreground border border-transparent'}`}
              >
                {duration}m
              </button>
            ))}
            {isCustomDuration ? (
              <div className="flex items-center px-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Min"
                  value={customDurationInput}
                  onChange={e => setCustomDurationInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      // Handled by global listener
                    } else if (e.key === 'Escape') {
                      // Handled by global listener
                    }
                  }}
                  className="w-16 bg-card/50 border border-border/30 rounded-md text-center text-xs py-1.5 focus:outline-none focus:border-primary/50 text-foreground"
                />
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsCustomDuration(true);
                  setCustomDurationInput('');
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 text-muted-foreground/50 hover:bg-card/50 hover:text-foreground border border-transparent"
              >
                Custom
              </button>
            )}
          </div>

          <button 
            disabled={!activeTaskId || (isCustomDuration && (!customDurationInput || parseInt(customDurationInput) <= 0))}
            onClick={() => {
              if (isCustomDuration && parseInt(customDurationInput) > 0) {
                setSessionDuration(parseInt(customDurationInput));
              }
              // Allow state to settle briefly before starting
              setTimeout(() => {
                useStore.getState().startFocusSession();
                setTimeLeft(useStore.getState().sessionDuration * 60);
              }, 0);
            }}
            className="px-14 py-4 rounded-full bg-foreground text-background font-medium text-[15px] tracking-wide hover:scale-105 active:scale-95 transition-all duration-500 disabled:opacity-20 disabled:hover:scale-100 shadow-premium"
          >
            Begin Focus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full h-full">
        {/* The Chamber always renders when we are past setup */}
        <AnimatePresence>
          {(renderState === 'active' || renderState === 'reflection') && (
            <FocusChamber
              key="focus-chamber"
              task={activeTask}
              attachments={attachments}
              getFileUrl={getFileUrl}
              timeLeft={timeLeft}
              totalTime={sessionDuration * 60}
              formatTime={formatTime}
              isPaused={isTimerPaused}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onEndEarly={() => setIsConfirmingEarlyExit(true)}
              isConfirmingExit={isConfirmingEarlyExit}
              sessionCaptures={sessionCaptures}
              onParkThought={handleParkThoughtSubmit}
              onPlanetClick={(mode: FocusMode) => useStore.getState().setActiveFocusMode(mode)}
              onImageClick={setSelectedImage}
              isReflecting={false}
              onOpenNexus={() => setIsNexusOpen(true)}
            />
          )}
        </AnimatePresence>

        <NexusOverlay 
          isOpen={isNexusOpen} 
          onClose={() => setIsNexusOpen(false)} 
          timeLeft={timeLeft}
          formatTime={formatTime}
        />

        {/* Inline Floating Confirmation Panel */}
        <AnimatePresence>
          {isConfirmingEarlyExit && (
            <motion.div
              key="inline-exit-panel"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-28 z-40 w-[320px] flex flex-col bg-black/60 backdrop-blur-2xl border border-white/5 rounded-[24px] p-6 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <h3 className="text-white/90 text-sm font-medium tracking-wide mb-6 text-left w-full">
                {timeLeft === 0 ? 'Session complete' : 'End focus session?'}
              </h3>

              {activeTaskId && activeTaskId !== 'deep-thinking' && (
                <div className="flex flex-col gap-4 w-full mb-8">
                  <label className="flex items-center gap-3.5 cursor-pointer group">
                    <div className={`relative w-4 h-4 rounded-full border transition-all duration-300 flex items-center justify-center ${markComplete ? 'border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'border-white/20 group-hover:border-white/40'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${markComplete ? 'bg-[#00e5ff] scale-100' : 'bg-transparent scale-0'}`} />
                    </div>
                    <span className={`text-[13px] transition-colors duration-300 ${markComplete ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>Mark task complete</span>
                    <input type="radio" className="hidden" checked={markComplete} onChange={() => setMarkComplete(true)} />
                  </label>
                  <label className="flex items-center gap-3.5 cursor-pointer group">
                    <div className={`relative w-4 h-4 rounded-full border transition-all duration-300 flex items-center justify-center ${!markComplete ? 'border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'border-white/20 group-hover:border-white/40'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${!markComplete ? 'bg-[#00e5ff] scale-100' : 'bg-transparent scale-0'}`} />
                    </div>
                    <span className={`text-[13px] transition-colors duration-300 ${!markComplete ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>Keep task incomplete</span>
                    <input type="radio" className="hidden" checked={!markComplete} onChange={() => setMarkComplete(false)} />
                  </label>
                </div>
              )}

              {sessionCaptures.length > 0 && (
                <div className="flex flex-col gap-4 w-full mb-8">
                  <label className="flex items-center gap-3.5 cursor-pointer group">
                    <div className={`relative w-4 h-4 rounded-md border transition-all duration-300 flex items-center justify-center ${appendToJournal ? 'border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)] bg-[#00e5ff]/10' : 'border-white/20 group-hover:border-white/40'}`}>
                      {appendToJournal && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 text-[#00e5ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                    <span className={`text-[13px] transition-colors duration-300 ${appendToJournal ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>Append captures to today's Journal</span>
                    <input type="checkbox" className="hidden" checked={appendToJournal} onChange={() => setAppendToJournal(!appendToJournal)} />
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between w-full">
                <button 
                  onClick={() => setIsConfirmingEarlyExit(false)}
                  className="text-[11px] uppercase tracking-[0.15em] text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium px-4 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEndSessionConfirm}
                  className="text-[11px] uppercase tracking-[0.15em] bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 font-medium px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      


      {/* Lightbox Portal Layer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-accent/40 text-foreground/70 hover:text-foreground hover:bg-accent/80 transition-all duration-300 z-10"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
            
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
