import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Target, CheckSquare, Brain, Zap, Calendar, Users } from 'lucide-react';

const modules = [
  { i: Target, id: "T-01", t: "Focus Mode", d: "A distraction-free timer that locks you into one task at a time. No notifications. Just work.", p: "SHORTCUT: ENTER FOCUS", c: "group-hover:text-primary" },
  { i: CheckSquare, id: "I-02", t: "Tasks & Spaces", d: "Capture tasks instantly, organize them into Spaces, and attach files, links, and notes right inside each task.", p: "DRAG + DROP READY", c: "group-hover:text-blue-400" },
  { i: Brain, id: "N-03", t: "Nexus Notes", d: "A lightning-fast markdown knowledge base with split-screen, slash commands, templates, and full version history.", p: "FORMAT: MARKDOWN", c: "group-hover:text-purple-400" },
  { i: Zap, id: "H-04", t: "Habits", d: "Track your daily routines on a beautiful visual matrix. Build streaks, review past months, and never break the chain.", p: "TRACKS: DAILY / MONTHLY", c: "group-hover:text-yellow-400" },
  { i: Calendar, id: "C-05", t: "Timetable", d: "Drag tasks and habits directly onto a 24-hour weekly grid. See conflicts, track time by category, and export your schedule as a PNG.", p: "VIEW: 24HR WEEKLY GRID", c: "group-hover:text-green-400" },
  { i: Users, id: "W-06", t: "Workspace", d: "Collaborate on projects with your team. Shared tasks, real-time chat, docs, and files — all in one place.", p: "ACCESS: INVITE ONLY", c: "group-hover:text-orange-400" },
];

function ModuleCard({ f, index }: { f: typeof modules[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.92, 1]);
  // Alternate subtle rotation direction
  const rotate = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? 2 : -2, 0]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity, scale, rotate }}
      className={`p-8 ${index < 3 ? 'border-b lg:border-b-0' : 'border-t'} ${index % 3 !== 2 ? 'lg:border-r' : ''} border-white/10 relative group bg-background hover:bg-white/[0.03] transition-colors`}
    >
      <div className="absolute top-4 right-4 mono-accent">{f.id}</div>
      <f.i className={`w-6 h-6 text-white/50 mb-8 transition-colors duration-300 ${f.c}`} />
      <h3 className="font-title-md text-on-surface mb-3">{f.t}</h3>
      <p className="font-body-sm text-on-surface-variant mb-6">{f.d}</p>
      <div className="w-full h-[1px] bg-white/10 mb-4"></div>
      <div className="mono-accent">{f.p}</div>
    </motion.div>
  );
}

export const ModuleSpecsSection: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: headerProgress } = useScroll({
    target: headerRef,
    offset: ["start end", "center center"]
  });

  const headerY = useTransform(headerProgress, [0, 1], [40, 0]);
  const headerOpacity = useTransform(headerProgress, [0, 0.6], [0, 1]);

  return (
    <section id="architecture" className="w-full border-b border-white/10 py-24 px-8 md:px-16 relative">
      <div className="crosshair top-0 left-1/2"></div>

      <motion.div ref={headerRef} style={{ y: headerY, opacity: headerOpacity }} className="mb-16">
        <div className="mono-accent mb-4">MODULE_SPECS // 01</div>
        <h2 className="font-headline-lg text-on-surface text-glow">Everything you need to do your best work.</h2>
        <p className="font-body-sm text-on-surface-variant max-w-md mt-4">Six deeply integrated modules that work together so you never have to switch apps again.</p>
      </motion.div>

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full schematic-line-h -z-10 hidden lg:block"></div>
        <div className="absolute top-0 left-1/3 schematic-line-v -z-10 hidden lg:block"></div>
        <div className="absolute top-0 right-1/3 schematic-line-v -z-10 hidden lg:block"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-tech">
          {modules.map((f, i) => (
            <ModuleCard key={i} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
