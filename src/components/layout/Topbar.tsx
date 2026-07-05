import { Target } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export function Topbar() {
  const focusState = useStore(state => state.focusState);
  const setFocusState = useStore(state => state.setFocusState);
  const isFocusing = focusState !== 'idle';

  return (
    <motion.header 
      animate={{ opacity: isFocusing ? 0 : 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className={`h-20 flex items-center justify-between px-6 md:px-12 sticky top-0 z-30 ${isFocusing ? 'pointer-events-none' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-transparent pointer-events-none backdrop-blur-[2px]" />
      
      <div className="flex items-center gap-4 relative z-10">
        {/* Intentionally left blank for potential future breadcrumbs */}
      </div>

      <div className="absolute left-[45%] lg:left-[42%] -translate-x-1/2 z-10 flex items-center justify-center">
        <button 
          onClick={() => setFocusState('setup')}
          className="group flex items-center gap-2.5 px-3 py-1.5 text-foreground/40 hover:text-foreground transition-all duration-700 ease-out active:scale-[0.98]"
        >
          <Target 
            size={16} 
            strokeWidth={1.5} 
            className="opacity-50 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-700" 
          />
          <span className="text-[11px] font-medium tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-all duration-700">
            Enter Focus
          </span>
        </button>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {/* Placeholder for future right-side actions if needed */}
      </div>
    </motion.header>
  );
}
