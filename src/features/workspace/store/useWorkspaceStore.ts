import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Project, ProjectMember, ProjectRole, OnlineMember, ProjectInvite } from '../types';

export interface MyPendingInvite extends ProjectInvite {
  project: { id: string; name: string; color: string; icon: string };
  inviter: { username: string } | null;
}

interface WorkspaceStore {
  // State
  projects: Project[];
  activeProjectId: string | null;
  activeTab: 'tasks' | 'docs' | 'chat' | 'files';
  members: Record<string, ProjectMember[]>;
  pendingInvites: Record<string, ProjectInvite[]>;
  myPendingInvites: MyPendingInvite[];
  onlineMembers: OnlineMember[];
  isLoading: boolean;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (name: string, color: string, icon: string) => Promise<string | null>;
  setActiveProject: (id: string | null) => void;
  setActiveTab: (tab: 'tasks' | 'docs' | 'chat' | 'files') => void;
  fetchMembers: (projectId: string) => Promise<void>;
  inviteMember: (projectId: string, email: string, role: ProjectRole) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  updateMemberRole: (projectId: string, userId: string, role: ProjectRole) => Promise<void>;
  fetchPendingInvites: (projectId: string) => Promise<void>;
  sendInvite: (projectId: string, email: string, role: ProjectRole) => Promise<void>;
  revokeInvite: (inviteId: string, projectId: string) => Promise<void>;
  fetchMyPendingInvites: () => Promise<void>;
  acceptMyInvite: (inviteId: string, projectId: string, role: ProjectRole) => Promise<void>;
  declineMyInvite: (inviteId: string) => Promise<void>;
  setOnlineMembers: (members: OnlineMember[]) => void;
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'color' | 'icon'>>) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  activeTab: 'tasks',
  members: {},
  pendingInvites: {},
  myPendingInvites: [],
  onlineMembers: [],
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      set({ isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*, project_members!inner(user_id)')
      .eq('project_members.user_id', userId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      // Strip the project_members data from the result so it matches the Project type exactly
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cleanData = data.map(({ project_members, ...rest }) => rest);
      set({ projects: cleanData as Project[], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  createProject: async (name: string, color: string, icon: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return null;

    // Optimistic ID
    const optimisticId = crypto.randomUUID();
    const optimisticProject: Project = {
      id: optimisticId,
      name,
      color,
      icon,
      owner_id: userId,
      invite_code: '',
      invite_enabled: false,
      created_at: new Date().toISOString(),
      archived: false,
    };

    set(state => ({ projects: [...state.projects, optimisticProject] }));

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, color, icon, owner_id: userId })
      .select()
      .single();

    if (error || !data) {
      // Rollback
      set(state => ({
        projects: state.projects.filter(p => p.id !== optimisticId),
      }));
      return null;
    }

    // Replace optimistic with real
    set(state => ({
      projects: state.projects.map(p =>
        p.id === optimisticId ? (data as Project) : p
      ),
    }));

    // Add self as owner member
    await supabase.from('project_members').insert({
      project_id: data.id,
      user_id: userId,
      role: 'owner',
    });

    return data.id as string;
  },

  updateProject: async (id, updates) => {
    // Optimistic update
    set(s => ({
      projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));

    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);

    if (error) {
      // Rollback
      get().fetchProjects();
      console.error('Failed to update project:', error);
    }
  },

  archiveProject: async (id) => {
    set(s => ({
      projects: s.projects.map(p => p.id === id ? { ...p, archived: true } : p),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId
    }));
    await supabase.from('projects').update({ archived: true }).eq('id', id);
  },

  restoreProject: async (id) => {
    set(s => ({
      projects: s.projects.map(p => p.id === id ? { ...p, archived: false } : p)
    }));
    await supabase.from('projects').update({ archived: false }).eq('id', id);
  },

  deleteProject: async (id) => {
    // Before deleting project record — remove all files from storage
    const { data: files } = await supabase
      .from('project_files')
      .select('storage_path')
      .eq('project_id', id);

    if (files && files.length > 0) {
      await supabase.storage
        .from('project-files')
        .remove(files.map(f => f.storage_path));
    }

    set(s => ({
      projects: s.projects.filter(p => p.id !== id),
      members: Object.fromEntries(Object.entries(s.members).filter(([k]) => k !== id)),
      pendingInvites: Object.fromEntries(Object.entries(s.pendingInvites).filter(([k]) => k !== id)),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    }));
    
    await supabase.from('projects').delete().eq('id', id);
  },

  setActiveProject: (id: string | null) => {
    set({ activeProjectId: id });
  },

  setActiveTab: (tab: 'tasks' | 'docs' | 'chat' | 'files') => {
    set({ activeTab: tab });
  },

  fetchMembers: async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_members')
      .select('*, profile:profiles(username)')
      .eq('project_id', projectId);

    if (!error && data) {
      set(state => ({
        members: { ...state.members, [projectId]: data as ProjectMember[] },
      }));
    }
  },

  inviteMember: async (projectId: string, email: string, role: ProjectRole) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    await supabase.from('project_invites').insert({
      project_id: projectId,
      invited_email: email,
      invited_by: userId,
      role,
    });
  },

  removeMember: async (projectId: string, userId: string) => {
    const prev = get().members[projectId] || [];

    // Optimistic
    set(state => ({
      members: {
        ...state.members,
        [projectId]: (state.members[projectId] || []).filter(
          m => m.user_id !== userId
        ),
      },
    }));

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      // Rollback
      set(state => ({
        members: { ...state.members, [projectId]: prev },
      }));
    }
  },

  updateMemberRole: async (projectId: string, userId: string, role: ProjectRole) => {
    const prev = get().members[projectId] || [];

    // Optimistic
    set(state => ({
      members: {
        ...state.members,
        [projectId]: (state.members[projectId] || []).map(m =>
          m.user_id === userId ? { ...m, role } : m
        ),
      },
    }));

    const { error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      set(state => ({
        members: { ...state.members, [projectId]: prev },
      }));
    }
  },

  fetchPendingInvites: async (projectId) => {
    const { data } = await supabase
      .from('project_invites')
      .select('*')
      .eq('project_id', projectId)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (data) {
      set(s => ({
        pendingInvites: { ...s.pendingInvites, [projectId]: data }
      }));
    }
  },

  sendInvite: async (projectId, email, role) => {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const currentUser = await supabase.auth.getUser();

    // Insert invite record
    const { data: invite, error } = await supabase
      .from('project_invites')
      .insert({
        project_id: projectId,
        invited_email: email,
        invited_by: currentUser.data.user?.id,
        role,
        token,
        expires_at: expiresAt,
      })
      .select().single();

    if (error) throw error;

    // Get project name
    const project = get().projects.find(p => p.id === projectId);

    // Call Edge Function to send email
    await supabase.functions.invoke('send-project-invite', {
      body: {
        projectId,
        invitedEmail: email,
        projectName: project?.name,
        role,
        token,
        expiresAt,
      }
    });

    // Update local pending invites
    if (invite) {
      set(s => ({
        pendingInvites: {
          ...s.pendingInvites,
          [projectId]: [invite, ...(s.pendingInvites[projectId] ?? [])]
        }
      }));
    }
  },

  revokeInvite: async (inviteId, projectId) => {
    set(s => ({
      pendingInvites: {
        ...s.pendingInvites,
        [projectId]: (s.pendingInvites[projectId] ?? []).filter(i => i.id !== inviteId)
      }
    }));
    await supabase.from('project_invites').delete().eq('id', inviteId);
  },

  fetchMyPendingInvites: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (!email) return;

    const { data, error } = await supabase
      .from('project_invites')
      .select(`
        *,
        project:project_id(id, name, color, icon),
        inviter:invited_by(username)
      `)
      .eq('invited_email', email)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending invites:', error);
      return;
    }

    if (data) {
      set({ myPendingInvites: data as unknown as MyPendingInvite[] });
    }
  },

  acceptMyInvite: async (inviteId: string, projectId: string, role: ProjectRole) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    // 1. Check if already a member
    const { data: existing } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      // 2. Add to project_members
      const { error: insertError } = await supabase.from('project_members').insert({
        project_id: projectId,
        user_id: userId,
        role: role,
      });
      if (insertError) throw new Error('Failed to join project');
    }

    // 3. Mark invite as accepted
    await supabase.from('project_invites').update({ accepted: true }).eq('id', inviteId);

    // 4. Remove from pending local state
    set(s => ({
      myPendingInvites: s.myPendingInvites.filter(i => i.id !== inviteId)
    }));

    // 5. Refetch projects so it shows up in sidebar
    get().fetchProjects();
  },

  declineMyInvite: async (inviteId: string) => {
    // Optimistic remove
    set(s => ({
      myPendingInvites: s.myPendingInvites.filter(i => i.id !== inviteId)
    }));
    await supabase.from('project_invites').delete().eq('id', inviteId);
  },

  setOnlineMembers: (members: OnlineMember[]) => {
    set({ onlineMembers: members });
  },
}));
