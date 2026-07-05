import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue, transform, useMotionValueEvent } from 'framer-motion';
import { 
  TasksMockup, 
  FocusMockup, 
  NexusMockup, 
  HabitsMockup, 
  TimetableMockup, 
} from './Mockups';
import { WorkspaceMockup } from './WorkspaceMockup';

// ─── Scroll-animated feature row ─────────────────────────────────
function FeatureRow({
  children,
  mockupSide,
  progress,
  index,
}: {
  children: [React.ReactNode, React.ReactNode]; // [text, mockup]
  mockupSide: 'left' | 'right';
  progress: MotionValue<number>;
  index: number;
}) {
  // 7 total items: 1 header + 6 features
  const step = 1 / 7;
  const timelineIndex = index + 1; // Feature 0 is at timeline position 1
  const fadeZone = step * 0.2; // Crossfade takes 40% of the step, 60% is pure rest

  const inStart = timelineIndex * step - fadeZone;
  const inEnd = timelineIndex * step + fadeZone;
  
  // If it's the last item (index 5), it never fades out (it stays on screen until you scroll past the 700vh container)
  const outStart = (timelineIndex + 1) * step - fadeZone;
  const outEnd = (timelineIndex + 1) * step + fadeZone;

  // The entire row slides up from bottom, rests, then slides up to exit
  const yInputs = [inStart, inEnd, outStart, outEnd];
  const yOutputs = ["15vh", "0vh", "0vh", "-15vh"];
  
  const opacityInputs = [inStart, inEnd, outStart, outEnd];
  const opacityOutputs = [0, 1, 1, 0];

  const rowY = useTransform(progress, (v) => transform(yInputs, yOutputs)(v));
  const rowOpacity = useTransform(progress, (v) => transform(opacityInputs, opacityOutputs)(v));

  // Horizontal slide-in for text and mockup
  const textDir = mockupSide === 'left' ? 1 : -1;
  
  const textXInputs = [inStart, inEnd, outStart, outEnd];
  const textXOutputs = [textDir * 20, 0, 0, -textDir * 20];
  
  const mockupXInputs = [inStart, inEnd, outStart, outEnd];
  const mockupXOutputs = [-textDir * 20, 0, 0, textDir * 20];
  
  const mockupScaleInputs = [inStart, inEnd, outStart, outEnd];
  const mockupScaleOutputs = [0.95, 1, 1, 0.95];

  const textX = useTransform(progress, (v) => transform(textXInputs, textXOutputs)(v));
  const mockupX = useTransform(progress, (v) => transform(mockupXInputs, mockupXOutputs)(v));
  const mockupScale = useTransform(progress, (v) => transform(mockupScaleInputs, mockupScaleOutputs)(v));

  // Disable pointer events when not fully in focus to prevent blocking layers
  const pointerEvents = useTransform(progress, (v) => (v > inStart + fadeZone && v < (index === 5 ? 1 : outStart - fadeZone)) ? "auto" : "none");

  const [isActive, setIsActive] = useState(false);
  
  useMotionValueEvent(progress, "change", (latest) => {
    // Only mount if within visible range with a small buffer.
    const active = latest >= inStart - fadeZone && latest <= outEnd + fadeZone;
    if (active !== isActive) {
      setIsActive(active);
    }
  });

  const textContent = (
    <motion.div style={{ x: textX }} className={mockupSide === 'left' ? 'order-1 md:order-2' : ''}>
      {isActive ? children[0] : null}
    </motion.div>
  );

  const mockupContent = (
    <motion.div
      style={{ x: mockupX, scale: mockupScale }}
      className={`border-tech bg-white/[0.02] aspect-video rounded-lg relative ${mockupSide === 'left' ? 'p-8' : 'p-4 md:p-8'} flex items-center justify-center overflow-hidden ${mockupSide === 'left' ? 'order-2 md:order-1' : ''}`}
    >
      {isActive ? children[1] : null}
    </motion.div>
  );

  return (
    <motion.div 
      style={{ y: rowY, opacity: rowOpacity, pointerEvents: pointerEvents as any }}
      className="absolute inset-0 flex items-center justify-center w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-6xl w-full px-8 md:px-16">
        {mockupSide === 'left' ? (
          <>
            {mockupContent}
            {textContent}
          </>
        ) : (
          <>
            {textContent}
            {mockupContent}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Section header with scroll reveal ───────────────────────────
function SectionHeader({ progress }: { progress: MotionValue<number> }) {
  const step = 1 / 7;
  const fadeZone = step * 0.2;
  
  // Header is timeline index 0. Fades out at boundary 1.
  const outStart = 1 * step - fadeZone;
  const outEnd = 1 * step + fadeZone;
  
  const opacity = useTransform(progress, (v) => transform([outStart, outEnd], [1, 0])(v));
  const y = useTransform(progress, (v) => transform([outStart, outEnd], [0, -50])(v));
  const pointerEvents = useTransform(progress, (v) => v < outStart ? "auto" : "none");

  return (
    <motion.div style={{ opacity, y, pointerEvents: pointerEvents as any }} className="absolute inset-0 flex flex-col items-center justify-center w-full px-8 md:px-16 z-20">
      <div className="max-w-6xl w-full">
        <div className="mono-accent mb-4">FEATURE_DEEP_DIVE // 02</div>
        <h2 className="font-headline-lg text-on-surface text-glow text-5xl md:text-6xl mb-6">Every feature.<br/>Fully explained.</h2>
        <p className="font-body-lg text-on-surface-variant max-w-md">Six modules built to work together. Here's exactly what each one does.</p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export const FeatureDeepDiveSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track the scroll of the entire 700vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="w-full relative h-[700vh] border-y border-white/10 bg-background">
      {/* Sticky container that stays pinned for the 700vh duration */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Background ambience */}
        <div className="tech-grid grid-subdivision opacity-20 absolute inset-0 pointer-events-none z-0"></div>
        <div className="crosshair top-0 left-1/4 absolute pointer-events-none z-0"></div>

        {/* Introduction title card */}
        <SectionHeader progress={scrollYProgress} />

        {/* Feature stack (all position: absolute on top of each other) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* 1. TASKS & SPACES (Mockup LEFT) */}
          <FeatureRow progress={scrollYProgress} index={0} mockupSide="left">
            <>
              <div className="mono-accent mb-4">I-01 // TASKS &amp; SPACES</div>
              <h3 className="font-headline-lg text-on-surface mb-6 text-glow">Capture instantly.<br/>Execute deeply.</h3>
              <div className="font-body-lg text-on-surface-variant space-y-4 mb-8">
                <p>Most task managers tell you what to do but abandon you when it's time to actually do it. Tasks &amp; Spaces is different. Organize your life into Spaces, attach files and notes to any task, and launch directly into a Focus session — all without switching apps.</p>
                <ul className="space-y-2 text-[15px]">
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Unlimited Spaces and tasks</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Priority flagging with smart sorting</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Smart due dates — Today, Tomorrow, Overdue</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> File, image, and link attachments per task</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Screenshot paste with Ctrl+V</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> 1-click launch into Focus Mode</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Completed tasks stay visible for 2 hours</li>
                </ul>
              </div>
              <div className="border-l-2 border-white/20 pl-4 mono-accent text-white/60 italic">"3 seconds from scattered thought to focused execution."</div>
            </>
            <TasksMockup />
          </FeatureRow>

          {/* 2. FOCUS MODE (Mockup RIGHT) */}
          <FeatureRow progress={scrollYProgress} index={1} mockupSide="right">
            <>
              <div className="mono-accent mb-4">T-02 // FOCUS MODE</div>
              <h3 className="font-headline-lg text-on-surface mb-6 text-glow">One task.<br/>One timer.<br/>Zero distractions.</h3>
              <div className="font-body-lg text-on-surface-variant space-y-4 mb-8">
                <p>The Focus Chamber hides the entire app and locks you into one task. Choose your session length, start the timer, and work. When it ends, your session is logged. Simple. Powerful. Rare.</p>
                <ul className="space-y-2 text-[15px]">
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> 25m, 45m, 90m, or custom session lengths</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Full immersive mode — entire UI disappears</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Every session linked to a specific task</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Session history tracked automatically</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> 1-click launch from any task</li>
                </ul>
              </div>
              <div className="border-l-2 border-white/20 pl-4 mono-accent text-white/60 italic">"The average knowledge worker is interrupted every 3 minutes. Focus Mode fixes that."</div>
            </>
            <FocusMockup />
          </FeatureRow>

          {/* 3. NEXUS NOTES (Mockup LEFT) */}
          <FeatureRow progress={scrollYProgress} index={2} mockupSide="left">
            <>
              <div className="mono-accent mb-4">N-03 // NEXUS NOTES</div>
              <h3 className="font-headline-lg text-on-surface mb-6 text-glow">A second brain that<br/>thinks at your speed.</h3>
              <div className="font-body-lg text-on-surface-variant space-y-4 mb-8">
                <p>Nexus opens instantly, auto-saves every keystroke, and never gets in the way of your thinking. Split the screen to write and reference at the same time. Full version history means you have never lost a word.</p>
                <ul className="space-y-2 text-[15px]">
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> 6 note types — Journal, Checklist, Resource, Idea and more</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Slash commands for instant formatting</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Infinite split-screen panes</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Pin notes as read-only reference</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Full version history with 1-click restore</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Template gallery with custom templates</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> PDF and image embedding</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Secure note sharing</li>
                </ul>
              </div>
              <div className="border-l-2 border-white/20 pl-4 mono-accent text-white/60 italic">"Auto-saves every keystroke.<br/>You have never lost a word."</div>
            </>
            <NexusMockup />
          </FeatureRow>

          {/* 4. HABITS (Mockup RIGHT) */}
          <FeatureRow progress={scrollYProgress} index={3} mockupSide="right">
            <>
              <div className="mono-accent mb-4">H-04 // HABITS</div>
              <h3 className="font-headline-lg text-on-surface mb-6 text-glow">Don't break the chain.<br/>Track habits where you work.</h3>
              <div className="font-body-lg text-on-surface-variant space-y-4 mb-8">
                <p>Click a cell to mark a habit done. That is it. The matrix fills with color, your streak grows, and your consistency becomes a visual record you are genuinely motivated to maintain.</p>
                <ul className="space-y-2 text-[15px]">
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Unlimited habits</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Single-click logging — no forms or friction</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Full-month visual matrix</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Live streak counter per habit</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Fire emoji at 3+ day streaks 🔥</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Custom colors per habit</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Drag-and-drop reordering</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> 7-second undo on deletion</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Future dates locked — no cheating</li>
                </ul>
              </div>
              <div className="border-l-2 border-white/20 pl-4 mono-accent text-white/60 italic">"0ms save latency.<br/>Every click is instant."</div>
            </>
            <HabitsMockup />
          </FeatureRow>

          {/* 5. TIMETABLE (Mockup LEFT) */}
          <FeatureRow progress={scrollYProgress} index={4} mockupSide="left">
            <>
              <div className="mono-accent mb-4">C-05 // TIMETABLE</div>
              <h3 className="font-headline-lg text-on-surface mb-6 text-glow">Where your to-do list<br/>meets reality.</h3>
              <div className="font-body-lg text-on-surface-variant space-y-4 mb-8">
                <p>A task list without a schedule is just a wish list. Drag tasks and habits directly onto a 24-hour weekly grid. Built-in conflict detection, category analytics, and a global undo make this the most powerful time-blocking tool you have ever used.</p>
                <ul className="space-y-2 text-[15px]">
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Full 24-hour × 7-day grid</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Drag tasks and habits directly onto the grid</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Search filter in the drag tray</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> 8 color-coded categories</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Real-time conflict detection</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Copy a block to multiple days instantly</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Live Now Indicator at current time</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Global undo — Ctrl+Z / Cmd+Z</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Week summary — total hours per category</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Export full schedule as PNG</li>
                </ul>
              </div>
              <div className="border-l-2 border-white/20 pl-4 mono-accent text-white/60 italic">"The only productivity app with native<br/>Ctrl+Z undo on a time-blocking grid."</div>
            </>
            <TimetableMockup />
          </FeatureRow>

          {/* 6. WORKSPACE (Mockup RIGHT) */}
          <FeatureRow progress={scrollYProgress} index={5} mockupSide="right">
            <>
              <div className="mono-accent mb-4">W-06 // WORKSPACE</div>
              <h3 className="font-headline-lg text-on-surface mb-6 text-glow">Your team.<br/>Your projects.<br/>One place.</h3>
              <div className="font-body-lg text-on-surface-variant space-y-4 mb-8">
                <p>Create a project, invite your team by email, and start collaborating immediately. Tasks, docs, chat, and files all live in one place. See who is online in real time. Everything syncs live across every member.</p>
                <ul className="space-y-2 text-[15px]">
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Unlimited projects</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Email invitations with 7-day expiry</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Three roles — Owner, Member, Viewer</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Real-time presence — see who is online</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Shared tasks synced live across all members</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Project tasks appear in your personal list</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Collaborative docs powered by Nexus editor</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Real-time project chat</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Full nested file manager</li>
                  <li className="flex items-start gap-2"><span className="text-white">◆</span> Role management and project settings</li>
                </ul>
              </div>
              <div className="border-l-2 border-white/20 pl-4 mono-accent text-white/60 italic">"Tasks assigned in Workspace appear in your<br/>personal task list automatically."</div>
            </>
            <WorkspaceMockup />
          </FeatureRow>
        </div>
      </div>
    </section>
  );
};
