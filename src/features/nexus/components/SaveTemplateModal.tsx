import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Loader2, BookmarkPlus } from 'lucide-react';
import { useNexusStore } from '../store/useNexusStore';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle: string;
  initialContent: string;
}

export function SaveTemplateModal({ isOpen, onClose, initialTitle, initialContent }: SaveTemplateModalProps) {
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Custom');
  const [isSaving, setIsSaving] = useState(false);
  const { saveAsTemplate } = useNexusStore();

  const handleSave = async () => {
    if (!title.trim() || !initialContent.trim()) return;
    setIsSaving(true);
    try {
      await saveAsTemplate({
        title,
        description,
        category,
        content,
        icon: 'FileText' // Default icon for custom templates for now
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl h-[80vh] bg-[#161616] border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="text-[15px] font-medium text-white flex items-center gap-2">
              <BookmarkPlus size={16} className="text-primary" />
              Create New Template
            </h3>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex-1 flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Template Name</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/50 outline-none transition-all"
                placeholder="e.g., Weekly Review"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/50 outline-none transition-all"
                placeholder="A short summary of this structure..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/50 outline-none transition-all appearance-none"
              >
                <option value="Custom">Custom</option>
                <option value="Planning">Planning</option>
                <option value="Creative">Creative</option>
                <option value="Reflection">Reflection</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col min-h-[200px]">
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Template Content (Markdown)</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full flex-1 bg-[#1e1e1e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:border-primary/50 outline-none transition-all resize-none custom-scrollbar font-mono"
                placeholder="# My Heading&#10;&#10;Some structure here..."
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Create Template
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
