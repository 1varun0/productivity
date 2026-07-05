import React from 'react';
import { BookOpen, Server, LayoutDashboard, Grid, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export const DocumentationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface pt-24 pb-32 px-6 md:px-12 selection:bg-primary/30">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="mono-accent mb-4">SYSTEM // DOCUMENTATION</div>
          <h1 className="font-headline-xl text-5xl md:text-7xl text-glow mb-6">User Guide</h1>
          <p className="font-body-lg text-on-surface-variant text-xl max-w-2xl">
            Everything you need to know to harness the full power of the Productivity suite. From local-first sync to entering the Focus Chamber.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Module 1: Spaces */}
          <div className="bg-surface/50 border border-white/10 p-8 rounded-lg hover:border-primary/50 transition-colors">
            <LayoutDashboard className="text-primary w-8 h-8 mb-6" />
            <h3 className="font-headline-lg text-2xl text-white mb-3">Spaces & Organization</h3>
            <p className="text-on-surface-variant font-body mb-4">
              Spaces act as your highest-level containers. Think of them as individual workspaces for different aspects of your life (e.g., "Work", "Personal", "Side Project"). 
              Drag and drop items fluidly between spaces to maintain total organizational control.
            </p>
            <ul className="list-disc pl-5 text-sm text-white/60 space-y-1">
              <li>Infinite nesting capabilities</li>
              <li>Real-time collaborative syncing</li>
              <li>Custom icons and accent colors per space</li>
            </ul>
          </div>

          {/* Module 2: Timetable */}
          <div className="bg-surface/50 border border-white/10 p-8 rounded-lg hover:border-primary/50 transition-colors">
            <Grid className="text-primary w-8 h-8 mb-6" />
            <h3 className="font-headline-lg text-2xl text-white mb-3">Cinematic Timetable</h3>
            <p className="text-on-surface-variant font-body mb-4">
              A distraction-free, ultra-wide scheduling interface. Drag blocks of time to construct your perfect day. The timetable uses a collapsible "Premade Blocks" tray to maximize your vertical screen real estate.
            </p>
            <ul className="list-disc pl-5 text-sm text-white/60 space-y-1">
              <li>Snap-to-grid scheduling</li>
              <li>Timeblock clash detection</li>
              <li>Minimalist "Now" indicator</li>
            </ul>
          </div>

          {/* Module 3: Focus Chamber */}
          <div className="bg-surface/50 border border-white/10 p-8 rounded-lg hover:border-primary/50 transition-colors">
            <Target className="text-primary w-8 h-8 mb-6" />
            <h3 className="font-headline-lg text-2xl text-white mb-3">The Focus Chamber</h3>
            <p className="text-on-surface-variant font-body mb-4">
              Our flagship immersive mode. The Focus Chamber strips away all UI chrome, replacing traditional buttons with floating "constellation controls" that respond to proximity. Designed for deep, uninterrupted work sessions.
            </p>
            <ul className="list-disc pl-5 text-sm text-white/60 space-y-1">
              <li>Mathematical tangential orbital controls</li>
              <li>Destructive ritual mechanics to end sessions</li>
              <li>Zero UI overlap with standard navigation</li>
            </ul>
          </div>

          {/* Module 4: Nexus Engine */}
          <div className="bg-surface/50 border border-white/10 p-8 rounded-lg hover:border-primary/50 transition-colors">
            <BookOpen className="text-primary w-8 h-8 mb-6" />
            <h3 className="font-headline-lg text-2xl text-white mb-3">Nexus Editor</h3>
            <p className="text-on-surface-variant font-body mb-4">
              A single, immersive text editing surface that fills the workspace natively. The Nexus Editor removes redundant borders and features built-in slash commands for rapid note-taking.
            </p>
            <ul className="list-disc pl-5 text-sm text-white/60 space-y-1">
              <li>Glassmorphic fullscreen aesthetic</li>
              <li>Integrated workspace controls (Pin, Split)</li>
              <li>Markdown-first syntax parsing</li>
            </ul>
          </div>
        </div>

        <section className="bg-primary/5 border border-primary/20 p-8 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-primary w-6 h-6" />
            <h2 className="font-headline-lg text-2xl text-white">Technical Architecture (For Nerds)</h2>
          </div>
          <div className="prose prose-invert max-w-none font-body text-on-surface-variant text-sm">
            <p className="mb-4">
              Productivity is built on a heavily optimized React/Vite frontend using strict TypeScript. We utilize Framer Motion extensively to drive our signature "cyberpunk/monospaced" animations and micro-interactions without sacrificing frame rates.
            </p>
            <p>
              Data state is managed via a local-first philosophy. Your actions are immediately committed to local IndexedDB storage (making the app feel instant), while a background Supabase worker synchronizes your deltas to our AES-256 encrypted Postgres clusters in the cloud. We utilize Supabase Realtime to broadcast these changes across your active devices.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
