import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Loader2, Lightbulb, Clock, Edit2, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NexusBlocksIcon } from '@/components/icons/NexusBlocksIcon';
import type { Note } from '../types';
import { useNexusStore } from '../store/useNexusStore';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { NexusWorkspace } from '../workspace/NexusWorkspace';
import { NeuralCard } from './NeuralCard';
import { DailyNotesStream } from './DailyNotesStream';
import { TemplateGallery } from './TemplateGallery';
import { SaveTemplateModal } from './SaveTemplateModal';
import '../styles/nexus.css';

interface NexusViewProps {
  isOverlay?: boolean;
}

export function NexusView({ isOverlay = false }: NexusViewProps) {
  const { notes, collections, activeCollectionId, isLoading, fetchNotes, fetchTags, fetchCollections, subscribeToNotes, unsubscribeFromNotes, deleteNote, createCollection, updateCollection, deleteCollection, setActiveCollectionId, openTemplateGallery, closeTemplateGallery } = useNexusStore();
  const openSingle = useWorkspaceStore(state => state.openSingle);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'notes' | 'journal'>('notes');
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState('');
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);

  const handleEditCollectionSave = async () => {
    if (editingCollectionId && editingCollectionName.trim()) {
      await updateCollection(editingCollectionId, editingCollectionName.trim());
    }
    setEditingCollectionId(null);
  };

  useEffect(() => {
    fetchTags();
    fetchCollections();
    fetchNotes();
    subscribeToNotes();
    return () => {
      unsubscribeFromNotes();
    };
  }, [fetchNotes, fetchTags, subscribeToNotes, unsubscribeFromNotes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && noteToDelete) {
        setNoteToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [noteToDelete]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (activeCollectionId) {
      result = result.filter(n => n.note_collection_items?.some(i => i.collection_id === activeCollectionId));
    }
    if (!searchQuery.trim()) {
      result = result.filter(n => n.type !== 'daily');
    } else {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.tags?.some(tag => tag.toLowerCase().includes(q))
      );
      result.sort((a, b) => {
        if (a.type === 'daily' && b.type !== 'daily') return 1;
        if (a.type !== 'daily' && b.type === 'daily') return -1;
        return 0;
      });
    }
    return result;
  }, [notes, searchQuery, activeCollectionId]);

  const confirmDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const handleCreateCollection = async () => {
    if (newCollectionName.trim()) {
      await createCollection(newCollectionName.trim());
    }
    setNewCollectionName('');
    setIsCreatingCollection(false);
  };

  const handleEditNote = (note: Note) => {
    openSingle({ type: 'note', entityId: note.id, content: note.content });
  };

  const openCreateNote = (dailyProps?: { title: string; daily_date?: string; content?: string }) => {
    openSingle({ type: 'note', content: dailyProps?.content || '' });
  };

  return (
    <div className="flex-1 flex h-full bg-[#0e0e0e] relative overflow-hidden nexus-nebula-bg">
      {/* Sidebar Collections */}
      <aside className="w-56 border-r border-white/5 flex flex-col pt-8 pb-4 shrink-0 relative z-20">
        <div className="px-6 mb-4 flex items-center justify-between group">
          <span className="text-[10px] font-bold text-[#928f9e]/70 tracking-[0.1em] uppercase">Collections</span>
          <button
            onClick={() => setIsCreatingCollection(true)}
            className="opacity-0 group-hover:opacity-100 text-[#928f9e] hover:text-[#e5e2e1] transition-all"
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          <button
            onClick={() => { setViewMode('notes'); setActiveCollectionId(null); }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 flex items-center gap-2 ${viewMode === 'notes' && activeCollectionId === null
              ? 'bg-white/5 text-[#e5e2e1] shadow-[0_0_15px_rgba(255,255,255,0.03)]'
              : 'text-[#928f9e] hover:text-[#c8c4d5] hover:bg-white/[0.02]'
              }`}
          >
            <NexusBlocksIcon size={14} className={viewMode === 'notes' && activeCollectionId === null ? 'text-primary' : 'opacity-70'} />
            All Notes
          </button>

          <button
            onClick={() => { setViewMode('journal'); setActiveCollectionId(null); }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 flex items-center gap-2 ${viewMode === 'journal'
              ? 'bg-white/5 text-[#e5e2e1] shadow-[0_0_15px_rgba(255,255,255,0.03)]'
              : 'text-[#928f9e] hover:text-[#c8c4d5] hover:bg-white/[0.02]'
              }`}
          >
            <Clock size={14} className={viewMode === 'journal' ? 'text-primary' : 'opacity-70'} />
            Daily Notes
          </button>

          {collections.map(c => {
            const isEditing = editingCollectionId === c.id;
            
            return (
              <div key={c.id} className="relative group/col">
                {isEditing ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 mt-1 bg-white/5 rounded-md border border-white/10">
                    <input 
                      autoFocus
                      value={editingCollectionName}
                      onChange={e => setEditingCollectionName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEditCollectionSave();
                        if (e.key === 'Escape') setEditingCollectionId(null);
                      }}
                      className="w-full bg-transparent outline-none text-xs text-[#e5e2e1]"
                    />
                    <button onClick={handleEditCollectionSave} className="text-[#928f9e] hover:text-[#e5e2e1]"><Check size={12}/></button>
                    <button onClick={() => setEditingCollectionId(null)} className="text-[#928f9e] hover:text-[#ffb4ab]"><X size={12}/></button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setViewMode('notes'); setActiveCollectionId(c.id); }}
                    className={`group/btn w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 flex items-center gap-2 ${activeCollectionId === c.id
                      ? 'bg-white/5 text-[#e5e2e1] shadow-[0_0_15px_rgba(255,255,255,0.03)]'
                      : 'text-[#928f9e] hover:text-[#c8c4d5] hover:bg-white/[0.02]'
                      }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${activeCollectionId === c.id ? 'bg-primary' : 'bg-white/20'}`} />
                    <span className="truncate flex-1">{c.name}</span>
                    
                    <div className="hidden group-hover/col:flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                      <div 
                        onClick={(e) => { e.stopPropagation(); setEditingCollectionId(c.id); setEditingCollectionName(c.name); }}
                        className="p-1 hover:text-[#e5e2e1]"
                      >
                        <Edit2 size={12} />
                      </div>
                      <div 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Delete collection?')) deleteCollection(c.id); }}
                        className="p-1 hover:text-[#ffb4ab]"
                      >
                        <Trash2 size={12} />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            );
          })}

          {isCreatingCollection && (
            <div className="px-3 py-2 mt-2">
              <input
                type="text"
                autoFocus
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateCollection();
                  if (e.key === 'Escape') setIsCreatingCollection(false);
                }}
                onBlur={handleCreateCollection}
                placeholder="Name..."
                className="w-full bg-[#1A1A1A] border border-white/10 text-xs text-[#e5e2e1] rounded px-2 py-1.5 outline-none focus:border-white/20 transition-all placeholder:text-[#474553]"
              />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Actions Area */}
        <header className={`w-full pt-8 pb-6 pl-8 ${isOverlay ? 'pr-20' : 'pr-8'} flex justify-between items-center z-40 shrink-0 relative`}>
          <div className="relative w-64 group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#928f9e] group-focus-within:text-[#e5e2e1] transition-colors" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0F0F0F] border border-[#1E1E1E] text-[#e5e2e1] font-mono text-xs py-2 pl-9 pr-3 rounded-md nexus-search-input transition-all duration-300 placeholder:text-[#474553]"
            />
          </div>

          <button
            onClick={() => openTemplateGallery()}
            className="bg-[#1E1E1E]/80 backdrop-blur border border-white/10 text-[#e5e2e1] font-medium text-xs py-2 px-4 rounded-md flex items-center gap-2 hover:bg-[#2a2a2a] transition-all duration-300 shadow-sm"
          >
            <Plus size={14} />
            NEW NOTE
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 pt-4 z-10 relative">
          {isLoading && notes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-[#928f9e]" size={24} />
            </div>
          ) : viewMode === 'journal' ? (
            <DailyNotesStream 
              notes={notes} 
              onEditNote={handleEditNote} 
              onCreateDailyNote={(title, date) => openCreateNote({ title, daily_date: date })}
            />
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#928f9e] font-mono text-sm opacity-50">
              <Lightbulb size={32} className="mb-4 opacity-20" />
              <p>{activeCollectionId ? "This collection is empty. Capture a thought..." : "Empty vault. Capture a thought..."}</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
              {filteredNotes.map((node, i) => (
                <NeuralCard
                  key={node.id}
                  note={node}
                  index={i}
                  onClick={handleEditNote}
                  onEdit={handleEditNote}
                  onDelete={setNoteToDelete}
                />
              ))}
            </div>
          )}
        </main>

        <TemplateGallery 
          onSelectBlank={() => {
            closeTemplateGallery();
            openCreateNote();
          }}
          onSelectTemplate={(template) => {
            closeTemplateGallery();
            openCreateNote({ title: template.title, content: template.content });
          }}
          onCreateNew={() => {
            closeTemplateGallery();
            setIsSaveTemplateModalOpen(true);
          }}
        />

        <SaveTemplateModal
          isOpen={isSaveTemplateModalOpen}
          onClose={() => setIsSaveTemplateModalOpen(false)}
          initialTitle=""
          initialContent=""
        />

        {/* Workspace Overlay */}
        {typeof document !== 'undefined' && createPortal(
          <NexusWorkspace />,
          document.body
        )}

        {/* Delete Confirmation Modal */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {noteToDelete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#0e0e0e]/80 backdrop-blur-md p-8"
                onClick={() => setNoteToDelete(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-sm bg-[#161616]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-[#e5e2e1] mb-2">Delete this note?</h3>
                  <p className="text-sm text-[#928f9e] mb-8">This action cannot be undone.</p>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setNoteToDelete(null)}
                      className="px-4 py-2 text-xs font-medium text-[#c8c4d5] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 text-xs font-medium text-[#ffb4ab] bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 border border-[#ffb4ab]/20 rounded-lg transition-colors shadow-[0_0_15px_rgba(255,180,171,0.1)]"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div >
  );
}
