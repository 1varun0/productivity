import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap } from 'lucide-react';

interface CtaSectionProps {
  onLoginRedirect: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onLoginRedirect }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.8], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.8], [60, 0]);

  // Glow intensity increases as section comes into view
  const glowOpacity = useTransform(scrollYProgress, [0.3, 1], [0, 0.4]);

  return (
    <motion.div
      ref={sectionRef}
      style={{ scale, opacity, y }}
      className="mt-32 pt-24 border-t border-white/10 text-center flex flex-col items-center relative"
    >
      {/* Ambient glow behind the CTA */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-primary/20 blur-[100px] pointer-events-none"
      />

      <div className="mono-accent mb-6 relative z-10">ALL_MODULES // CONNECTED</div>
      <h3 className="font-headline-lg text-on-surface mb-6 text-glow relative z-10">Every feature talks to every other.<br/>That is the point.</h3>
      <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12 relative z-10">A task can be dragged to your Timetable, launched in Focus Mode, and assigned to a teammate in Workspace. Nothing is isolated. Everything compounds. This is not a collection of tools. It is one system.</p>

      <button 
        onClick={onLoginRedirect}
        className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-label-mono hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 relative z-10"
      >
        GET STARTED NOW
        <Zap size={16} />
      </button>

    </motion.div>
  );
};
