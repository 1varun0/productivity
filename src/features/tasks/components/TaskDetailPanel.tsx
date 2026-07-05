import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTasks } from '../hooks/useTasks';
import { useLists } from '@/features/lists/hooks/useLists';
import { X, Calendar as CalendarIcon, Link as LinkIcon, Paperclip, Check, Loader2, Image as ImageIcon, FileText, Upload, Trash2, Target } from 'lucide-react';
import { useAttachments, type Attachment } from '../hooks/useAttachments';
import { useStore } from '@/store/useStore';
import { CustomDatePicker } from '@/components/CustomDatePicker';

function AttachmentItemView({ attachment, getFileUrl, onDelete, onImageClick }: { attachment: Attachment, getFileUrl: (path: string) => Promise<string | null>, onDelete: (e: React.MouseEvent) => void, onImageClick: (url: string) => void }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (attachment.type === 'image' && attachment.storage_path) {
      getFileUrl(attachment.storage_path).then(url => {
        if (url) setSignedUrl(url);
      });
    }
  }, [attachment, getFileUrl]);

  const isPDF = attachment.name.toLowerCase().endsWith('.pdf');
  const ext = attachment.name.split('.').pop()?.toUpperCase() || 'FILE';
  const timeStr = new Date(attachment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [isOpening, setIsOpening] = useState(false);

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

  return (
    <div 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="group relative flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:bg-card/40 hover:border-border/40 hover:-translate-y-[1px] hover:shadow-[0_4px_24px_-8px_rgba(255,255,255,0.06)] transition-all duration-300 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      
      {attachment.type === 'image' ? (
        <div className="w-10 h-10 rounded-md bg-accent/40 flex-shrink-0 overflow-hidden flex items-center justify-center border border-border/50">
          {signedUrl ? (
            <motion.img 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.3 }}
              src={signedUrl} 
              alt={attachment.name} 
              className="w-full h-full object-cover" 
            />
          ) : <ImageIcon size={14} className="text-foreground/50" />}
        </div>
      ) : attachment.type === 'link' ? (
        <div className="w-10 h-10 rounded-md bg-accent/40 flex-shrink-0 flex items-center justify-center border border-border/50">
          {attachment.url ? (
            <img src={`https://www.google.com/s2/favicons?domain=${new URL(attachment.url).hostname}&sz=32`} alt="favicon" className="w-5 h-5 opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-foreground/50"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'; }} />
          ) : (
            <LinkIcon size={14} className="text-foreground/50" />
          )}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-md bg-accent/40 flex-shrink-0 flex items-center justify-center border border-border/50">
          {isPDF ? <FileText size={16} className="text-red-400/80" /> : <Paperclip size={14} className="text-foreground/50" />}
        </div>
      )}

      <div className="flex flex-col min-w-0 flex-1">
        {attachment.type === 'link' ? (
          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {attachment.name}
          </span>
        ) : (
          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate select-all">{attachment.name}</span>
        )}
        
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground/70 mt-0.5">
          {attachment.type !== 'link' && <span>{ext}</span>}
          {attachment.type !== 'link' && attachment.size && (
            <>
              <span className="opacity-50">•</span>
              <span>{Math.round(attachment.size / 1024)} KB</span>
            </>
          )}
          <span className="opacity-50">•</span>
          <span>{timeStr}</span>
          {attachment.type === 'link' && (
            <>
              <span className="opacity-50">•</span>
              <span className="truncate max-w-[120px]">{attachment.url}</span>
            </>
          )}
          {isOpening && (
            <>
              <span className="opacity-50">•</span>
              <Loader2 size={10} className="animate-spin text-primary" />
            </>
          )}
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(e); }} 
        className="p-1.5 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 relative z-10" 
        title="Remove attachment"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function TaskDetailPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const { tasks, updateTask, toggleTask } = useTasks();
  const { lists } = useLists();
  
  const task = tasks?.find(t => t.id === taskId);
  const activeList = lists?.find(l => l.id === task?.list_id);

  const setActiveTaskId = useStore(state => state.setActiveTaskId);
  const setSessionDuration = useStore(state => state.setSessionDuration);
  const startFocusSession = useStore(state => state.startFocusSession);
  const focusState = useStore(state => state.focusState);
  const activeFocusTaskId = useStore(state => state.activeTaskId);

  const [isOverrideConfirmOpen, setIsOverrideConfirmOpen] = useState(false);
  const [pendingFocusDuration, setPendingFocusDuration] = useState<number | undefined>(undefined);

  const handleEnterFocus = (duration?: number) => {
    if (!task) return;
    
    // Check if another session is active
    if (focusState === 'active' && activeFocusTaskId !== task.id) {
      setPendingFocusDuration(duration);
      setIsOverrideConfirmOpen(true);
      return;
    }
    
    executeEnterFocus(duration);
  };
  
  const executeEnterFocus = (duration?: number) => {
    if (!task) return;
    setActiveTaskId(task.id);
    if (duration) {
      setSessionDuration(duration);
    }
    startFocusSession();
    closePanel();
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isHoveringDropzone, setIsHoveringDropzone] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLinkComposerOpen, setIsLinkComposerOpen] = useState(false);
  const [isCustomDurationOpen, setIsCustomDurationOpen] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkError, setLinkError] = useState('');
  
  const { attachments, uploadFile, isUploading, uploadError, resetUploadError, addLink, isAddingLink, updateAttachmentTitle, deleteAttachment, getFileUrl } = useAttachments(taskId);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync state when task changes (hydration)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task?.id]); // Only run when ID changes so we don't overwrite user typing

  const closePanel = () => {
    handleSave();
    searchParams.delete('taskId');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedImage) {
          setSelectedImage(null);
        } else if (isLinkComposerOpen) {
          setIsLinkComposerOpen(false);
          setLinkUrl('');
          setLinkTitle('');
        } else {
          closePanel();
        }
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSave();
        // optionally blur focus
        (document.activeElement as HTMLElement)?.blur?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, description, task, searchParams, selectedImage]);

  const handleSave = () => {
    if (!task) return;
    if (title.trim() !== task.title || description.trim() !== (task.description || '')) {
      updateTask(task.id, { 
        title: title.trim() || task.title,
        description: description.trim() 
      });
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsHoveringDropzone(false);
    if (!taskId) return;
    
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await uploadFile({ file, taskId });
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (!taskId) return;
    
    const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    
    // Handle files (like screenshots)
    if (e.clipboardData.files.length > 0) {
      if (isInput) return; // Let input handle its own file drop if supported
      e.preventDefault();
      const files = Array.from(e.clipboardData.files);
      for (const file of files) {
        await uploadFile({ file, taskId });
      }
      return;
    }

    // Handle URLs
    if (!isInput) {
      const text = e.clipboardData.getData('text');
      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        e.preventDefault();
        setIsLinkComposerOpen(true);
        setLinkUrl(text);
        setLinkTitle('');
        setLinkError('');
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!taskId || !e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      await uploadFile({ file, taskId });
    }
    e.target.value = ''; // Reset input
  };

  const handleLinkSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAddingLink) return;
    setLinkError('');
    
    if (!linkUrl.trim()) return;
    
    let processedUrl = linkUrl.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    try {
      const parsed = new URL(processedUrl);
      
      // Trim tracking parameters
      const paramsToStrip = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      paramsToStrip.forEach(param => parsed.searchParams.delete(param));
      
      const finalUrl = parsed.toString();
      const finalName = linkTitle.trim() || parsed.hostname;
      
      // Handle duplicates seamlessly
      const duplicateLink = attachments?.find(a => a.type === 'link' && a.url === finalUrl);
      
      if (duplicateLink) {
        if (linkTitle.trim() && duplicateLink.name !== finalName) {
          await updateAttachmentTitle({ id: duplicateLink.id, name: finalName });
        } else {
          setLinkError('Already attached');
          return;
        }
      } else if (taskId) {
        await addLink({ url: finalUrl, name: finalName, taskId });
      }
      
      setIsLinkComposerOpen(false);
      setLinkUrl('');
      setLinkTitle('');
      
    } catch (err) {
      setLinkError('Please enter a valid URL');
    }
  };

  // Determine if overdue
  const isOverdue = task?.due_date && new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && !task.completed;

  const content = (
    <AnimatePresence>
      {taskId && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/10 backdrop-blur-[1px]"
            onClick={closePanel}
          />
          <motion.div
            key="panel"
            initial={{ x: '100%', filter: 'blur(8px)' }}
            animate={{ x: 0, filter: 'blur(0px)' }}
            exit={{ x: '100%', filter: 'blur(4px)', transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border/50 z-50 shadow-2xl flex flex-col focus-visible:outline-none"
            onDragOver={(e) => { e.preventDefault(); setIsHoveringDropzone(true); }}
            onDragLeave={() => setIsHoveringDropzone(false)}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={-1}
          >
        
        {isHoveringDropzone && (
          <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-primary/50 border-dashed m-3 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm pointer-events-none transition-all">
            <Upload size={32} className="text-primary/80 mb-3" />
            <span className="text-primary font-medium tracking-wide">Drop to upload</span>
          </div>
        )}

        {!task && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-muted-foreground/30" size={24} />
          </div>
        )}

        {task && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar relative flex flex-col h-full">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-foreground/60 flex items-center gap-1.5">
                {activeList ? <span>{activeList.name}</span> : <span>Overview</span>}
              </span>
              <div className="flex items-center gap-3">
                <kbd className="hidden sm:inline-block font-sans bg-white/10 border border-white/10 px-2 py-1 rounded text-[10px] text-white/80 shadow-sm uppercase tracking-wider">Esc</kbd>
                <button 
                  onClick={closePanel} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent hover:bg-accent/40 text-foreground/70 hover:text-foreground transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer relative z-[100]"
                  aria-label="Close panel"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleTask(task.id, !task.completed)}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded-[6px] flex items-center justify-center border transition-all duration-300 active:scale-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${task.completed ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20' : 'border-border/80 bg-background hover:border-primary/50 hover:bg-card shadow-inset-edge'}`}
                >
                  <AnimatePresence>
                    {task.completed && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check size={12} strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  className={`w-full bg-transparent border-transparent text-[22px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md px-1 -ml-1 placeholder:text-muted-foreground/30 transition-all ${task.completed ? 'text-muted-foreground/60 line-through' : 'text-foreground/90'}`}
                  placeholder="Task title"
                />
              </div>

              <div className="flex flex-col gap-2 pl-8 relative z-20">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className={`flex items-center gap-1.5 text-[11.5px] font-medium tracking-wide px-3 py-1.5 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${isOverdue ? 'border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'border-border/60 bg-accent/30 text-foreground/70 hover:text-foreground hover:bg-accent/60'}`}
                  >
                    <CalendarIcon size={13} className={isOverdue ? 'opacity-90' : 'opacity-70'} />
                    {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Set date'}
                  </button>

                  {/* Enter Focus Action */}
                  <div className="relative z-50">
                    <div className="flex items-center bg-accent/30 rounded-md border border-border/60 group shadow-sm transition-all hover:border-primary/30">
                      <button 
                        onClick={() => handleEnterFocus()}
                        className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide px-3 py-1.5 text-foreground/70 hover:text-foreground hover:bg-card/80 rounded-l-md transition-colors focus-visible:outline-none focus-visible:bg-card"
                      >
                        <Target size={12} className="opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all" />
                        Enter Focus
                      </button>
                      <div className="w-px h-4 bg-border/60 mx-0.5" />
                      <div className="flex items-center px-1">
                        {[25, 45, 90].map(duration => (
                          <button
                            key={duration}
                            onClick={() => handleEnterFocus(duration)}
                            className="text-[10px] font-medium px-2 py-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-card/80 rounded transition-colors focus-visible:outline-none focus-visible:bg-card"
                          >
                            {duration}m
                          </button>
                        ))}
                        
                        {isCustomDurationOpen ? (
                          <input
                            type="text"
                            autoFocus
                            placeholder="Min"
                            value={customDurationInput}
                            onChange={e => setCustomDurationInput(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = parseInt(customDurationInput);
                                if (val > 0) handleEnterFocus(val);
                              } else if (e.key === 'Escape') {
                                setIsCustomDurationOpen(false);
                              }
                            }}
                            className="w-10 ml-0.5 bg-background/50 border border-border/30 rounded text-center text-[10px] py-1 text-foreground focus:outline-none focus:border-primary/50"
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setIsCustomDurationOpen(true);
                              setCustomDurationInput('');
                            }}
                            className="text-[10px] font-medium px-2 py-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-card/80 rounded transition-colors focus-visible:outline-none focus-visible:bg-card ml-0.5"
                          >
                            Custom
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isOverrideConfirmOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full left-0 mt-2 p-3 rounded-xl bg-card border border-border/50 shadow-xl w-[240px]"
                        >
                          <p className="text-xs text-foreground/80 font-medium mb-1">Another session is active.</p>
                          <p className="text-[10px] text-muted-foreground/70 mb-3 leading-relaxed">Starting focus here will override the current session.</p>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setIsOverrideConfirmOpen(false);
                                executeEnterFocus(pendingFocusDuration);
                              }}
                              className="flex-1 bg-primary text-primary-foreground text-[10px] font-medium py-1.5 rounded-lg transition-colors hover:bg-primary/90"
                            >
                              Override
                            </button>
                            <button 
                              onClick={() => setIsOverrideConfirmOpen(false)}
                              className="flex-1 bg-accent hover:bg-accent/80 text-foreground/80 text-[10px] font-medium py-1.5 rounded-lg transition-colors border border-border/50"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isCalendarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      className="overflow-hidden absolute top-full left-8 mt-1 shadow-2xl z-50 rounded-xl bg-card border border-border/50"
                    >
                      <CustomDatePicker 
                        selectedDate={task.due_date || null} 
                        onSelect={(date) => {
                          updateTask(task.id, { due_date: date || undefined });
                          setIsCalendarOpen(false);
                        }} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="pl-8 flex-1 flex flex-col min-h-0 pt-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                placeholder="Add notes, context, or paste links..."
                className="w-full flex-1 bg-transparent border-none text-[13.5px] focus:outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed text-foreground/80 focus-visible:ring-2 focus-visible:ring-primary/10 rounded-md px-1 -ml-1 py-1"
              />
            </div>

            <div className="pl-8 space-y-4 mt-auto">
              {/* Hidden File Inputs */}
              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />

              <div className="flex items-center justify-between text-foreground/60">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase flex items-center gap-1.5">
                    <Paperclip size={10} className="opacity-70" /> Context
                  </h3>
                  {attachments && attachments.length > 0 && (
                    <span className="text-[10px] font-medium bg-accent px-1.5 py-0.5 rounded text-foreground/80">{attachments.length} attached</span>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/70 hover:text-foreground hover:bg-accent/60 bg-accent/20 px-2.5 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                  <Upload size={12} /> Upload File
                </button>
                <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/70 hover:text-foreground hover:bg-accent/60 bg-accent/20 px-2.5 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                  <ImageIcon size={12} /> Add Image
                </button>
                <button onClick={() => setIsLinkComposerOpen(!isLinkComposerOpen)} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 px-2.5 py-1.5 rounded-md ${isLinkComposerOpen ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-foreground/70 hover:text-foreground hover:bg-accent/60 bg-accent/20'}`}>
                  <LinkIcon size={12} /> {isLinkComposerOpen ? 'Cancel' : 'Paste Link'}
                </button>
              </div>
              
              <AnimatePresence>
                {isLinkComposerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleLinkSubmit} className="flex flex-col gap-2 p-3 rounded-xl border border-border/40 bg-accent/10 shadow-inset-edge mt-2">
                      <input 
                        autoFocus
                        type="text" 
                        value={linkUrl}
                        onChange={(e) => { setLinkUrl(e.target.value); setLinkError(''); }}
                        placeholder="https://..."
                        className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/40"
                      />
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={linkTitle}
                          onChange={(e) => setLinkTitle(e.target.value)}
                          placeholder="Optional title"
                          className="flex-1 bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/40"
                        />
                        <button 
                          type="submit"
                          disabled={!linkUrl.trim() || isAddingLink}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {isAddingLink ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
                          Save
                        </button>
                      </div>
                      {linkError && <span className="text-[10px] text-destructive/80 font-medium px-1">{linkError}</span>}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div 
                className="space-y-2 mt-2"
              >
                {attachments?.map(attachment => (
                  <AttachmentItemView 
                    key={attachment.id} 
                    attachment={attachment} 
                    getFileUrl={getFileUrl} 
                    onImageClick={setSelectedImage}
                    onDelete={() => deleteAttachment(attachment)} 
                  />
                ))}

                {(isUploading || isAddingLink) && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent bg-accent/20 opacity-70 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-md bg-accent/40 flex-shrink-0 flex items-center justify-center">
                      <Loader2 size={14} className="text-foreground/50 animate-spin" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground/80">Adding...</span>
                    </div>
                  </motion.div>
                )}

                {uploadError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-destructive/20 bg-destructive/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-destructive/10 flex-shrink-0 flex items-center justify-center">
                        <X size={14} className="text-destructive/80" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-destructive/90">Upload failed</span>
                        <span className="text-[10px] text-destructive/70">Please try again</span>
                      </div>
                    </div>
                    <button onClick={resetUploadError} className="text-[10px] font-medium px-2 py-1 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors">
                      Dismiss
                    </button>
                  </motion.div>
                )}
                
                {(!attachments || attachments.length === 0) && !isUploading && !isAddingLink && !uploadError && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-accent/10 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  >
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload size={16} className="text-foreground/60 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs text-foreground/60 font-medium">Click to upload, drop files, or paste links</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between text-[9px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                {task.updated_at && <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </>
      )}
      
      {/* Lightbox Portal Layer */}
      {selectedImage && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-accent/40 text-foreground/70 hover:text-foreground hover:bg-accent/80 transition-all duration-300 z-10"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
          
          <motion.img
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
