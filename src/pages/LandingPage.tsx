import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { 
  HeroSection, 
  IntegrationsSection, 
  ProblemSection, 
  ModuleSpecsSection, 
  WorkflowSection, 
  FeatureDeepDiveSection, 
  CtaSection, 
  FooterSection 
} from '@/components/landing';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleLoginRedirect = () => navigate('/login');

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="antialiased min-h-screen flex flex-col relative border-tech-x border-tech-y mx-auto max-w-container-max bg-background text-on-surface overflow-x-clip"
      onMouseMove={handleMouseMove}
    >
      {/* 1. Tactile Film Grain */}
      <div className="noise-overlay"></div>

      {/* 2. Celestial Ambient Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vh] rounded-full bg-primary/20 blur-[120px] pointer-events-none z-[-2]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vh] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none z-[-2]"
      />

      {/* Interactive Cursor Spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[-1] transition-opacity duration-300"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(197, 192, 255, 0.05), transparent 40%)`
        }}
      />

      {/* Background Grids */}
      <div className="tech-grid grid-subdivision z-[-2]"></div>

      {/* 1. Left/Right HUD Margins */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-32 z-50 pointer-events-none hidden xl:flex">
        <div className="mono-accent rotate-[-90deg] origin-left whitespace-nowrap">SYS.VER.1.0.4</div>
        <div className="w-px h-32 bg-white/20 mx-auto"></div>
        <div className="mono-accent rotate-[-90deg] origin-left whitespace-nowrap">STATUS: OPTIMAL</div>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-32 z-50 pointer-events-none hidden xl:flex items-center">
        <div className="mono-accent rotate-90 origin-right whitespace-nowrap">
          COORD: {(mousePosition.x / 10).toFixed(2)} N, {(mousePosition.y / 10).toFixed(2)} E
        </div>
        <div className="w-px h-32 bg-white/20 mx-auto"></div>
        <div className="mono-accent rotate-90 origin-right whitespace-nowrap">LATENCY: 12ms</div>
      </div>

      {/* 2. TopNavBar */}
      <header className="w-full border-b border-white/10 bg-background/80 backdrop-blur-md z-40 sticky top-0">
        <div className="flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px] shadow-sm shadow-primary/20">
              P
            </div>
            <div className="font-headline-lg text-[20px] font-bold tracking-tight text-on-surface">Productivity</div>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={handleLoginRedirect} className="btn-precision btn-glitch-hover px-6 py-2 font-label-mono text-label-mono text-on-surface cursor-pointer">LOGIN</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start relative">
        <div className="ambient-texture top-0 left-1/4"></div>

        <HeroSection onLoginRedirect={handleLoginRedirect} />
        <IntegrationsSection />
        <ProblemSection />
        <ModuleSpecsSection />
        <WorkflowSection />
        <FeatureDeepDiveSection />
        <CtaSection onLoginRedirect={handleLoginRedirect} />
      </main>

      <FooterSection />
    </div>
  );
}
