import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, PenTool, MessageSquare, Kanban, Box } from 'lucide-react';

const VercelIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L24 22H0L12 2Z" />
  </svg>
);

const integrations = [
  { name: 'Vercel', icon: VercelIcon },
  { name: 'GitHub', icon: Terminal },
  { name: 'Figma', icon: PenTool },
  { name: 'Slack', icon: MessageSquare },
  { name: 'Trello', icon: Kanban },
  { name: 'Notion', icon: Box },
];

export const IntegrationsSection: React.FC = () => {
  return (
    <section className="w-full py-24 border-b border-white/10 flex flex-col items-center justify-center overflow-hidden relative bg-[#0a0a0a]">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <p className="font-label-mono text-white/40 mb-12 uppercase tracking-widest text-[10px] text-center px-4 relative z-10">
        Designed for the tools you already know
      </p>

      {/* Marquee Container with Gradient Edge Mask */}
      <div 
        className="w-full overflow-hidden relative z-10"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="flex w-max"
        >
          {/* Double array for seamless infinite looping */}
          {[...integrations, ...integrations, ...integrations].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.name}-${i}`}
                className="flex items-center gap-4 mx-8 md:mx-12 group cursor-default"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/50">
                  <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="font-headline-lg text-2xl font-bold tracking-tight text-white/30 group-hover:text-white transition-colors duration-300">
                  {item.name}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
