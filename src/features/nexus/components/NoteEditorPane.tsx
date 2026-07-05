import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Globe, Save, Loader2, SplitSquareHorizontal, SplitSquareVertical, Pin, Maximize2 } from 'lucide-react';
import { NexusBlocksIcon } from '@/components/icons/NexusBlocksIcon';
import { useNexusStore } from '../store/useNexusStore';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SlashCommandMenu } from './SlashCommandMenu';
import { MarkdownFormatBar } from './MarkdownFormatBar';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { ShareModal } from './ShareModal';
import { NoteAttachments } from './NoteAttachments';
import { useSlashCommands } from '../hooks/useSlashCommands';
import type { SlashCommand } from '../hooks/useSlashCommands';
import { useMarkdownShortcuts } from '../hooks/useMarkdownShortcuts';
import type { NoteType, NoteVersion } from '../types';
import TextareaAutosize from 'react-textarea-autosize';

interface NoteEditorPaneProps {
  paneId: string;
  noteId?: string;
  initialDraft?: string;
  isReadOnly?: boolean;
}

export function NoteEditorPane({ paneId, noteId, initialDraft, isReadOnly }: NoteEditorPaneProps) {
  const { notes, collections, updateNote, addNote, saveNoteVersion } = useNexusStore();
  const updatePaneState = useWorkspaceStore(state => state.updatePaneState);
  const closePane = useWorkspaceStore(state => state.closePane);
  const splitPane = useWorkspaceStore(state => state.openPane);
  const toggleReadOnly = useWorkspaceStore(state => state.toggleReadOnly);
  const toggleFullscreen = useWorkspaceStore(state => state.toggleFullscreen);

  // Note State
  const existingNote = noteId ? notes.find(n => n.id === noteId) : undefined;
  
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || initialDraft || '');
  const [type, setType] = useState<NoteType>(existingNote?.type || 'standard');
  const [tags, setTags] = useState<string[]>(existingNote?.tags || []);
  const [collectionId, setCollectionId] = useState<string>(existingNote?.note_collection_items?.[0]?.collection_id || '');
  
  const [isEditing, setIsEditing] = useState(!isReadOnly && !noteId);
  const [isSaving, setIsSaving] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [previewingVersion, setPreviewingVersion] = useState<NoteVersion | null>(null);

  const [isSelectingNote, setIsSelectingNote] = useState(!noteId && initialDraft === undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Tag & Collection UI State
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentsRef = useRef<any>(null);
  const initialNoteStateRef = useRef({ title, content, type, tags });

  // Update internal state if noteId changes (e.g. from parent, though panes usually don't switch noteIds)
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content || '');
      setType(existingNote.type);
      setTags(existingNote.tags || []);
      setCollectionId(existingNote.note_collection_items?.[0]?.collection_id || '');
      initialNoteStateRef.current = { title: existingNote.title, content: existingNote.content || '', type: existingNote.type, tags: existingNote.tags || [] };
    }
  }, [existingNote]);

  // Sync isReadOnly prop
  useEffect(() => {
    if (isReadOnly) {
      setIsEditing(false);
    }
  }, [isReadOnly]);

  const {
    isOpen: isSlashOpen,
    menuPosition: slashPosition,
    filteredCommands,
    selectedIndex: slashIndex,
    handleChange: onSlashChange,
    handleKeyDown: onSlashKeyDown,
    handleCommandInsert: insertCommand
  } = useSlashCommands(textareaRef, content, setContent);

  const {
    selectionActive,
    barPosition: formatBarPosition,
    applyFormat,
    handleShortcutKeyDown
  } = useMarkdownShortcuts(textareaRef, content, setContent);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    setIsSaving(true);

    try {
      if (noteId) {
        await updateNote(noteId, { title, content, type, tags }, collectionId);
        await saveNoteVersion(noteId, { title, content, type, tags });
        initialNoteStateRef.current = { title, content, type, tags };
      } else {
        const newNote = await addNote({ title: title || 'Untitled Note', content, type, tags }, collectionId);
        if (newNote) {
          await saveNoteVersion(newNote.id, { title: newNote.title, content, type, tags });
          updatePaneState(paneId, { entityId: newNote.id }); // Upgrade pane to point to real note
          initialNoteStateRef.current = { title: newNote.title, content, type, tags };
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCommandInsert = (command: SlashCommand) => {
    insertCommand(command);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      attachmentsRef.current?.uploadFiles(e.clipboardData.files);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      attachmentsRef.current?.uploadFiles(e.dataTransfer.files);
    }
  };

  const handleAttachmentAdded = useCallback((file: File, attachment: any) => {
    if (file.type === 'application/pdf') {
      const embedText = `\n!embed[pdf](attachment:${attachment.id})\n`;
      const target = textareaRef.current;
      if (target) {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        setContent(prev => {
          const before = prev.substring(0, start);
          const after = prev.substring(end);
          return before + embedText + after;
        });
        const newCursorPos = start + embedText.length;
        setTimeout(() => {
          target.setSelectionRange(newCursorPos, newCursorPos);
          target.focus();
        }, 0);
      } else {
        setContent(prev => prev + embedText);
      }
    }
  }, []);

  const handleRestoreVersion = async () => {
    if (!previewingVersion || !noteId) return;
    setIsSaving(true);
    await updateNote(noteId, {
      title: previewingVersion.title_snapshot,
      content: previewingVersion.content_snapshot,
      tags: previewingVersion.tags_snapshot,
      type: previewingVersion.type_snapshot
    });
    
    setTitle(previewingVersion.title_snapshot);
    setContent(previewingVersion.content_snapshot);
    setTags(previewingVersion.tags_snapshot || []);
    setType(previewingVersion.type_snapshot || 'standard');
    
    setPreviewingVersion(null);
    setIsEditing(true);
    setIsSaving(false);
  };

  // Keyboard shortcuts for the pane
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, type, tags, collectionId, noteId]);

  if (isSelectingNote) {
    const filteredNotes = notes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
      <div className="w-full h-full flex flex-col px-6 py-6 bg-transparent text-[#e5e2e1]">
        <div className="flex items-center gap-4 mb-8">
          <NexusBlocksIcon size={20} className="text-[#c5c0ff]" />
          <h2 className="text-sm font-medium tracking-wide">Select Note</h2>
        </div>
        
        <input 
          type="text" 
          placeholder="Search notes..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-[#c8c4d5] mb-6 focus:outline-none focus:border-[#c5c0ff]/30 transition-colors"
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0">
          <button
            onClick={() => setIsSelectingNote(false)}
            className="w-full text-left px-4 py-3 rounded-lg border border-dashed border-white/10 hover:border-[#c5c0ff]/30 hover:bg-[#c5c0ff]/5 transition-all flex items-center gap-3 text-sm group shrink-0"
          >
            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-[#c5c0ff]/10">
              <Plus size={14} className="text-[#c5c0ff]" />
            </div>
            Start a new blank note
          </button>
          
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => {
                updatePaneState(paneId, { entityId: note.id, content: note.content });
                setIsSelectingNote(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all flex items-center gap-3 text-sm shrink-0"
            >
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                <NexusBlocksIcon size={14} className="text-[#928f9e]" />
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="font-medium text-[#c8c4d5] truncate">{note.title || 'Untitled Note'}</span>
                <span className="text-xs text-[#928f9e] truncate">{note.content?.substring(0, 50)}...</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full overflow-y-auto custom-scrollbar relative p-2 flex justify-center items-start group/container"
      onDragOver={(e) => { if(isEditing) { e.preventDefault(); } }}
      onDragLeave={(e) => { if(isEditing) { e.preventDefault(); } }}
      onDrop={(e) => {
        if (!isEditing) return;
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
          attachmentsRef.current?.uploadFiles(e.dataTransfer.files);
        }
      }}
    >
      <div className="w-full bg-[#161616]/60 backdrop-blur-2xl border border-white/10 rounded-xl p-6 md:px-10 md:py-6 flex flex-col relative shadow-2xl min-h-full group/editor">
        
        {previewingVersion && (
          <div className="absolute top-0 left-0 right-0 rounded-t-xl bg-[#c5c0ff]/10 border-b border-[#c5c0ff]/20 px-6 py-2 backdrop-blur-md flex items-center justify-between z-30">
            <div className="flex items-center gap-2 text-xs text-[#c5c0ff] font-medium">
              <Clock size={12} />
              Previewing version from {new Date(previewingVersion.created_at).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreviewingVersion(null)} className="px-3 py-1 text-[11px] font-medium text-[#c5c0ff]/80 hover:text-[#c5c0ff] hover:bg-[#c5c0ff]/10 rounded transition-colors">
                Cancel
              </button>
              <button onClick={handleRestoreVersion} disabled={isSaving} className="px-3 py-1 text-[11px] font-medium bg-[#c5c0ff] text-black rounded hover:bg-white transition-colors disabled:opacity-50">
                {isSaving ? 'Restoring...' : 'Restore This Version'}
              </button>
            </div>
          </div>
        )}

        {/* Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 w-full shrink-0 z-20">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#c5c0ff]/50">
            {isReadOnly ? 'Reference' : 'Editor'}
          </div>
          {!isReadOnly && !previewingVersion && (
            <div className="flex items-center gap-0.5 bg-[#1a1a1a]/80 rounded-lg border border-white/5 p-1 backdrop-blur-md">
              <button onClick={() => setIsEditing(!isEditing)} className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all ${!isEditing ? 'bg-white/10 text-white shadow-sm' : 'text-[#928f9e] hover:text-[#e5e2e1]'}`}>
                View
              </button>
              <button onClick={() => setIsEditing(true)} className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all ${isEditing ? 'bg-white/10 text-white shadow-sm' : 'text-[#928f9e] hover:text-[#e5e2e1]'}`}>
                Edit
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-0.5 bg-[#1a1a1a]/80 rounded-lg border border-white/5 p-1 backdrop-blur-md">
            {!isReadOnly && noteId && (
              <>
                <button onClick={() => setIsHistoryOpen(true)} className={`p-1.5 rounded-md transition-colors ${isHistoryOpen ? 'text-[#c5c0ff] bg-white/5' : 'text-[#928f9e] hover:text-white hover:bg-white/5'}`} title="Version History">
                  <Clock size={14} />
                </button>
                <button onClick={() => setIsShareModalOpen(true)} className={`p-1.5 rounded-md transition-colors ${isShareModalOpen ? 'text-[#c5c0ff] bg-white/5' : 'text-[#928f9e] hover:text-white hover:bg-white/5'}`} title="Publish / Share">
                  <Globe size={14} />
                </button>
              </>
            )}
            {!isReadOnly && (
              <button
                onClick={handleSave}
                disabled={isSaving || (!title.trim() && !content.trim())}
                className="p-1.5 text-[#928f9e] hover:text-white hover:bg-white/5 rounded-md transition-colors disabled:opacity-50"
                title="Save (CMD+S)"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin text-[#c5c0ff]" /> : <Save size={14} />}
              </button>
            )}
            
            <div className="w-px h-3.5 bg-white/10 mx-1.5" />
            
            <button 
              onClick={(e) => { e.stopPropagation(); toggleReadOnly(paneId); }}
              className={`p-1.5 rounded-md transition-colors ${isReadOnly ? 'text-[#c5c0ff] bg-white/5' : 'text-[#928f9e] hover:text-white hover:bg-white/5'}`}
              title={isReadOnly ? "Unpin (Make Editable)" : "Pin as Reference"}
            >
              <Pin size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); splitPane({ type: 'note' }, paneId, 'horizontal'); }}
              className="p-1.5 rounded-md text-[#928f9e] hover:text-white hover:bg-white/5 transition-colors hidden md:block"
              title="Split Right"
            >
              <SplitSquareHorizontal size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); splitPane({ type: 'note' }, paneId, 'vertical'); }}
              className="p-1.5 rounded-md text-[#928f9e] hover:text-white hover:bg-white/5 transition-colors hidden md:block"
              title="Split Down"
            >
              <SplitSquareVertical size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="p-1.5 rounded-md text-[#928f9e] hover:text-white hover:bg-white/5 transition-colors hidden md:block"
              title="Toggle Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); closePane(paneId); }}
              className="p-1.5 rounded-md text-[#928f9e] hover:text-red-400 hover:bg-red-500/20 transition-colors ml-0.5"
              title="Close Pane"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 mb-6 z-10 w-full shrink-0">
          {!isReadOnly && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-0.5">
              {(['standard', 'checklist', 'idea', 'resource'] as NoteType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  disabled={!isEditing || !!previewingVersion}
                  className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 transition-colors shrink-0 ${type === t ? 'bg-[#c5c0ff]/20 text-[#c5c0ff] font-semibold' : 'text-[#928f9e] hover:text-[#e5e2e1]'} disabled:opacity-50`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* Collection Dropdown */}
          {!isReadOnly && (
            <div className="relative">
              <button
                onClick={() => setIsCollectionDropdownOpen(!isCollectionDropdownOpen)}
                disabled={!isEditing || !!previewingVersion}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors border ${isCollectionDropdownOpen || collectionId ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-[#c8c4d5] border-white/10 hover:bg-white/10'}`}
              >
                <span className="max-w-[120px] truncate">
                  {collectionId ? collections.find(c => c.id === collectionId)?.name || 'Collection' : 'No Collection'}
                </span>
              </button>
              <AnimatePresence>
                {isCollectionDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCollectionDropdownOpen(false)} />
                    <motion.div className="absolute left-0 top-full mt-2 w-48 bg-[#161616]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50 py-1">
                      <button onClick={() => { setCollectionId(''); setIsCollectionDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs text-[#928f9e] hover:bg-white/5 hover:text-white transition-colors">
                        Clear Collection
                      </button>
                      {collections.map(c => (
                        <button key={c.id} onClick={() => { setCollectionId(c.id); setIsCollectionDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs text-[#c8c4d5] hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${collectionId === c.id ? 'bg-[#c5c0ff]' : 'bg-white/20'}`} />
                          <span className="truncate">{c.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {tags.map(tag => (
              <span key={tag} className="font-mono text-[12px] text-[#c5c0ff]/70 flex items-center gap-1 group shrink-0">
                #{tag}
                {isEditing && !isReadOnly && (
                  <X size={10} className="opacity-0 group-hover:opacity-100 cursor-pointer hover:text-[#ffb4ab] transition-opacity" onClick={() => setTags(prev => prev.filter(t => t !== tag))} />
                )}
              </span>
            ))}

            {isEditing && !isReadOnly && !previewingVersion && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="+ Add tag"
                  value={tagInput}
                  onChange={(e) => { setTagInput(e.target.value); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
                      setTagInput('');
                    }
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface-variant text-[11px] px-3 py-1 rounded-full outline-none w-20 focus:w-28 transition-all placeholder:text-[#928f9e]"
                />
              </div>
            )}
          </div>
        </div>
        <input
          type="text"
          placeholder="Untitled Note..."
          value={previewingVersion ? previewingVersion.title_snapshot : title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus={!noteId}
          readOnly={!isEditing || !!previewingVersion || isReadOnly}
          className="w-full bg-transparent border-none text-[#e5e2e1] font-bold text-[28px] md:text-[40px] py-1 mb-6 focus:outline-none transition-colors placeholder:text-white/20 shrink-0 tracking-tight"
        />

      <div className="w-full flex-1 relative min-h-0">
        {isEditing && !previewingVersion && !isReadOnly ? (
          <div className="w-full relative group/editor pb-16">
            <TextareaAutosize
              ref={textareaRef}
              minRows={10}
              placeholder="Start writing in markdown..."
              value={content}
              onChange={onSlashChange}
              onKeyDown={(e) => {
                onSlashKeyDown(e);
                handleShortcutKeyDown(e);
              }}
              onPaste={handlePaste}
              onDrop={handleImageDrop}
              className="w-full bg-transparent border-none text-[#c8c4d5] text-[15px] pt-1 resize-none focus:outline-none placeholder:text-[#474553]/50 leading-relaxed overflow-hidden font-sans relative z-10 block"
            />

            <SlashCommandMenu
              isOpen={isSlashOpen}
              position={slashPosition}
              commands={filteredCommands}
              selectedIndex={slashIndex}
              onSelect={handleCommandInsert}
            />
            
            <MarkdownFormatBar
              isActive={selectionActive}
              position={formatBarPosition}
              onFormat={applyFormat}
            />
          </div>
        ) : (
          <div className="w-full text-[#c8c4d5] text-[15px] pt-1 pb-16 leading-relaxed font-sans">
            <MarkdownRenderer 
              content={previewingVersion ? previewingVersion.content_snapshot : content} 
              onClick={() => { if (!previewingVersion && !isReadOnly) setIsEditing(true); }}
              readOnly={isReadOnly || !!previewingVersion}
              isWorkspaceMode={true}
            />
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 pb-2 shrink-0 flex items-center justify-between border-t border-white/5 font-mono text-[10px] text-[#c8c4d5]/50">
        <div>{content.trim().split(/\s+/).filter(Boolean).length} words</div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-[#ffb4ab] animate-pulse' : 'bg-[#c5c0ff]'} shadow-[0_0_8px_rgba(197,192,255,0.4)]`}></span> 
          {isSaving ? 'Saving...' : 'Saved'}
        </div>
      </div>
        <div className="shrink-0 mt-4">
          <NoteAttachments
            ref={attachmentsRef}
            noteId={noteId || null}
            isEditing={isEditing && !isReadOnly}
            onEnsureNoteId={async () => {
              if (noteId) return noteId;
              const newNote = await addNote({ title: title || 'Untitled Note', content, type, tags }, collectionId);
              if (newNote) {
                updatePaneState(paneId, { entityId: newNote.id });
                return newNote.id;
              }
              throw new Error("Failed to create note for attachment");
            }}
            onAttachmentAdded={handleAttachmentAdded}
          />
        </div>
      </div>
      
      {noteId && (
        <VersionHistoryPanel
          noteId={noteId}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onPreview={(v) => { setPreviewingVersion(v); setIsEditing(false); }}
        />
      )}

      {noteId && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          note={{ id: noteId, title }}
        />
      )}
    </div>
  );
}
