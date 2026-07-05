import { useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNexusStore } from '@/features/nexus/store/useNexusStore';

const NexusView = lazy(() => import('@/features/nexus/components/NexusView').then(m => ({ default: m.NexusView })));

interface NexusOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export function NexusOverlay({ isOpen, onClose, timeLeft, formatTime }: NexusOverlayProps) {
  const { isCreateModalOpen } = useNexusStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with N
      if (e.key === 'n' && isOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        if (!isCreateModalOpen) {
          e.preventDefault();
          onClose();
        }
      }

      // Close on ESC
      if (e.key === 'Escape' && isOpen) {
        if (!isCreateModalOpen) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }
    };
    
    // Use capture to preempt other components
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, isCreateModalOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ 
            opacity: 0, 
            scale: 0.98, 
            y: 20,
            transition: { duration: 0.4, ease: "easeInOut" }
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-xl"
        >
          <div className="relative w-full h-full bg-[#080808] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/10 flex flex-col">
            {/* Overlay Controls */}
            <div className="absolute top-6 right-6 z-[60] flex items-center gap-4">
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group backdrop-blur-md"
                title="Return to focus (Esc)"
              >
                <X size={18} className="text-white/60 group-hover:text-white transition-colors" />
              </button>
            </div>
            
            {/* Focus Active Indicator */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] pointer-events-none flex items-center justify-center">
              <div className="px-3.5 py-1.5 rounded-full bg-[#1E1E1E]/80 border border-white/10 backdrop-blur-md flex items-center gap-2.5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#e5e2e1]/40" />
                <span className="text-[11px] text-[#e5e2e1]/90 font-mono tracking-widest font-medium">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            {/* The full Nexus View */}
            <div className="flex-1 overflow-hidden relative">
              <Suspense fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              }>
                <NexusView isOverlay={true} />
              </Suspense>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
