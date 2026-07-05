import { useNavigate, useLocation } from 'react-router-dom';
import type { Project } from '../types';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

interface ProjectSidebarItemProps {
  project: Project;
}

export function ProjectSidebarItem({ project }: ProjectSidebarItemProps) {
  const activeProjectId = useWorkspaceStore(s => s.activeProjectId);
  const setActiveProject = useWorkspaceStore(s => s.setActiveProject);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive =
    activeProjectId === project.id &&
    location.pathname.startsWith('/app/workspace');

  return (
    <button
      onClick={() => {
        setActiveProject(project.id);
        navigate(`/app/workspace/${project.id}`);
      }}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors duration-150"
      style={{
        backgroundColor: isActive ? '#1c1b1b' : 'transparent',
        color: isActive ? '#e5e2e1' : '#928f9e',
        borderLeft: isActive ? '2px solid #c5c0ff' : '2px solid transparent',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        lineHeight: '20px',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = '#201f1f';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }
      }}
    >
      <div
        className="w-3 h-3 rounded-sm shrink-0"
        style={{ backgroundColor: project.color }}
      />
      <span className="truncate">{project.name}</span>
    </button>
  );
}
