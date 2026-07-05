import { motion, AnimatePresence } from 'framer-motion';
import { TaskList } from '@/features/tasks/components/TaskList';
import { MentalInboxPanel } from '@/features/inbox/components/MentalInboxPanel';
import { SpacesList } from '@/features/lists/components/SpacesList';
import { useStore } from '@/store/useStore';
import { TaskDetailPanel } from '@/features/tasks/components/TaskDetailPanel';
import { useLists } from '@/features/lists/hooks/useLists';
import { FocusRecoveryBanner } from '@/features/timer/components/FocusRecoveryBanner';
import { ArrowDownUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '@/components/ScrollReveal';

export type SortOption = 'recent' | 'due';

export function TodayPage() {
  const activeListId = useStore(state => state.activeListId);
  const openCaptureModal = useStore(state => state.openCaptureModal);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { lists } = useLists();
  const activeList = lists?.find(l => l.id === activeListId);



  return (
    <div className="h-full relative">
      <AnimatePresence mode="wait">
        <motion.div 
          key="dashboard"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.96 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-16 pb-20 pt-8 px-2"
        >
          {/* Environmental Texture */}
          <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.03] via-background to-background pointer-events-none z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 relative z-10 pt-4">
            <div className="lg:col-span-8 space-y-14">
              <ScrollReveal delay={0.1}>
                <FocusRecoveryBanner />
              </ScrollReveal>
              <ScrollReveal delay={0.25}>
                <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2 uppercase">
                      {activeList ? (
                        <>
                          {activeList.icon && <span>{activeList.icon}</span>}
                          {activeList.name}
                        </>
                      ) : 'Overview'}
                    </h2>
                    <button 
                      onClick={openCaptureModal}
                      className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <Plus size={10} />
                      Capture
                      <span className="opacity-0 group-hover:opacity-60 transition-opacity ml-1 bg-card border border-border/40 px-1 py-0.5 rounded shadow-sm leading-none font-sans lowercase">⌘K</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground/60 hover:text-foreground transition-colors group"
                    >
                      <ArrowDownUp size={10} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                      {sortOption === 'recent' ? 'Recently Added' : 'Due Date'}
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -2, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right-0 top-full mt-2 w-36 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8)] rounded-lg py-1.5 z-50 overflow-hidden flex flex-col ring-1 ring-white/5"
                          >
                            <button
                              onClick={() => { setSortOption('recent'); setIsDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-[10px] tracking-wider uppercase font-medium transition-colors ${sortOption === 'recent' ? 'text-white/90 bg-white/5' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'}`}
                            >
                              Recently Added
                            </button>
                            <button
                              onClick={() => { setSortOption('due'); setIsDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-[10px] tracking-wider uppercase font-medium transition-colors ${sortOption === 'due' ? 'text-white/90 bg-white/5' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'}`}
                            >
                              Due Date
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  </div>
                </div>
                <TaskList sortOption={sortOption} />
                </section>
              </ScrollReveal>
            </div>
            
            <div className="lg:col-span-4 space-y-14 mt-8 lg:mt-0">
              <ScrollReveal delay={0.4}>
                <MentalInboxPanel />
              </ScrollReveal>
              <ScrollReveal delay={0.55}>
                <SpacesList />
              </ScrollReveal>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <TaskDetailPanel />
    </div>
  );
}
