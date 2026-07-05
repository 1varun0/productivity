import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, FileText, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { Task } from '@/features/tasks/hooks/useTasks';
import type { Attachment } from '@/features/tasks/hooks/useAttachments';
import { EASING, DURATIONS } from './theme/motion';
import { AMBIENT_STYLES } from './theme/ambientStyles';

interface FloatingTaskPanelProps {
  task: Task | undefined;
  attachments: Attachment[] | undefined;
  getFileUrl: (path: string) => Promise<string | null>;
  onImageClick: (url: string) => void;
}

function AttachmentPill({ attachment, getFileUrl, onImageClick }: { attachment: Attachment, getFileUrl: any, onImageClick: any }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (attachment.type === 'image' && attachment.storage_path) {
      getFileUrl(attachment.storage_path).then((url: string | null) => {
        if (url) setSignedUrl(url);
      });
    }
  }, [attachment, getFileUrl]);

  const handleClick = async () => {
    if (attachment.type === 'image' && signedUrl) {
      onImageClick(signedUrl);
      return;
    }
    if (attachment.type === 'link' && attachment.url) {
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (attachment.storage_path && !isOpening) {
      setIsOpening(true);
      try {
        const url = await getFileUrl(attachment.storage_path);
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      } finally {
        setIsOpening(false);
      }
    }
  };

  const isPDF = attachment.name.toLowerCase().endsWith('.pdf');

  return (
    <button 
      onClick={handleClick}
      disabled={isOpening}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.04] border border-white/[0.03] transition-all group ${isOpening ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
    >
      {isOpening ? <Loader2 size={10} className={`${AMBIENT_STYLES.textMuted} animate-spin`} /> : 
       attachment.type === 'image' ? <ImageIcon size={10} className={`${AMBIENT_STYLES.textMuted} group-hover:text-white/60`} /> : 
       attachment.type === 'link' ? <LinkIcon size={10} className={`${AMBIENT_STYLES.textMuted} group-hover:text-white/60`} /> : 
       isPDF ? <FileText size={10} className={`${AMBIENT_STYLES.textMuted} group-hover:text-white/60`} /> : 
       <Paperclip size={10} className={`${AMBIENT_STYLES.textMuted} group-hover:text-white/60`} />}
      <span className="text-[10px] font-light truncate text-white/40 group-hover:text-white/70 transition-colors max-w-[150px]">
        {attachment.name}
      </span>
    </button>
  );
}

export function FloatingTaskPanel({ task, attachments, getFileUrl, onImageClick }: FloatingTaskPanelProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!task || task.id === 'deep-thinking') return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: DURATIONS.slow, ease: EASING.cinematic }}
      className="absolute left-16 top-1/2 -translate-y-1/2 z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        animate={{
          opacity: isHovered ? 1 : 0.15,
          scale: isHovered ? 1 : 0.98,
          filter: isHovered ? 'blur(0px)' : 'blur(1px)',
        }}
        transition={{ duration: DURATIONS.fast, ease: EASING.softExpand }}
        className={`w-[300px] p-8 rounded-3xl ${isHovered ? AMBIENT_STYLES.glassPanelActive : AMBIENT_STYLES.glassPanelIdle} flex flex-col gap-6 group`}
      >
        <div className="space-y-2">
          <motion.p 
            animate={{ opacity: isHovered ? 0.4 : 0.2 }}
            className="text-[9px] font-semibold tracking-[0.3em] uppercase"
          >
            Context
          </motion.p>
          <h2 className="text-lg font-light text-white/70 leading-snug tracking-wide">{task.title}</h2>
        </div>

        <AnimatePresence>
          {isHovered && task.description && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: DURATIONS.fast, ease: EASING.softExpand }}
              className="space-y-3 overflow-hidden"
            >
              <p className="text-[9px] font-semibold tracking-[0.3em] text-white/20 uppercase">Notes</p>
              <p className="text-[11px] font-extralight text-white/50 leading-relaxed max-h-[150px] overflow-y-auto scrollbar-none">
                {task.description}
              </p>
            </motion.div>
          )}

          {isHovered && attachments && attachments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: DURATIONS.fast, ease: EASING.softExpand, delay: 0.05 }}
              className="space-y-3 overflow-hidden"
            >
              <p className="text-[9px] font-semibold tracking-[0.3em] text-white/20 uppercase">Resources</p>
              <div className="flex flex-col gap-2">
                {attachments.map(att => (
                  <AttachmentPill 
                    key={att.id} 
                    attachment={att} 
                    getFileUrl={getFileUrl} 
                    onImageClick={onImageClick} 
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
