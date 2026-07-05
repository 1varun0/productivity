import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image as ImageIcon, Link2, Download, Tag, Flag } from 'lucide-react';
import { NexusBlocksIcon } from '@/components/icons/NexusBlocksIcon';
import type { Task } from '@/features/tasks/hooks/useTasks';
import type { Attachment } from '@/features/tasks/hooks/useAttachments';

interface ContextualPanelsProps {
  task?: Task;
  sessionCaptures?: string[];
  attachments?: Attachment[];
  getFileUrl?: (path: string) => Promise<string | null>;
  onParkThought?: (thoughtText: string) => Promise<void>;
  onImageClick?: (url: string) => void;
  isReflecting?: boolean;
  isConfirmingExit?: boolean;
  onOpenNexus?: () => void;
}

export function ContextualPanels({
  task,
  sessionCaptures = [],
  attachments = [],
  getFileUrl,
  onParkThought,
  onImageClick,
  isReflecting,
  isConfirmingExit,
  onOpenNexus
}: ContextualPanelsProps) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [quickCaptureText, setQuickCaptureText] = useState('');
  
  const leftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hide panels immediately if reflecting or confirming exit
    if (isReflecting || isConfirmingExit) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const ZONE_WIDTH = 250;
      const DELAY_MS = 150;

      // Check Left Zone
      if (e.clientX < ZONE_WIDTH) {
        if (!showLeft && !leftTimeoutRef.current) {
          leftTimeoutRef.current = setTimeout(() => setShowLeft(true), DELAY_MS);
        }
      } else {
        if (leftTimeoutRef.current) {
          clearTimeout(leftTimeoutRef.current);
          leftTimeoutRef.current = null;
        }
        setShowLeft(false);
      }

      // Check Right Zone
      if (e.clientX > window.innerWidth - ZONE_WIDTH) {
        if (!showRight && !rightTimeoutRef.current) {
          rightTimeoutRef.current = setTimeout(() => setShowRight(true), DELAY_MS);
        }
      } else {
        if (rightTimeoutRef.current) {
          clearTimeout(rightTimeoutRef.current);
          rightTimeoutRef.current = null;
        }
        setShowRight(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (leftTimeoutRef.current) clearTimeout(leftTimeoutRef.current);
      if (rightTimeoutRef.current) clearTimeout(rightTimeoutRef.current);
    };
  }, [showLeft, showRight, isReflecting, isConfirmingExit]);

  const handleQuickCaptureSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // stop propagation to prevent SPACE and ESC global shortcuts from firing while typing
    e.stopPropagation();
    
    if (e.key === 'Escape') {
      e.currentTarget.blur();
      setShowLeft(false); // smoothly fade out if user hits escape inside input
      return;
    }

    if (e.key === 'Enter' && quickCaptureText.trim() && onParkThought) {
      await onParkThought(quickCaptureText);
      setQuickCaptureText('');
    }
  };

  const handleAttachmentClick = async (attachment: Attachment) => {
    if (attachment.type === 'link' && attachment.url) {
      window.open(attachment.url, '_blank');
      return;
    }
    if (attachment.storage_path && getFileUrl) {
      const url = await getFileUrl(attachment.storage_path);
      if (url) {
        if (attachment.type === 'image' && onImageClick) {
          onImageClick(url);
        } else {
          window.open(url, '_blank');
        }
      }
    }
  };

  const panelVariants = {
    hidden: (direction: 'left' | 'right') => ({
      opacity: 0,
      x: direction === 'left' ? -20 : 20,
      filter: 'blur(8px)',
    }),
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
    },
    exit: (direction: 'left' | 'right') => ({
      opacity: 0,
      x: direction === 'left' ? -15 : 15,
      filter: 'blur(4px)',
      transition: { duration: 0.25, ease: 'easeOut' as const }
    })
  };

  const isDeepThinking = !task || task.id === 'deep-thinking';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* LEFT PANEL: Task Details & Notes */}
      <AnimatePresence>
        {showLeft && (
          <motion.div
            custom="left"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-8 top-16 bottom-16 w-[340px] pointer-events-auto flex flex-col bg-black/40 backdrop-blur-2xl border border-[#00e5ff]/10 rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 mb-6">
                <h2 className="text-xl font-medium tracking-tight text-white mb-2 drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                  {isDeepThinking ? 'Deep Thinking Session' : task.title}
                </h2>
                {!isDeepThinking && (
                  <div className="flex items-center gap-2 mb-4">
                    {task.is_priority && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest font-semibold shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                        <Flag size={10} strokeWidth={2.5} /> Priority
                      </span>
                    )}
                    {task.list_id && (
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest">
                        <Tag size={10} /> Tagged
                      </span>
                    )}
                  </div>
                )}
                {!isDeepThinking && task.description && (
                  <p className="text-sm text-white/60 leading-relaxed font-light">
                    {task.description}
                  </p>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-none flex flex-col gap-3">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#00e5ff]/60 font-medium mb-1 sticky top-0 bg-black/40 backdrop-blur-md py-1 z-10">
                  Session Thoughts
                </h3>
                {sessionCaptures.length === 0 ? (
                  <p className="text-[13px] text-white/30 font-light italic">No thoughts captured yet.</p>
                ) : (
                  sessionCaptures.map((capture, idx) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-[13px] text-white/80 font-light leading-relaxed">
                      {capture}
                    </div>
                  ))
                )}
              </div>

              <div className="flex-shrink-0 mt-4 pt-4 border-t border-white/5">
                <input
                  type="text"
                  placeholder="Capture a thought... (Press Enter)"
                  value={quickCaptureText}
                  onChange={(e) => setQuickCaptureText(e.target.value)}
                  onKeyDown={handleQuickCaptureSubmit}
                  className="w-full bg-black/40 border border-[#00e5ff]/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00e5ff]/60 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all duration-300 font-light"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT PANEL: Nexus & Attachments */}
      <AnimatePresence>
        {showRight && (
          <motion.div
            custom="right"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-8 top-16 bottom-16 w-[340px] pointer-events-auto flex flex-col bg-black/40 backdrop-blur-2xl border border-[#00e5ff]/10 rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#00e5ff]/60 font-medium">
                Nexus
              </h3>
            </div>
            
            <button
              onClick={onOpenNexus}
              className="w-full flex flex-col items-center justify-center py-5 mb-6 bg-white/[0.02] hover:bg-[#00e5ff]/10 border border-white/5 hover:border-[#00e5ff]/30 rounded-2xl transition-all duration-300 group shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 border border-white/10 group-hover:border-[#00e5ff]/40">
                <NexusBlocksIcon size={18} className="text-white/60 group-hover:text-[#00e5ff] transition-colors" />
              </div>
              <span className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">Access Nexus</span>
              <span className="text-[10px] text-white/30 group-hover:text-[#00e5ff]/60 mt-1 uppercase tracking-widest transition-colors">Open Knowledge Base</span>
            </button>

            {attachments.length > 0 && (
              <>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#00e5ff]/60 mb-3 font-medium">
                  Attachments & Resources
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-none flex flex-col gap-3">
              {attachments.map((attachment) => (
                <button
                  key={attachment.id}
                  onClick={() => handleAttachmentClick(attachment)}
                  className="flex items-center gap-3 w-full bg-white/[0.02] hover:bg-[#00e5ff]/5 border border-white/5 hover:border-[#00e5ff]/30 rounded-2xl p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,229,255,0.1)] group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/30 border border-white/5 group-hover:border-[#00e5ff]/20 transition-colors shrink-0">
                    {attachment.type === 'image' ? (
                      <ImageIcon size={16} className="text-[#00e5ff]/60 group-hover:text-[#00e5ff]" />
                    ) : attachment.type === 'link' ? (
                      <Link2 size={16} className="text-purple-400/60 group-hover:text-purple-400" />
                    ) : attachment.name.endsWith('.pdf') ? (
                      <FileText size={16} className="text-red-400/60 group-hover:text-red-400" />
                    ) : (
                      <Download size={16} className="text-emerald-400/60 group-hover:text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[13px] text-white/80 font-medium truncate group-hover:text-white transition-colors">
                      {attachment.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 truncate mt-0.5">
                      {attachment.type} {attachment.size ? `• ${(attachment.size / 1024).toFixed(0)}kb` : ''}
                    </p>
                  </div>
                </button>
              ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
