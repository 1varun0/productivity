import { useState } from 'react';
import { Settings, UserPlus } from 'lucide-react';
import { Briefcase, Rocket, Star, Globe, Code, Boxes } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { Project } from '../types';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { usePresence } from '../hooks/usePresence';
import { useProjectMembers } from '../hooks/useProjectMembers';
import { useProjectRole } from '../hooks/useProjectRole';
import { PresenceBar } from './PresenceBar';
import { TasksTab } from './tabs/TasksTab';
import { DocsTab } from './tabs/DocsTab';
import { ChatTab } from './tabs/ChatTab';
import { FilesTab } from './tabs/FilesTab';
import { InviteModal } from './modals/InviteModal';
import { ProjectSettingsModal } from './modals/ProjectSettingsModal';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  briefcase: Briefcase,
  rocket: Rocket,
  star: Star,
  globe: Globe,
  code: Code,
  boxes: Boxes,
  folder: Briefcase,
};

const TABS = [
  { key: 'tasks' as const, label: 'TASKS' },
  { key: 'docs' as const, label: 'DOCS' },
  { key: 'chat' as const, label: 'CHAT' },
  { key: 'files' as const, label: 'FILES' },
];

interface ProjectViewProps {
  project: Project;
}

export function ProjectView({ project }: ProjectViewProps) {
  const activeTab = useWorkspaceStore(s => s.activeTab);
  const setActiveTab = useWorkspaceStore(s => s.setActiveTab);
  const onlineMembers = useWorkspaceStore(s => s.onlineMembers);
  const role = useProjectRole(project.id);
  const isOwner = role === 'owner';

  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Activate presence and member fetching
  usePresence(project.id);
  useProjectMembers(project.id);

  const IconComponent = ICON_MAP[project.icon] || Briefcase;

  const restoreProject = useWorkspaceStore(s => s.restoreProject);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#131313' }}>
      {project.archived && (
        <div className="w-full flex items-center justify-between px-6 py-2 shrink-0" style={{ backgroundColor: '#1a1a0a', borderBottom: '1px solid #474553' }}>
          <span style={{ color: '#BA7517', fontSize: '12px', fontWeight: 500, fontFamily: 'Inter' }}>This project is archived</span>
          <button 
            onClick={() => restoreProject(project.id)}
            className="px-4 py-1 rounded-sm font-bold text-[10px] tracking-wider uppercase transition-colors"
            style={{ backgroundColor: '#BA7517', color: '#1a1a0a' }}
            onMouseEnter={e => (e.target as HTMLElement).style.opacity = '0.9'}
            onMouseLeave={e => (e.target as HTMLElement).style.opacity = '1'}
          >
            RESTORE
          </button>
        </div>
      )}
      
      {/* Top bar */}
      <header
        className="h-[48px] w-full flex justify-between items-center px-6 shrink-0"
        style={{
          borderBottom: '1px solid #474553',
          backgroundColor: '#131313',
        }}
      >
        {/* Left: Project identity */}
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: project.color }}
          >
            <IconComponent size={14} style={{ color: '#d1ccff' }} />
          </div>
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              lineHeight: '24px',
              letterSpacing: '-0.01em',
              fontWeight: 500,
              color: '#e5e2e1',
            }}
          >
            {project.name}
          </h1>
        </div>

        {/* Center: Tabs */}
        <nav className="hidden md:flex gap-6 h-full">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center h-full transition-all duration-100"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                lineHeight: '12px',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: activeTab === tab.key ? '#e5e2e1' : '#928f9e',
                borderBottom:
                  activeTab === tab.key
                    ? '2px solid #e5e2e1'
                    : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.key) {
                  (e.target as HTMLElement).style.color = '#e5e2e1';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.key) {
                  (e.target as HTMLElement).style.color = '#928f9e';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right: Presence + Actions */}
        <div className="flex items-center gap-4">
          <PresenceBar members={onlineMembers} />

          <div
            className="w-[1px] h-4"
            style={{ backgroundColor: '#474553' }}
          />

          {role !== 'viewer' && (
            <button
              onClick={() => setShowInvite(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-sm transition-colors"
            style={{
              border: '1px solid #474553',
              color: '#928f9e',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              lineHeight: '14px',
              letterSpacing: '0.01em',
              fontWeight: 500,
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.color = '#e5e2e1';
              (e.target as HTMLElement).style.borderColor = '#928f9e';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.color = '#928f9e';
              (e.target as HTMLElement).style.borderColor = '#474553';
            }}
          >
            <UserPlus size={14} />
            <span>Invite</span>
          </button>
          )}

          {isOwner && (
            <button
              onClick={() => setShowSettings(true)}
              className="transition-colors"
              style={{ color: '#928f9e' }}
              onMouseEnter={e =>
                ((e.target as HTMLElement).style.color = '#e5e2e1')
              }
              onMouseLeave={e =>
                ((e.target as HTMLElement).style.color = '#928f9e')
              }
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'tasks' && <TasksTab projectId={project.id} />}
        {activeTab === 'docs' && <DocsTab projectId={project.id} />}
        {activeTab === 'chat' && <ChatTab projectId={project.id} />}
        {activeTab === 'files' && <FilesTab projectId={project.id} />}
      </main>

      {/* Modals */}
      {showInvite && (
        <InviteModal
          projectId={project.id}
          onClose={() => setShowInvite(false)}
        />
      )}
      {showSettings && (
        <ProjectSettingsModal
          project={project}
          onClose={() => setShowSettings(false)}
          onOpenInvite={() => {
            setShowSettings(false);
            setShowInvite(true);
          }}
        />
      )}
    </div>
  );
}
