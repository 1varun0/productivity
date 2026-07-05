import { useEffect } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { ProjectMember } from '../types';

const EMPTY_MEMBERS: ProjectMember[] = [];

export function useProjectMembers(projectId: string | null) {
  const fetchMembers = useWorkspaceStore(s => s.fetchMembers);
  const members = useWorkspaceStore(s =>
    projectId ? s.members[projectId] ?? EMPTY_MEMBERS : EMPTY_MEMBERS
  );

  useEffect(() => {
    if (projectId) {
      fetchMembers(projectId);
    }
  }, [projectId, fetchMembers]);

  return members;
}
