import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { WorkspaceEmpty } from './WorkspaceEmpty';
import { ProjectView } from './ProjectView';

export function WorkspacePage() {
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>();
  const projects = useWorkspaceStore(s => s.projects);
  const activeProjectId = useWorkspaceStore(s => s.activeProjectId);
  const isLoading = useWorkspaceStore(s => s.isLoading);
  const fetchProjects = useWorkspaceStore(s => s.fetchProjects);
  const setActiveProject = useWorkspaceStore(s => s.setActiveProject);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Sync URL param to store
  useEffect(() => {
    if (urlProjectId && urlProjectId !== activeProjectId) {
      setActiveProject(urlProjectId);
    }
  }, [urlProjectId, activeProjectId, setActiveProject]);

  if (isLoading && projects.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-3 rounded-sm animate-pulse"
              style={{
                width: `${120 - i * 20}px`,
                backgroundColor: '#1e1e1e',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return <WorkspaceEmpty />;
  }

  if (!activeProjectId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p
          className="text-sm"
          style={{ color: '#555555', fontFamily: 'Inter, sans-serif' }}
        >
          Select a project from the sidebar
        </p>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId);
  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p
          className="text-sm"
          style={{ color: '#555555', fontFamily: 'Inter, sans-serif' }}
        >
          Project not found
        </p>
      </div>
    );
  }

  return <ProjectView project={activeProject} />;
}
