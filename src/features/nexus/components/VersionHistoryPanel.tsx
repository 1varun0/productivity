import { useEffect, useState } from 'react';
import { Clock, Loader2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '../store/useNexusStore';
import type { NoteVersion } from '../types';

interface VersionHistoryPanelProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
  onPreview: (version: NoteVersion) => void;
}

export function VersionHistoryPanel({ noteId, isOpen, onClose, onPreview }: VersionHistoryPanelProps) {
  const { fetchNoteVersions } = useNexusStore();
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && noteId) {
      loadVersions();
    }
  }, [isOpen, noteId]);

  const loadVersions = async () => {
    setIsLoading(true);
    const data = await fetchNoteVersions(noteId);
    setVersions(data);
    setIsLoading(false);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 172800) return 'Yesterday';
    if (diffInSeconds < 604800) return 'Last week';
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getChangesText = (_version: NoteVersion, index: number) => {
    if (index === versions.length - 1) return 'Created note';
    
    // Simple heuristic for V1
    return 'Saved changes';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 right-0 bottom-0 w-80 bg-[#161616]/95 backdrop-blur-3xl border-l border-white/5 shadow-2xl flex flex-col z-40"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
              <Clock size={16} className="text-[#c5c0ff]" />
              Version History
            </h3>
            <button
              onClick={onClose}
              className="text-[#474553] hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-white/30">
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center text-[#474553] text-sm py-10">
                No versions found.
              </div>
            ) : (
              versions.map((version, index) => (
                <div 
                  key={version.id}
                  className="group relative flex flex-col gap-1 p-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredVersion(version.id)}
                  onMouseLeave={() => setHoveredVersion(null)}
                  onClick={() => onPreview(version)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/90 font-medium">
                      {formatRelativeTime(version.created_at)}
                    </span>
                    
                    <AnimatePresence>
                      {hoveredVersion === version.id && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="px-2 py-1 bg-[#c5c0ff]/10 text-[#c5c0ff] hover:bg-[#c5c0ff]/20 rounded-lg text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw size={10} />
                          Preview
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-[#474553]">
                    {getChangesText(version, index)}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
