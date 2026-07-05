import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, CheckCircle2, Play, Plus, Zap, Folder, Calendar, Activity, LayoutGrid, Briefcase } from 'lucide-react';
import { NexusBlocksIcon } from '@/components/icons/NexusBlocksIcon';
import { useCommandPaletteStore } from '@/store/useCommandPaletteStore';
import { useNexusStore } from '@/features/nexus/store/useNexusStore';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useStore } from '@/store/useStore';
import { CommandItem } from './CommandItem';

export function CommandPalette() {
  const { isOpen, searchQuery, setSearchQuery, closePalette } = useCommandPaletteStore();
  const { notes, collections, fetchNotes, fetchCollections, triggerNewNote } = useNexusStore();
  const { tasks = [] } = useTasks();
  const { openCaptureModal, openFocusSetup } = useStore();
  const navigate = useNavigate();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch data globally when palette is opened if not already loaded
  useEffect(() => {
    if (isOpen) {
      if (notes.length === 0) fetchNotes();
      if (collections.length === 0) fetchCollections();
    }
  }, [isOpen, notes.length, collections.length, fetchNotes, fetchCollections]);

  // Define static quick actions
  const staticActions = useMemo(() => [
    {
      id: 'action-quick-capture',
      title: 'Quick Capture',
      subtitle: 'Open the global mental capture inbox',
      icon: <Zap size={14} />,
      type: 'Actions',
      onSelect: () => {
        closePalette();
        openCaptureModal();
      }
    },
    {
      id: 'action-new-note',
      title: 'New Note',
      subtitle: 'Create a new note in Nexus',
      icon: <Plus size={14} />,
      type: 'Actions',
      onSelect: () => {
        closePalette();
        navigate('/app/nexus');
        // Small delay to ensure route transition is smooth before opening modal
        setTimeout(() => {
          triggerNewNote();
        }, 50);
      }
    },
    {
      id: 'action-focus',
      title: 'Start Focus Session',
      subtitle: 'Enter the Focus Chamber',
      icon: <Play size={14} />,
      type: 'Actions',
      onSelect: () => {
        closePalette();
        navigate('/');
        setTimeout(() => {
          openFocusSetup();
        }, 50);
      }
    },
{
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Overview & Task Manager',
      icon: <LayoutGrid size={14} />,
      type: 'Navigation',
      onSelect: () => {
        closePalette();
        navigate('/');
      }
    },
    {
      id: 'nav-timetable',
      title: 'Go to Timetable',
      subtitle: 'Daily schedule and time blocks',
      icon: <Calendar size={14} />,
      type: 'Navigation',
      onSelect: () => {
        closePalette();
        navigate('/app/timetable');
      }
    },
    {
      id: 'nav-habits',
      title: 'Go to Habits',
      subtitle: 'Track your daily routines',
      icon: <Activity size={14} />,
      type: 'Navigation',
      onSelect: () => {
        closePalette();
        navigate('/app/habits');
      }
    },
    {
      id: 'nav-nexus',
      title: 'Open Nexus',
      subtitle: 'Your personal knowledge base',
      icon: <NexusBlocksIcon size={14} />,
      type: 'Navigation',
      onSelect: () => {
        closePalette();
        navigate('/app/nexus');
      }
    },
    {
      id: 'nav-workspace',
      title: 'Open Workspace',
      subtitle: 'Manage active projects and files',
      icon: <Briefcase size={14} />,
      type: 'Navigation',
      onSelect: () => {
        closePalette();
        navigate('/app/workspace');
      }
    }
  ], [closePalette, navigate, openCaptureModal, openFocusSetup, triggerNewNote]);

  // Aggregate and filter all searchable items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    
    // Map external data to common command format
    const mappedNotes = notes.map(n => ({
      id: `note-${n.id}`,
      title: n.title || 'Untitled Note',
      subtitle: n.content ? n.content.substring(0, 40) + '...' : 'Empty note',
      icon: <FileText size={14} />,
      type: 'Notes',
      onSelect: () => {
        closePalette();
        navigate('/app/nexus');
      }
    }));

    const mappedCollections = collections.map(c => ({
      id: `collection-${c.id}`,
      title: c.name,
      subtitle: 'Collection',
      icon: <Folder size={14} />,
      type: 'Collections',
      onSelect: () => {
        closePalette();
        navigate('/app/nexus');
      }
    }));

    const mappedTasks = tasks.map(t => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: t.completed ? 'Completed Task' : 'Active Task',
      icon: <CheckCircle2 size={14} />,
      type: 'Tasks',
      onSelect: () => {
        closePalette();
        navigate('/');
      }
    }));

    const allItems = [
      ...staticActions,
      ...mappedNotes,
      ...mappedCollections,
      ...mappedTasks
    ];

    if (!q) {
      // Default view: just show static actions + a few recent items
      return [
        ...staticActions,
        ...mappedNotes.slice(0, 3),
        ...mappedCollections.slice(0, 2)
      ];
    }

    // Fuzzy matching (simple inclusion for now)
    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.subtitle.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  }, [searchQuery, notes, collections, tasks, staticActions, navigate, closePalette]);

  // Group items for rendering
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    filteredItems.forEach(item => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Keyboard navigation logic
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          filteredItems[activeIndex].onSelect();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredItems, closePalette]);

  // Reset active index on search change
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  // Ensure active item is scrolled into view
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const activeElement = containerRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={closePalette}
          />
          
          {/* Command Palette Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] pointer-events-none flex items-start justify-center pt-[15vh] px-4"
          >
            <div 
              className="w-full max-w-2xl bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[70vh] shadow-[0_0_50px_rgba(255,255,255,0.03)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Search Header */}
              <div className="flex items-center px-4 py-4 border-b border-white/5 bg-white/[0.02]">
                <Search size={18} className="text-[#928f9e] mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  placeholder="Type a command or search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[#e5e2e1] text-base placeholder:text-[#928f9e]/50 font-medium"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-1 rounded bg-white/5 border border-white/10 text-[#928f9e] shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Results List */}
              <div 
                ref={containerRef}
                className="flex-1 overflow-y-auto p-2 custom-scrollbar"
              >
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-[#928f9e] text-sm">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  Object.entries(groupedItems).map(([groupType, items]) => (
                    <div key={groupType} className="mb-4 last:mb-0">
                      <div className="px-3 py-2 text-[10px] font-bold text-[#928f9e]/60 tracking-wider uppercase">
                        {groupType}
                      </div>
                      <div className="space-y-0.5">
                        {items.map(item => {
                          const index = filteredItems.findIndex(i => i.id === item.id);
                          return (
                            <div key={item.id} data-index={index}>
                              <CommandItem
                                icon={item.icon}
                                title={item.title}
                                subtitle={item.subtitle}
                                isActive={index === activeIndex}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={item.onSelect}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="font-mono text-[9px] px-1.5 rounded bg-white/10 text-white/70">↑</kbd>
                    <kbd className="font-mono text-[9px] px-1.5 rounded bg-white/10 text-white/70">↓</kbd>
                    <span className="text-[10px] text-[#928f9e]">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="font-mono text-[9px] px-1.5 rounded bg-white/10 text-white/70">↵</kbd>
                    <span className="text-[10px] text-[#928f9e]">Execute</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#928f9e] font-medium tracking-wide opacity-50">
                  COMMAND PALETTE
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
