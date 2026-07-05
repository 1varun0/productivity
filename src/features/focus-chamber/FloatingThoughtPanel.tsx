import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASING, DURATIONS } from './theme/motion';
import { AMBIENT_STYLES } from './theme/ambientStyles';

interface FloatingThoughtPanelProps {
  onParkThought: (thought: string) => Promise<void>;
  sessionCaptures: string[];
}

export function FloatingThoughtPanel({ onParkThought, sessionCaptures }: FloatingThoughtPanelProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [particles, setParticles] = useState<{ id: number; timestamp: number }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onParkThought(text);
      setText('');
      
      // Spawn a new particle
      const newId = Date.now();
      setParticles(prev => [...prev, { id: newId, timestamp: newId }]);
      
      // Clean up particle after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newId));
      }, DURATIONS.slow * 1000);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: DURATIONS.slow, ease: EASING.cinematic }}
      className="absolute right-16 top-1/2 -translate-y-1/2 z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        animate={{
          opacity: isHovered || text.length > 0 ? 1 : 0.15,
          scale: isHovered ? 1 : 0.98,
          filter: isHovered ? 'blur(0px)' : 'blur(1px)',
        }}
        transition={{ duration: DURATIONS.fast, ease: EASING.softExpand }}
        className={`w-[300px] p-8 rounded-3xl ${isHovered ? AMBIENT_STYLES.glassPanelActive : AMBIENT_STYLES.glassPanelIdle} flex flex-col gap-6 group`}
      >
        <div className="space-y-2">
          <motion.p 
            animate={{ opacity: isHovered ? 0.4 : 0.2 }}
            className="text-[9px] font-semibold tracking-[0.3em] uppercase flex items-center justify-between"
          >
            <span>Park Thought</span>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[7px] font-mono">⌘⇧P</span>
          </motion.p>
          <form onSubmit={handleSubmit} className="relative mt-4">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type to capture..."
              className="w-full bg-transparent border-b border-white/[0.05] text-white/70 text-xs pb-2 focus:outline-none focus:border-white/30 transition-colors font-light placeholder:text-white/20"
            />
          </form>
        </div>

        <AnimatePresence>
          {isHovered && sessionCaptures.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: DURATIONS.fast, ease: EASING.softExpand }}
              className="space-y-3 overflow-hidden"
            >
              <p className="text-[9px] font-semibold tracking-[0.3em] text-white/20 uppercase">Session Orbit</p>
              <ul className="space-y-2 max-h-[120px] overflow-y-auto scrollbar-none">
                {sessionCaptures.slice().reverse().map((capture, idx) => (
                  <li key={idx} className="text-[10px] font-extralight text-white/40 truncate flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                    {capture}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Particles layer - Absolute to the container, animating away into the center */}
      {particles.map((p) => (
        <motion.div 
          key={p.id}
          initial={{ x: 20, y: 40, opacity: 1, scale: 1 }}
          animate={{ x: -400, y: 100, opacity: 0, scale: 0.2 }}
          transition={{ duration: DURATIONS.slow, ease: "easeInOut" }}
          className="absolute left-0 top-0 w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none z-50"
        />
      ))}
    </motion.div>
  );
}
