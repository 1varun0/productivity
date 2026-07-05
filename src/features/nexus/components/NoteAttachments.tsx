import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, X, FileText, Loader2, Download } from 'lucide-react';
import { useNexusStore } from '../store/useNexusStore';
import type { NoteAttachment } from '../types';

export interface NoteAttachmentsRef {
  uploadFiles: (files: FileList | File[]) => Promise<{ success: boolean; attachment?: NoteAttachment; url?: string }[]>;
}

interface NoteAttachmentsProps {
  noteId: string | null;
  isEditing: boolean;
  onEnsureNoteId?: () => Promise<string | null>;
  onAttachmentAdded?: (file: File, attachment: NoteAttachment) => void;
}

export const NoteAttachments = forwardRef<NoteAttachmentsRef, NoteAttachmentsProps>(({ noteId, isEditing, onEnsureNoteId, onAttachmentAdded }, ref) => {
  const { fetchAttachments, uploadAttachment, deleteAttachment, getFileUrl, setAttachmentUrl, attachmentUrls } = useNexusStore();
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(!!noteId);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (noteId) {
      loadAttachments();
    } else {
      setAttachments([]);
      setIsLoading(false);
    }
  }, [noteId]);

  const loadAttachments = async () => {
    if (!noteId) return;
    setIsLoading(true);
    const data = await fetchAttachments(noteId);
    setAttachments(data);
    
    // Prefetch signed URLs for images and PDFs
    for (const att of data) {
      if (att.storage_path) {
        const url = await getFileUrl(att.storage_path);
        if (url) setAttachmentUrl(att.id, url);
      }
    }
    setIsLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    let targetNoteId = noteId;
    if (!targetNoteId && onEnsureNoteId) {
      targetNoteId = await onEnsureNoteId();
    }

    if (!targetNoteId) {
      setIsUploading(false);
      return;
    }
    
    const newAttachment = await uploadAttachment(targetNoteId, file);
    if (newAttachment) {
      setAttachments(prev => [...prev, newAttachment]);
      if (newAttachment.storage_path) {
        const url = await getFileUrl(newAttachment.storage_path);
        if (url) setAttachmentUrl(newAttachment.id, url);
      }
      if (onAttachmentAdded) {
        onAttachmentAdded(file, newAttachment);
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useImperativeHandle(ref, () => ({
    uploadFiles: async (files: FileList | File[]) => {
      if (!files || files.length === 0) return [];
      
      setIsUploading(true);
      let targetNoteId = noteId;
      if (!targetNoteId && onEnsureNoteId) {
        targetNoteId = await onEnsureNoteId();
      }

      if (!targetNoteId) {
        setIsUploading(false);
        return [];
      }
      
      const results: { success: boolean; attachment?: NoteAttachment; url?: string }[] = [];

      // Upload all dropped/pasted files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newAttachment = await uploadAttachment(targetNoteId, file);
        if (newAttachment) {
          setAttachments(prev => [...prev, newAttachment]);
          if (newAttachment.storage_path) {
            const url = await getFileUrl(newAttachment.storage_path);
            if (url) {
              setAttachmentUrl(newAttachment.id, url);
              results.push({ success: true, attachment: newAttachment, url });
              continue;
            }
          }
        }
        // Failure case
        results.push({ success: false });
      }
      setIsUploading(false);
      return results;
    }
  }));

  const handleDelete = async () => {
    if (!attachmentToDelete) return;
    const id = attachmentToDelete;
    setAttachmentToDelete(null);
    
    // Optimistic UI update
    setAttachments(prev => prev.filter(a => a.id !== id));
    
    try {
      if (noteId) {
        await deleteAttachment(id, noteId);
      }
    } catch (err) {
      // Revert if error
      loadAttachments();
    }
  };

  if (!isEditing && attachments.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] uppercase tracking-widest text-[#928f9e] font-medium flex items-center gap-2">
          <Paperclip size={12} />
          Attachments
        </h4>
        
        {isEditing && (
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#c8c4d5] hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Paperclip size={12} />}
              Attach
            </button>
          </div>
        )}
      </div>

      {isLoading && attachments.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-[#474553]">
          <Loader2 size={12} className="animate-spin" /> Loading attachments...
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-[11px] text-[#474553]">
          Attach files, images, PDFs, or references
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {attachments.map(att => {
            const isImage = att.file_type === 'image';
            const url = attachmentUrls[att.id] || att.file_url;
            
            return (
              <div 
                key={att.id}
                className="relative group bg-[#161616]/40 backdrop-blur-md border border-white/5 rounded-lg overflow-hidden hover:border-white/10 hover:bg-[#161616]/80 transition-all flex items-center h-12 pr-3 cursor-pointer shadow-sm w-full sm:w-[240px]"
                onClick={() => {
                  if (isImage) {
                    setPreviewImage(url);
                  } else {
                    window.open(url, '_blank');
                  }
                }}
              >
                <div className="w-12 h-12 shrink-0 bg-black/40 flex items-center justify-center mr-3 relative overflow-hidden border-r border-white/5">
                  {isImage ? (
                    url ? (
                      <img src={url} alt={att.file_name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                    ) : (
                      <Loader2 size={12} className="animate-spin text-white/20" />
                    )
                  ) : (
                    <FileText size={16} className="text-[#928f9e] group-hover:text-[#c5c0ff] transition-colors" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 mr-2">
                  <span className="block text-[11px] text-[#c8c4d5] truncate font-medium">{att.file_name}</span>
                </div>
                
                {!isImage && <Download size={12} className="text-[#474553] shrink-0 group-hover:text-white transition-colors" />}

                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachmentToDelete(att.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-[#202020] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ffb4ab]/20 hover:text-[#ffb4ab] text-white/50 border border-white/5 shadow-md"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {attachmentToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setAttachmentToDelete(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-[#161616] border border-white/10 rounded-2xl shadow-2xl p-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[#e5e2e1] mb-2">Delete Attachment?</h3>
              <p className="text-sm text-[#928f9e] mb-6">This will permanently remove the file from your Nexus.</p>
              
              <div className="flex gap-3">
                <button onClick={() => setAttachmentToDelete(null)} className="flex-1 py-2 text-xs font-medium text-[#c8c4d5] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} className="flex-1 py-2 text-xs font-medium text-[#ffb4ab] bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 border border-[#ffb4ab]/20 rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-8"
            onClick={() => setPreviewImage(null)}
          >
            <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 text-white/50 hover:text-white transition-all backdrop-blur-md">
              <X size={20} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
