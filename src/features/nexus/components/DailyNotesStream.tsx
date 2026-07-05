import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Image as ImageIcon } from 'lucide-react';
import type { Note } from '../types';

interface DailyNotesStreamProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onCreateDailyNote: (title: string, date: string) => void;
}

export function DailyNotesStream({ notes, onEditNote, onCreateDailyNote }: DailyNotesStreamProps) {
  // Filter for daily notes
  const dailyNotes = useMemo(() => {
    return notes.filter(n => n.type === 'daily' && n.daily_date).sort((a, b) => {
      // Sort by daily_date descending
      return new Date(b.daily_date!).getTime() - new Date(a.daily_date!).getTime();
    });
  }, [notes]);

  // Determine if we need an optimistic "Today" card
  const todayDate = new Date();
  const todayDateStr = todayDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const hasTodayNote = dailyNotes.some(n => n.daily_date === todayDateStr);

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (dateStr === todayDateStr) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const generateTodayTitle = () => {
    return `Today — ${todayDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col relative pb-32">
      <div className="sticky top-0 bg-gradient-to-b from-[#0e0e0e] via-[#0e0e0e]/90 to-transparent pt-8 pb-12 z-20 pointer-events-none">
        <h2 className="text-[#e5e2e1] font-mono text-xl tracking-tight opacity-90 drop-shadow-md">
          Journal Stream
        </h2>
        <p className="text-[#928f9e] text-xs font-mono mt-2 opacity-60">A quiet stream of evolving thought</p>
      </div>

      <div className="flex-1 flex flex-col gap-12 relative">
        {/* Timeline Line */}
        <div className="absolute left-[27px] top-4 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent z-0" />

        {!hasTodayNote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex gap-6 group cursor-pointer"
            onClick={() => onCreateDailyNote(generateTodayTitle(), todayDateStr)}
          >
            {/* Timeline Node */}
            <div className="mt-1.5 w-14 flex justify-end shrink-0 relative">
              <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center z-10">
                <div className="w-1 h-1 rounded-full bg-primary" />
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs font-medium text-primary mb-3">Today</div>
              <div className="bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all duration-300 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center min-h-[140px] opacity-70 hover:opacity-100 group-hover:bg-primary/[0.02]">
                <Plus size={24} className="text-[#928f9e] group-hover:text-primary transition-colors mb-2" />
                <span className="text-[#928f9e] text-sm font-mono group-hover:text-[#c8c4d5] transition-colors">Start today's capture...</span>
              </div>
            </div>
          </motion.div>
        )}

        {dailyNotes.map((note, idx) => {
          const isToday = note.daily_date === todayDateStr;
          const snippet = note.content ? note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '') : 'Empty entry...';
          const hasAttachments = false; // Add actual logic if notes store attachments refs
          
          // Last updated indicator
          const isRecentlyUpdated = new Date().getTime() - new Date(note.updated_at).getTime() < 1000 * 60 * 60; // 1 hour

          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative z-10 flex gap-6 group cursor-pointer"
              onClick={() => onEditNote(note)}
            >
              {/* Timeline Node */}
              <div className="mt-1.5 w-14 flex justify-end shrink-0 relative">
                <div className={`w-3 h-3 rounded-full flex items-center justify-center z-10 ${
                  isToday 
                    ? 'bg-primary/20 border border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]' 
                    : 'bg-[#1e1e1e] border border-[#2a2a2a]'
                }`}>
                  <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-primary' : 'bg-[#474553]'}`} />
                </div>
              </div>

              <div className="flex-1">
                <div className={`text-xs font-medium mb-3 flex items-center gap-2 ${isToday ? 'text-primary' : 'text-[#928f9e]'}`}>
                  {getDayLabel(note.daily_date!)}
                  {isRecentlyUpdated && <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" title="Updated recently" />}
                </div>

                <div className={`bg-[#121212]/80 border transition-all duration-300 rounded-2xl p-6 backdrop-blur-sm shadow-lg group-hover:-translate-y-0.5 group-hover:shadow-2xl ${
                  isToday 
                    ? 'border-primary/20 hover:border-primary/40 shadow-[0_0_30px_rgba(var(--primary-rgb),0.03)]' 
                    : 'border-white/5 hover:border-white/10'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[#e5e2e1] text-lg font-medium">{note.title}</h3>
                    <div className="flex items-center gap-3 text-[#474553]">
                      {hasAttachments && <ImageIcon size={14} />}
                      <span className="text-[10px] uppercase tracking-wider">{new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="text-[#928f9e] text-sm leading-relaxed whitespace-pre-wrap font-mono opacity-80">
                    {snippet}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
