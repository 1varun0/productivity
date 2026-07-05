import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { TerminalSquare, GitBranch } from 'lucide-react';
import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

interface HeroSectionProps {
  onLoginRedirect: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLoginRedirect }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms as user scrolls past the hero
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const wireframeY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const wireframeScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.85]);
  const wireframeRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);

  return (
    <section ref={sectionRef} className="w-full grid grid-cols-1 md:grid-cols-12 min-h-[85vh] border-b border-white/10 relative">
      <div className="crosshair top-0 left-0"></div>
      <div className="crosshair top-0 right-0"></div>
      <div className="crosshair bottom-0 left-0"></div>
      <div className="crosshair bottom-0 right-0"></div>

      <div className="md:col-span-7 flex flex-col justify-center px-8 md:px-16 py-24 md:py-0 border-r border-white/10 relative">
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp}
          style={{ y: textY, opacity: textOpacity }}
          className="mb-12"
        >
          <div className="mono-accent mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white animate-pulse"></span>
            SYSTEM ONLINE / ALL MODULES ACTIVE
          </div>
          <h1 className="font-headline-xl text-on-surface mb-8 text-glow">
            Your entire work life.<br />
            <span className="text-white/40">One place.</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-xl mb-12">
            Tasks, habits, notes, time-blocking, and team collaboration — all connected. Built for people who take their work seriously.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <button onClick={onLoginRedirect} className="btn-precision-primary btn-glitch-hover px-8 py-4 font-label-mono text-label-mono flex items-center justify-center gap-3 cursor-pointer">
              GET STARTED FREE
              <TerminalSquare className="w-4 h-4" />
            </button>
            <a href="https://github.com/1varun0/productivity" target="_blank" rel="noreferrer" className="btn-precision btn-glitch-hover px-8 py-4 font-label-mono text-label-mono flex items-center justify-center gap-3 cursor-pointer no-underline text-on-surface">
              STAR ON GITHUB
              <GitBranch className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-8 right-8 flex justify-between border-t border-white/10 pt-4 hidden md:flex">
          <div className="mono-accent">RUNTIME: 99.99% UPTIME</div>
          <div className="mono-accent">ENCRYPTION: AES-256</div>
          <div className="mono-accent">LATENCY: &lt;10ms</div>
        </div>
      </div>

      <div className="md:col-span-5 relative bg-white/[0.02] overflow-hidden flex items-center justify-center p-8">
        <div className="tech-grid grid-subdivision opacity-50 z-[-1]"></div>

        {/* Draggable UI Wireframe with scroll parallax */}
        <motion.div
          drag
          dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
          whileDrag={{ scale: 1.05, cursor: "grabbing" }}
          whileHover={{ cursor: "grab" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ y: wireframeY, scale: wireframeScale, rotate: wireframeRotate }}
          className="w-full max-w-sm aspect-[3/4] border-tech bg-background/80 backdrop-blur-md p-6 flex flex-col gap-6 relative z-10 hover:border-primary/50 transition-colors shadow-2xl"
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 border border-white/50"></div>
              <div className="w-2 h-2 border border-white/50"></div>
            </div>
            <div className="mono-accent">WORKSPACE_01</div>
          </div>
          <div className="flex-1 flex gap-4">
            <div className="w-16 border-r border-white/10 flex flex-col gap-4 pr-4">
              <div className="w-full h-8 border border-white/10"></div>
              <div className="w-full h-8 border border-white/10 bg-white/5"></div>
              <div className="w-full h-8 border border-white/10"></div>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="h-24 border border-white/10 relative overflow-hidden">
                <div className="absolute top-2 left-2 mono-accent text-[8px]">FOCUS_MODULE</div>
                <div className="w-12 h-12 border border-white/20 rounded-full mx-auto mt-6 flex items-center justify-center relative">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t border-primary"></motion.div>
                  <span className="font-label-mono text-[9px] text-white/50">25:00</span>
                </div>
              </div>
              <div className="flex-1 border border-white/10 relative p-2 flex flex-col gap-2">
                <div className="absolute top-2 right-2 mono-accent text-[8px]">NEXUS_SYNC</div>
                <div className="w-3/4 h-2 bg-white/10 mt-4"></div>
                <div className="w-full h-2 bg-white/5"></div>
                <div className="w-5/6 h-2 bg-white/5"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
