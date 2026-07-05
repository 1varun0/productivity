import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Minus,
  Code, Terminal, Info, Image, Paperclip, Calendar, Bold, Italic
} from 'lucide-react';
import type { SlashCommand, CommandGroup } from '../hooks/useSlashCommands';

const ICON_MAP: Record<string, React.ElementType> = {
  Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Minus,
  Code, Terminal, Info, Image, Paperclip, Calendar, Bold, Italic
};

const GROUP_LABELS: Record<CommandGroup, string> = {
  text: 'Text & Structure',
  code: 'Code',
  media: 'Media',
  productivity: 'Productivity'
};

interface SlashCommandMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
}

export function SlashCommandMenu({ isOpen, position, commands, selectedIndex, onSelect }: SlashCommandMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const activeEl = containerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && commands.length > 0 && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute z-50 w-64 max-h-[300px] overflow-y-auto custom-scrollbar bg-[#161616]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col gap-0.5"
          style={{ 
            top: position.top + 24, // add line-height offset
            left: position.left,
            // Ensure it doesn't go off screen (rough estimation, ideally we'd measure viewport)
          }}
        >
          {commands.map((cmd, idx) => {
            const Icon = ICON_MAP[cmd.iconName];
            const isActive = idx === selectedIndex;
            
            // Determine if we need to show a group header
            const showGroup = idx === 0 || commands[idx - 1].group !== cmd.group;
            
            return (
              <div key={cmd.id}>
                {showGroup && (
                  <div className="px-3 py-1 mt-1 text-[9px] uppercase tracking-[0.15em] text-[#474553] font-bold">
                    {GROUP_LABELS[cmd.group]}
                  </div>
                )}
                <button
                  data-active={isActive}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(cmd);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                    isActive 
                      ? 'bg-[#c5c0ff]/10 text-[#c8c4d5]' 
                      : 'text-[#928f9e] hover:bg-white/5'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${isActive ? 'bg-[#c5c0ff]/20 text-[#c5c0ff]' : 'bg-white/5 text-[#928f9e]'}`}>
                    {Icon && <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${isActive ? 'text-[#e5e2e1]' : ''}`}>
                      {cmd.label}
                    </span>
                    <span className="text-[10px] text-[#474553]">
                      {cmd.description}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
