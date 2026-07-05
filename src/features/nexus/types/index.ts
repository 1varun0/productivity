export type NoteType = 'standard' | 'checklist' | 'memory' | 'resource' | 'idea' | 'daily';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  type: NoteType;
  tags: string[];
  linked_session_id: string | null;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  cover_image: string | null;
  daily_date?: string | null;
  note_collection_items?: { collection_id: string }[];
}

export interface NoteAttachment {
  id: string;
  note_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  storage_path: string | null;
  size: number | null;
  created_at: string;
}

export interface NoteVersion {
  id: string;
  note_id: string;
  user_id: string;
  title_snapshot: string;
  content_snapshot: string;
  tags_snapshot: string[];
  type_snapshot: NoteType;
  created_at: string;
}

export interface NoteTemplate {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  content: string;
  is_system_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteCollection {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface SessionMemory {
  id: string;
  linked_note_id: string;
  focus_session_id: string;
  duration: number | null;
  summary: string | null;
  created_at: string;
}

// Custom interface for the UI, adding transient/derived state if needed
export interface UI_Note extends Note {
  // Can add listItems parsing logic or local state here if necessary
  listItems?: { text: string; done: boolean }[];
  categoryColor?: string; // Derived from NoteType
}
