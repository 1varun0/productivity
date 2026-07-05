import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { 
  Calendar, CheckSquare, FileText, MessageCircle, Mail, Table, 
  Folder, Link, Layout, Box, Hash, Zap, Cloud, Database, Globe, 
  Settings, User, Image as ImageIcon, Video, Bell
} from 'lucide-react';

interface FloatingCardProps {
  scrollYProgress: MotionValue<number>;
  config: any;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ scrollYProgress, config }) => {
  const y = useTransform(scrollYProgress, [0, 1], config.parallax);
  const Icon = config.icon;
  
  return (
    <motion.div
      style={{ y: y as any }}
      animate={{ rotate: config.rotate }}
      transition={{ duration: config.duration, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute flex items-center justify-center gap-2 rounded-sm shadow-2xl ${config.className}`}
    >
      <Icon className={`w-4 h-4 ${config.colorClass}`} />
      {config.label && <span className={`font-label-mono text-[10px] ${config.colorClass}`}>{config.label}</span>}
    </motion.div>
  );
};

const chaosCards = [
  // Primary (Original 6)
  { icon: Calendar, label: "CALENDAR", parallax: [40, -40], rotate: [-12, 12, -12], duration: 8, className: "w-32 h-12 bg-red-500/10 border border-red-500/30 top-[25%] left-[10%] z-20", colorClass: "text-red-400" },
  { icon: CheckSquare, label: "TASK_MANAGER", parallax: [-30, 30], rotate: [6, -6, 6], duration: 7, className: "w-40 h-12 bg-blue-500/10 border border-blue-500/30 top-[45%] right-[10%] z-20", colorClass: "text-blue-400" },
  { icon: FileText, label: "NOTES_APP", parallax: [20, -50], rotate: [3, -5, 3], duration: 9, className: "w-36 h-12 bg-yellow-500/10 border border-yellow-500/30 bottom-[30%] left-[15%] z-20", colorClass: "text-yellow-400" },
  { icon: MessageCircle, label: "TEAM_CHAT", parallax: [-50, 40], rotate: [-5, 8, -5], duration: 6, className: "w-36 h-12 bg-green-500/10 border border-green-500/30 top-[15%] right-[15%] z-0 opacity-50", colorClass: "text-green-400" },
  { icon: Mail, label: "EMAILS", parallax: [60, -30], rotate: [15, -10, 15], duration: 10, className: "w-32 h-12 bg-purple-500/10 border border-purple-500/30 bottom-[15%] right-[25%] z-0 opacity-40", colorClass: "text-purple-400" },
  { icon: Table, label: "KANBAN_BOARD", parallax: [-20, 50], rotate: [-20, 15, -20], duration: 11, className: "w-40 h-12 bg-orange-500/10 border border-orange-500/30 bottom-[10%] left-[30%] z-20", colorClass: "text-orange-400" },
  
  // Background / Outlier Chaos (The "Mess")
  { icon: Folder, label: "FILE_STORAGE", parallax: [80, -80], rotate: [10, -20, 10], duration: 12, className: "w-36 h-10 bg-teal-500/10 border border-teal-500/30 top-[-5%] left-[40%] z-0 opacity-30", colorClass: "text-teal-400" },
  { icon: Link, label: "URL_MANAGER", parallax: [-60, 60], rotate: [-15, 25, -15], duration: 9, className: "w-32 h-10 bg-pink-500/10 border border-pink-500/30 bottom-[-10%] right-[40%] z-0 opacity-30", colorClass: "text-pink-400" },
  { icon: Layout, label: "WHITEBOARD", parallax: [50, -30], rotate: [20, -15, 20], duration: 14, className: "w-32 h-10 bg-cyan-500/10 border border-cyan-500/30 top-[35%] left-[-10%] z-10 opacity-60", colorClass: "text-cyan-400" },
  { icon: Database, label: "CRM_TOOL", parallax: [-40, 70], rotate: [-10, 10, -10], duration: 15, className: "w-36 h-10 bg-rose-500/10 border border-rose-500/30 top-[60%] right-[-5%] z-10 opacity-60", colorClass: "text-rose-400" },
  
  // Tiny Icons (The "Debris")
  { icon: Box, label: "", parallax: [100, -100], rotate: [45, 180, 45], duration: 20, className: "w-10 h-10 bg-white/5 border border-white/10 top-[10%] right-[30%] z-0 opacity-20", colorClass: "text-white" },
  { icon: Hash, label: "", parallax: [-80, 80], rotate: [-45, -180, -45], duration: 18, className: "w-8 h-8 bg-white/10 border border-white/20 bottom-[20%] right-[10%] z-20 opacity-40", colorClass: "text-white" },
  { icon: Zap, label: "", parallax: [120, -50], rotate: [0, 360, 0], duration: 25, className: "w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 rounded-full top-[50%] left-[5%] z-0 opacity-30", colorClass: "text-yellow-400" },
  { icon: Cloud, label: "", parallax: [-100, 100], rotate: [-20, 20, -20], duration: 16, className: "w-10 h-10 bg-blue-500/10 border border-blue-500/30 bottom-[5%] left-[20%] z-0 opacity-30", colorClass: "text-blue-400" },
  { icon: Settings, label: "", parallax: [70, -120], rotate: [0, -360, 0], duration: 30, className: "w-10 h-10 bg-white/5 border border-white/10 rounded-full top-[80%] right-[35%] z-20 opacity-50", colorClass: "text-white" },
  { icon: User, label: "", parallax: [-50, 90], rotate: [10, -10, 10], duration: 13, className: "w-8 h-8 bg-white/10 border border-white/20 top-[5%] left-[35%] z-10 opacity-40", colorClass: "text-white" },
  { icon: ImageIcon, label: "", parallax: [90, -40], rotate: [-15, 15, -15], duration: 17, className: "w-10 h-10 bg-purple-500/10 border border-purple-500/30 top-[30%] right-[40%] z-0 opacity-20", colorClass: "text-purple-400" },
  { icon: Video, label: "", parallax: [-110, 60], rotate: [25, -25, 25], duration: 22, className: "w-12 h-12 bg-red-500/10 border border-red-500/30 bottom-[40%] left-[-5%] z-0 opacity-30", colorClass: "text-red-400" },
  { icon: Bell, label: "", parallax: [40, -110], rotate: [-30, 30, -30], duration: 14, className: "w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-full bottom-[15%] right-[2%] z-10 opacity-50", colorClass: "text-green-400" },
  { icon: Globe, label: "", parallax: [-90, 90], rotate: [0, 180, 0], duration: 28, className: "w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-full top-[70%] left-[25%] z-0 opacity-20", colorClass: "text-cyan-400" },
];

export const ProblemSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Left panel slides in from left
  const leftX = useTransform(scrollYProgress, [0, 0.3, 0.7], [-80, 0, 0]);
  const leftOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const leftRotate = useTransform(scrollYProgress, [0, 0.3], [-3, 0]);

  // Right panel slides in from right
  const rightX = useTransform(scrollYProgress, [0.05, 0.35, 0.7], [80, 0, 0]);
  const rightOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);

  // "CHAOS" text scale
  const chaosScale = useTransform(scrollYProgress, [0.1, 0.4], [0.8, 1]);
  const chaosOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 0.2]);

  return (
    <section ref={sectionRef} className="w-full py-24 px-8 md:px-16 border-b border-white/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          style={{ x: leftX, opacity: leftOpacity, rotate: leftRotate }}
          className="relative aspect-square border-tech bg-white/[0.02] p-8 flex items-center justify-center overflow-hidden group"
        >
          <div className="tech-grid opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-0"></div>
          
          {chaosCards.map((config, index) => (
            <FloatingCard key={index} scrollYProgress={scrollYProgress} config={config} />
          ))}

          <motion.div
            style={{ scale: chaosScale, opacity: chaosOpacity }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <span className="font-headline-xl text-[100px] md:text-[140px] text-white tracking-widest font-black drop-shadow-2xl mix-blend-overlay">CHAOS</span>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ x: rightX, opacity: rightOpacity }}
          className="flex flex-col gap-6 relative z-30"
        >
          <div className="mono-accent">SYSTEM_DIAGNOSTIC // FRAGMENTATION_ERROR</div>
          <h2 className="font-headline-lg text-[40px] md:text-[56px] leading-tight text-glow">Stop switching between tools.</h2>
          <p className="font-body-lg text-on-surface-variant text-lg">
            You use five apps to do one job. A task manager here, a calendar there, a notes app somewhere else, and a team chat on top of it all. Every switch costs you time and focus.
          </p>
          <p className="font-body-lg text-white text-lg font-medium border-l border-primary pl-4 py-2">
            Productivity connects everything. One app, zero switching.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
