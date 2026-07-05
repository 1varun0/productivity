import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomBar } from './BottomBar';
import { useStore } from '@/store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import { GlobalMentalCapture } from '@/features/inbox/components/GlobalMentalCapture';
import { CommandPalette } from '@/components/CommandPalette';
import { FocusEnvironment } from '@/features/timer/components/FocusEnvironment';

export function AppLayout({ children }: { children: ReactNode }) {
  const focusState = useStore((state) => state.focusState);
  const isRecoveringSession = useStore((state) => state.isRecoveringSession);
  const isFocusing = focusState !== 'idle';
  const showDashboard = focusState === 'idle' || isRecoveringSession;
  const location = useLocation();
  const isNexus = location.pathname === '/app/nexus';
  const isTimetable = location.pathname.startsWith('/app/timetable');
  const isWorkspace = location.pathname.startsWith('/app/workspace');
  const isFullBleed = isTimetable || isNexus || isWorkspace;

  return (
    <div className={`flex h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary/20 font-sans transition-colors duration-[1500ms] ${isFocusing ? '!bg-[#050505]' : ''}`}>
      <GlobalMentalCapture />
      <CommandPalette />
      <AnimatePresence>
        {!isFocusing && <Sidebar />}
      </AnimatePresence>
      <div className="flex flex-col flex-1 overflow-hidden relative bg-card/30">
        {!isFocusing && <div className="absolute inset-y-0 left-0 w-[1px] bg-border/40 z-20 hidden md:block" />}
        <AnimatePresence>
          {!isFocusing && !isTimetable && !isWorkspace && <Topbar />}
        </AnimatePresence>
        <main className={`flex-1 flex flex-col scroll-smooth relative z-0 ${isFullBleed ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-8 lg:p-12 pb-24 md:pb-8'}`}>
          <div 
            className={`w-full h-full flex-1 flex flex-col transition-all duration-[1200ms] ease-in-out ${isFullBleed ? '' : 'mx-auto max-w-4xl'} ${!showDashboard ? 'opacity-0 scale-[0.96] blur-[8px] pointer-events-none' : 'opacity-100 scale-100 blur-none'}`}
          >
            {children}
          </div>
        </main>
        <AnimatePresence>
          {!isFocusing && !isTimetable && !isWorkspace && <BottomBar />}
        </AnimatePresence>

        <AnimatePresence>
          {!showDashboard && (
            <motion.div
              key="focus-env-global"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
            >
              <FocusEnvironment />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
