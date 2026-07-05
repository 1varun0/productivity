import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Note } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Partial<Note>;
}

export function ShareModal({ isOpen, onClose, note }: ShareModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (isOpen && note.id) {
      checkShareStatus();
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, note.id, onClose]);

  const checkShareStatus = async () => {
    if (!note.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_note_shares')
        .select('is_public, public_slug')
        .eq('note_id', note.id)
        .single();
      
      if (!error && data) {
        setIsPublic(data.is_public);
        setPublicSlug(data.public_slug);
      } else {
        setIsPublic(false);
        setPublicSlug(null);
      }
    } catch (e) {
      console.error('Error checking share status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    const safeTitle = (title || 'note').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const hash = Math.random().toString(36).substring(2, 6);
    return `${safeTitle}-${hash}`;
  };

  const toggleShare = async () => {
    if (!note.id) return;
    setIsLoading(true);
    
    try {
      const newIsPublic = !isPublic;
      const slug = publicSlug || generateSlug(note.title || 'note');

      const { error } = await supabase
        .from('public_note_shares')
        .upsert({
          note_id: note.id,
          is_public: newIsPublic,
          public_slug: slug,
          updated_at: new Date().toISOString()
        }, { onConflict: 'note_id' });

      if (error) throw error;

      setIsPublic(newIsPublic);
      if (!publicSlug) setPublicSlug(slug);
      
    } catch (e) {
      console.error('Error toggling share:', e);
      alert('Failed to update share settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!publicSlug) return;
    // We assume the frontend URL is the current window origin.
    const url = `${window.location.origin}/share/${publicSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const shareUrl = publicSlug ? `${window.location.origin}/share/${publicSlug}` : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-[#121212]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-6 relative flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#928f9e] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#c5c0ff]">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-medium text-lg">Publish to Web</h3>
                <p className="text-xs text-[#928f9e]">Create a public, read-only link for this note.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Public Access</span>
                  <span className="text-xs text-[#928f9e]">Anyone with the link can view</span>
                </div>
                <button
                  onClick={toggleShare}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-[#c5c0ff]' : 'bg-white/10'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <AnimatePresence>
                {isPublic && publicSlug && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#c8c4d5] font-mono truncate select-all">
                        {shareUrl}
                      </div>
                      <button
                        onClick={handleCopy}
                        className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[#c8c4d5] hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center shrink-0"
                        title="Copy Clean Link"
                      >
                        {hasCopied ? <Check size={16} className="text-[#c5c0ff]" /> : <Copy size={16} />}
                      </button>
                    </div>

                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-lg bg-[#c5c0ff]/10 text-[#c5c0ff] hover:bg-[#c5c0ff]/20 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Open Public Page
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLoading && (
                <div className="flex justify-center py-2">
                  <Loader2 size={20} className="animate-spin text-[#928f9e]" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
