import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Note, NoteType, NoteCollection, NoteAttachment, NoteVersion, NoteTemplate } from '../types';

interface NexusState {
  notes: Note[];
  templates: NoteTemplate[];
  customTags: string[];
  isLoading: boolean;
  error: string | null;

  collections: NoteCollection[];
  activeCollectionId: string | null;

  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  newNoteTrigger: number;
  triggerNewNote: () => void;

  isTemplateGalleryOpen: boolean;
  openTemplateGallery: () => void;
  closeTemplateGallery: () => void;

  fetchNotes: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createCollection: (name: string) => Promise<NoteCollection | null>;
  updateCollection: (id: string, name: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  setActiveCollectionId: (id: string | null) => void;
  addNote: (note: Partial<Note>, collectionId?: string) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>, collectionId?: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string, isPinned: boolean) => Promise<void>;
  createSessionMemory: (focusSessionId: string, duration: number, captures: string[]) => Promise<void>;
  appendCapturesToDailyNote: (captures: string[], durationMinutes: number) => Promise<void>;
  subscribeToNotes: () => void;
  unsubscribeFromNotes: () => void;

  fetchAttachments: (noteId: string) => Promise<NoteAttachment[]>;
  uploadAttachment: (noteId: string, file: File) => Promise<NoteAttachment | null>;
  deleteAttachment: (attachmentId: string, noteId: string) => Promise<void>;
  getFileUrl: (storagePath: string) => Promise<string | null>;

  attachmentUrls: Record<string, string>;
  setAttachmentUrl: (id: string, url: string) => void;

  fetchNoteVersions: (noteId: string) => Promise<NoteVersion[]>;
  saveNoteVersion: (noteId: string, payload: Partial<Note>) => Promise<NoteVersion | null>;

  saveAsTemplate: (payload: Partial<NoteTemplate>) => Promise<void>;
}

let subscription: ReturnType<typeof supabase.channel> | null = null;

export const useNexusStore = create<NexusState>((set, get) => ({
  notes: [],
  templates: [],
  customTags: [],
  collections: [],
  activeCollectionId: null,
  isLoading: false,
  error: null,
  isCreateModalOpen: false,
  newNoteTrigger: 0,
  isTemplateGalleryOpen: false,
  attachmentUrls: {},

  setAttachmentUrl: (id, url) => set(state => ({
    attachmentUrls: { ...state.attachmentUrls, [id]: url }
  })),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  triggerNewNote: () => set(state => ({ newNoteTrigger: state.newNoteTrigger + 1, isTemplateGalleryOpen: true })),

  openTemplateGallery: () => set({ isTemplateGalleryOpen: true }),
  closeTemplateGallery: () => set({ isTemplateGalleryOpen: false }),

  setActiveCollectionId: (id) => set({ activeCollectionId: id }),

  fetchCollections: async () => {
    try {
      const { data, error } = await supabase
        .from('note_collections')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      if (data) {
        set({ collections: data as NoteCollection[] });
      }
    } catch (err) {
      console.error('Failed to fetch note collections', err);
    }
  },

  fetchTemplates: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data, error } = await supabase
        .from('note_templates')
        .select('*')
        .order('is_system_template', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ templates: (data as NoteTemplate[]) || [] });
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
    }
  },

  fetchTags: async () => {
    try {
      const { data, error } = await supabase
        .from('nexus_tags')
        .select('name')
        .order('name');
        
      if (error) throw error;
      if (data) {
        set({ customTags: data.map(t => t.name) });
      }
    } catch (err) {
      console.error('Failed to fetch custom tags', err);
    }
  },

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*, note_collection_items(collection_id)')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ notes: data as Note[], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createCollection: async (name) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const { data, error } = await supabase
        .from('note_collections')
        .insert([{ user_id: userData.user.id, name }])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ collections: [...state.collections, data as NoteCollection] }));
      return data as NoteCollection;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  updateCollection: async (id, name) => {
    try {
      set(state => ({
        collections: state.collections.map(c => c.id === id ? { ...c, name } : c)
      }));
      const { error } = await supabase.from('note_collections').update({ name }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
      get().fetchCollections();
    }
  },

  deleteCollection: async (id) => {
    try {
      set(state => ({
        collections: state.collections.filter(c => c.id !== id),
        activeCollectionId: state.activeCollectionId === id ? null : state.activeCollectionId
      }));
      const { error } = await supabase.from('note_collections').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
      get().fetchCollections();
    }
  },

  addNote: async (note, collectionId) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Normalize tags
      const normalizedTags = (note.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean);

      const newNote = {
        ...note,
        tags: normalizedTags,
        user_id: userData.user.id,
      };

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticNote = {
        ...newNote,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_pinned: newNote.is_pinned || false,
        is_archived: newNote.is_archived || false,
        tags: newNote.tags || [],
        type: newNote.type || 'standard'
      } as Note;

      set((state) => ({ notes: [optimisticNote, ...state.notes] }));

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;

      // Assign to collection if provided
      if (collectionId) {
        const { error: collectionError } = await supabase
          .from('note_collection_items')
          .insert([{ note_id: data.id, collection_id: collectionId }]);
          
        if (collectionError) throw collectionError;
        (data as any).note_collection_items = [{ collection_id: collectionId }];
      }

      // Upsert tags
      if (normalizedTags.length > 0) {
        const tagInserts = normalizedTags.map(t => ({ user_id: userData.user!.id, name: t }));
        const { error: tagError } = await supabase.from('nexus_tags').upsert(tagInserts, { onConflict: 'user_id,name' });
        if (!tagError) {
          set(state => ({ customTags: Array.from(new Set([...state.customTags, ...normalizedTags])) }));
        }
      }

      // Replace temp with real
      set((state) => ({
        notes: state.notes.map((n) => (n.id === tempId ? (data as Note) : n))
      }));

      return data as Note;
    } catch (err: any) {
      set({ error: err.message });
      // Revert optimistic update by refetching
      get().fetchNotes();
      return null;
    }
  },

  updateNote: async (id, updates, collectionId) => {
    try {
      // Normalize tags if present
      const normalizedUpdates = { ...updates };
      if (updates.tags) {
        normalizedUpdates.tags = updates.tags.map(t => t.trim().toLowerCase()).filter(Boolean);
      }

      // Optimistic update
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...normalizedUpdates, updated_at: new Date().toISOString() } : n))
      }));

      const { error } = await supabase
        .from('notes')
        .update(normalizedUpdates)
        .eq('id', id);

      if (error) throw error;

      if (collectionId !== undefined) {
        // Clear existing assignment (assuming 1 collection max per note for now)
        await supabase.from('note_collection_items').delete().eq('note_id', id);
        if (collectionId !== '') {
          await supabase.from('note_collection_items').insert([{ note_id: id, collection_id: collectionId }]);
        }
        
        // Optimistically update relation
        set(state => ({
          notes: state.notes.map(n => n.id === id ? { 
            ...n, 
            note_collection_items: collectionId ? [{ collection_id: collectionId }] : [] 
          } : n)
        }));
      }

      // Upsert tags
      if (normalizedUpdates.tags && normalizedUpdates.tags.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const tagInserts = normalizedUpdates.tags.map(t => ({ user_id: userData.user!.id, name: t }));
          const { error: tagError } = await supabase.from('nexus_tags').upsert(tagInserts, { onConflict: 'user_id,name' });
          if (!tagError) {
            set(state => ({ customTags: Array.from(new Set([...state.customTags, ...normalizedUpdates.tags!])) }));
          }
        }
      }
    } catch (err: any) {
      set({ error: err.message });
      get().fetchNotes(); // Revert
    }
  },

  deleteNote: async (id) => {
    try {
      // Optimistic delete
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id)
      }));

      // [FUTURE PROOFING / DONE]: Fetch attachments to remove physical files from Supabase Storage
      const { data: attachments } = await supabase
        .from('note_attachments')
        .select('storage_path')
        .eq('note_id', id);

      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(a => a.storage_path).filter(Boolean) as string[]; 
        if (filePaths.length > 0) {
          await supabase.storage.from('nexus-attachments').remove(filePaths);
        }
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
      get().fetchNotes(); // Revert
    }
  },

  togglePin: async (id, isPinned) => {
    await get().updateNote(id, { is_pinned: isPinned });
  },

  createSessionMemory: async (focusSessionId, duration, captures) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const title = `Focus Session Memory`;
      const content = captures.length > 0 
        ? `### Captured Thoughts\n\n${captures.map(c => `- ${c}`).join('\n')}`
        : 'Deep work session completed.';

      const newNote = {
        user_id: userData.user.id,
        title,
        content,
        type: 'memory' as NoteType,
        linked_session_id: focusSessionId,
      };

      // Create note directly (no optimistic update here, we just rely on subscription or refetch)
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (noteError) throw noteError;

      // Create linked memory record
      const { error: memoryError } = await supabase
        .from('session_memories')
        .insert([{
          linked_note_id: noteData.id,
          focus_session_id: focusSessionId,
          duration,
          summary: null
        }]);

      if (memoryError) throw memoryError;

      get().fetchNotes();
    } catch (err: any) {
      console.error('Failed to create session memory:', err);
    }
  },

  appendCapturesToDailyNote: async (captures, durationMinutes) => {
    if (captures.length === 0) return;

    try {
      const todayDate = new Date();
      const todayDateStr = todayDate.toISOString().split('T')[0];
      const { notes, addNote, updateNote } = get();

      // Find if today's note exists
      const todayNote = notes.find(n => n.type === 'daily' && n.daily_date === todayDateStr);

      const formattedCaptures = `\n\n### Focus Session (${durationMinutes}m)\n* ${captures.join('\n* ')}`;

      if (todayNote) {
        await updateNote(todayNote.id, {
          content: (todayNote.content || '') + formattedCaptures
        });
      } else {
        const title = `Today — ${todayDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
        await addNote({
          title,
          content: formattedCaptures.trim(),
          type: 'daily',
          daily_date: todayDateStr
        });
      }
    } catch (err: any) {
      console.error('Failed to append captures to daily note:', err);
    }
  },

  subscribeToNotes: () => {
    if (subscription) return;

    subscription = supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (_payload) => {
          // On any change, just refetch everything to keep it simple and perfectly sorted,
          // or we could optimistically merge payload. 
          // Since we already do local optimistic updates, we just rely on fetchNotes for external changes.
          get().fetchNotes();
        }
      )
      .subscribe();
  },

  unsubscribeFromNotes: () => {
    if (subscription) {
      supabase.removeChannel(subscription);
      subscription = null;
    }
  },

  fetchAttachments: async (noteId: string) => {
    try {
      const { data, error } = await supabase
        .from('note_attachments')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as NoteAttachment[];
    } catch (err: any) {
      console.error("Error fetching attachments:", err);
      return [];
    }
  },

  uploadAttachment: async (noteId: string, file: File) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userData.user.id}/${noteId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('nexus-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const type = file.type.startsWith('image/') ? 'image' : 'file';

      const { data, error: dbError } = await supabase
        .from('note_attachments')
        .insert({
          note_id: noteId,
          file_name: file.name,
          file_url: filePath, // Fallback/legacy
          file_type: type,
          storage_path: filePath,
          size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return data as NoteAttachment;
    } catch (err: any) {
      console.error("Upload error:", err);
      return null;
    }
  },

  deleteAttachment: async (attachmentId: string, _noteId: string) => {
    try {
      // Get the attachment to find its storage path
      const { data: attachment } = await supabase
        .from('note_attachments')
        .select('storage_path')
        .eq('id', attachmentId)
        .single();

      if (attachment?.storage_path) {
        await supabase.storage.from('nexus-attachments').remove([attachment.storage_path]);
      }

      await supabase
        .from('note_attachments')
        .delete()
        .eq('id', attachmentId);
    } catch (err: any) {
      console.error("Error deleting attachment:", err);
      throw err;
    }
  },

  getFileUrl: async (storagePath: string) => {
    try {
      // Create a short-lived signed URL (e.g. 1 hour)
      const { data, error } = await supabase.storage
        .from('nexus-attachments')
        .createSignedUrl(storagePath, 3600);
      
      if (error) throw error;
      return data.signedUrl;
    } catch (err: any) {
      console.error("Error getting file URL:", err);
      return null;
    }
  },

  fetchNoteVersions: async (noteId: string) => {
    try {
      const { data, error } = await supabase
        .from('note_versions')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as NoteVersion[];
    } catch (err: any) {
      console.error("Error fetching note versions:", err);
      return [];
    }
  },

  saveNoteVersion: async (noteId: string, payload: Partial<Note>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const { data, error } = await supabase
        .from('note_versions')
        .insert({
          note_id: noteId,
          user_id: userData.user.id,
          title_snapshot: payload.title || '',
          content_snapshot: payload.content || '',
          tags_snapshot: payload.tags || [],
          type_snapshot: payload.type || 'standard'
        })
        .select()
        .single();

      if (error) throw error;
      return data as NoteVersion;
    } catch (err: any) {
      console.error("Error saving note version:", err);
      return null;
    }
  },

  saveAsTemplate: async (payload) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const newTemplate = {
        user_id: userData.user.id,
        title: payload.title || 'Untitled Template',
        description: payload.description || null,
        icon: payload.icon || 'FileText',
        category: payload.category || 'Custom',
        content: payload.content || '',
        is_system_template: false,
      };

      const { data, error } = await supabase
        .from('note_templates')
        .insert([newTemplate])
        .select()
        .single();

      if (error) throw error;
      
      set(state => ({
        templates: [data as NoteTemplate, ...state.templates]
      }));
    } catch (err: any) {
      console.error('Failed to save as template:', err);
      throw err;
    }
  }
}));
