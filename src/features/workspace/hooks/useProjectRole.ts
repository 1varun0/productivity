import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { ProjectRole } from '../types';

export function useProjectRole(projectId: string | null): ProjectRole | null {
  const members = useWorkspaceStore(s =>
    projectId ? s.members[projectId] : undefined
  );
  const { user } = useAuth();

  if (!user || !projectId || !members) return null;
  return members.find(m => m.user_id === user.id)?.role ?? null;
}
