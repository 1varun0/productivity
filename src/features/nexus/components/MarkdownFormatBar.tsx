import { motion, AnimatePresence } from 'framer-motion';
import { Bold, Italic, Code } from 'lucide-react';
import type { FormatType } from '../hooks/useMarkdownShortcuts';

interface MarkdownFormatBarProps {
  isActive: boolean;
  position: { top: number; left: number };
  onFormat: (type: FormatType) => void;
}

export function MarkdownFormatBar({ isActive, position, onFormat }: MarkdownFormatBarProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute z-50 flex items-center gap-1 p-1 bg-[#161616]/80 backdrop-blur-md border border-white/5 rounded-lg shadow-xl"
          style={{ 
            top: position.top, 
            left: position.left,
            transform: 'translateX(-50%)' // visually center it over the coordinate
          }}
        >
          <button
            onMouseDown={(e) => { e.preventDefault(); onFormat('bold'); }}
            className="p-1.5 text-[#928f9e] hover:text-[#e5e2e1] hover:bg-white/10 rounded transition-colors"
            title="Bold (Cmd/Ctrl+B)"
          >
            <Bold size={14} strokeWidth={2.5} />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); onFormat('italic'); }}
            className="p-1.5 text-[#928f9e] hover:text-[#e5e2e1] hover:bg-white/10 rounded transition-colors"
            title="Italic (Cmd/Ctrl+I)"
          >
            <Italic size={14} strokeWidth={2.5} />
          </button>
          <div className="w-px h-3 bg-white/10 mx-0.5" />
          <button
            onMouseDown={(e) => { e.preventDefault(); onFormat('code'); }}
            className="p-1.5 text-[#928f9e] hover:text-[#e5e2e1] hover:bg-white/10 rounded transition-colors"
            title="Inline Code (Cmd/Ctrl+Shift+C)"
          >
            <Code size={14} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
