export type ProjectRole = 'owner' | 'member' | 'viewer';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  owner_id: string;
  invite_code: string;
  invite_enabled: boolean;
  created_at: string;
  archived: boolean;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  joined_at: string;
  profile?: {
    username: string;
  };
}

export interface ProjectInvite {
  id: string;
  project_id: string;
  invited_email: string;
  invited_by: string;
  role: ProjectRole;
  token: string;
  accepted: boolean;
  created_at: string;
  expires_at: string;
}

export interface OnlineMember {
  user_id: string;
  name: string;
  avatar_url: string | null;
  online_at: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  edited_at: string | null;
  deleted: boolean;
  created_at: string;
  attachments?: {
    name: string;
    path: string;
    type: string;
    size: number;
  }[];
  // joined
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface ProjectDoc {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_by: string;
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  editor?: {
    name: string;
  };
}

export interface ProjectFolder {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  created_by: string;
  created_at: string;
  // derived
  children?: ProjectFolder[];
  fileCount?: number;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  folder_id: string | null;
  uploaded_by: string;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
  // joined
  uploader?: { name: string };
}

export interface UploadProgress {
  id: string; // temp local id
  filename: string;
  progress: number; // 0–100
  done: boolean;
  error?: string;
  // stored for retry functionality
  file: File;
  folderId: string | null;
}

export const PROJECT_COLORS = [
  '#534AB7', '#185FA5', '#0F6E56',
  '#BA7517', '#993556', '#D85A30',
] as const;

export const PROJECT_ICONS = [
  'briefcase', 'rocket', 'star',
  'globe', 'code', 'boxes',
] as const;
