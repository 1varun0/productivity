import { useState, useEffect } from 'react';
import { LayoutDashboard, User, Activity, Calendar, Plus, ChevronRight, ChevronDown, X } from 'lucide-react';
import { NexusBlocksIcon } from '@/components/icons/NexusBlocksIcon';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';
import { ProjectSidebarItem } from '@/features/workspace/components/ProjectSidebarItem';
import { CreateProjectModal } from '@/features/workspace/components/modals/CreateProjectModal';

export function Sidebar() {
  const openSettingsModal = useStore(state => state.openSettingsModal);
  const focusState = useStore(state => state.focusState);
  const activeListId = useStore(state => state.activeListId);
  const setActiveListId = useStore(state => state.setActiveListId);
  const isFocusing = focusState !== 'idle';
  const projects = useWorkspaceStore(s => s.projects);
  const fetchProjects = useWorkspaceStore(s => s.fetchProjects);
  const myPendingInvites = useWorkspaceStore(s => s.myPendingInvites);
  const fetchMyPendingInvites = useWorkspaceStore(s => s.fetchMyPendingInvites);
  const acceptMyInvite = useWorkspaceStore(s => s.acceptMyInvite);
  const declineMyInvite = useWorkspaceStore(s => s.declineMyInvite);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  useEffect(() => {
    fetchProjects();
    fetchMyPendingInvites();
  }, [fetchProjects, fetchMyPendingInvites]);
  
  const navigate = useNavigate();
  const location = useLocation();

  const isOverview = location.pathname === '/app';
  const isHabits = location.pathname === '/app/habits';
  const isTimetable = location.pathname === '/app/timetable';
  const isNexus = location.pathname === '/app/nexus';
  
  return (
    <>
    <motion.aside 
      animate={{ 
        opacity: isFocusing ? 0.15 : 1,
        filter: isFocusing ? 'blur(4px)' : 'blur(0px)',
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className={`w-64 bg-background hidden md:flex flex-col border-none z-10 relative ${isFocusing ? 'pointer-events-none select-none' : ''}`}
    >
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-border/20 via-border/5 to-transparent pointer-events-none" />
      
      <div className="h-20 flex items-center px-6 relative z-10">
        <div className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm shadow-primary/20">
          P
        </div>
        <span className="ml-3 font-semibold text-sm tracking-tight text-foreground/90">Productivity</span>
      </div>
      
      <div className="flex-1 py-4 px-3 space-y-1 relative z-10">
        <div className="px-3 pb-3 text-[10px] font-semibold text-muted-foreground/50 tracking-widest uppercase">Menu</div>
        
        <button 
          onClick={() => {
            navigate('/app');
            setActiveListId(null);
          }}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isOverview && activeListId === null 
              ? 'bg-card text-foreground shadow-inset-edge border border-border/40' 
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard size={16} className={isOverview && activeListId === null ? "text-primary/90" : ""} />
            Overview
          </div>
        </button>

        <button 
          onClick={() => navigate('/app/habits')}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isHabits
              ? 'bg-card text-foreground shadow-inset-edge border border-border/40' 
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <Activity size={16} className={isHabits ? "text-primary/90" : ""} />
            Habits
          </div>
        </button>

        <button 
          onClick={() => navigate('/app/timetable')}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isTimetable
              ? 'bg-card text-foreground shadow-inset-edge border border-border/40' 
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calendar size={16} className={isTimetable ? "text-primary/90" : ""} />
            Timetable
          </div>
        </button>

        <button 
          onClick={() => navigate('/app/nexus')}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isNexus
              ? 'bg-card text-foreground shadow-inset-edge border border-border/40' 
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <NexusBlocksIcon size={16} className={isNexus ? "text-primary/90" : ""} />
            Nexus
          </div>
        </button>

        {/* Workspace divider */}
        <div className="mx-3 my-3 h-[1px]" style={{ backgroundColor: '#1e1e1e' }} />

        {myPendingInvites.length > 0 && (
          <div className="mb-4">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground/50 tracking-widest uppercase">Pending Invites</span>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: '#534AB720', color: '#c5c0ff' }}>
                {myPendingInvites.length}
              </span>
            </div>
            {myPendingInvites.map(invite => {
                           // Wait, let's just use a simple colored dot like ProjectSidebarItem does to keep it clean!
              
              return (
                <div key={invite.id} className="mx-3 mb-2 p-2 rounded-lg" style={{ backgroundColor: '#1c1b1b', border: '1px solid #2a2a2a' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: invite.project.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate text-[#e5e2e1]">{invite.project.name}</div>
                      <div className="text-[10px] text-[#928f9e] truncate">from {invite.inviter?.username || 'Someone'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        setIsAccepting(invite.id);
                        await acceptMyInvite(invite.id, invite.project.id, invite.role);
                        setIsAccepting(null);
                      }}
                      disabled={isAccepting === invite.id}
                      className="flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center transition-opacity"
                      style={{ backgroundColor: '#534AB7', color: '#ffffff', opacity: isAccepting === invite.id ? 0.5 : 1 }}
                    >
                      {isAccepting === invite.id ? '...' : 'Accept'}
                    </button>
                    <button 
                      onClick={() => declineMyInvite(invite.id)}
                      className="w-8 py-1.5 rounded text-[10px] flex items-center justify-center transition-colors"
                      style={{ backgroundColor: 'transparent', color: '#928f9e', border: '1px solid #2a2a2a' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PROJECTS section */}
        <div className="px-3 pb-2 text-[10px] font-semibold text-muted-foreground/50 tracking-widest uppercase">Projects</div>

        {activeProjects.map(project => (
          <ProjectSidebarItem key={project.id} project={project} />
        ))}

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
        >
          <div className="flex items-center gap-3">
            <Plus size={16} />
            New Project
          </div>
        </button>

        {archivedProjects.length > 0 && (
          <div className="mt-2">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/50 hover:text-muted-foreground/80 tracking-widest uppercase transition-colors"
            >
              <span>Archived</span>
              {showArchived ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            {showArchived && (
              <div className="flex flex-col opacity-40 hover:opacity-70 transition-opacity">
                {archivedProjects.map(project => (
                  <ProjectSidebarItem key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 relative z-10 flex flex-col gap-1 border-t border-border/5">
        <button 
          onClick={openSettingsModal}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors border border-border/40 shadow-inset-edge">
            <User size={14} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-medium text-foreground/90">Profile</div>
            <div className="text-[10px] text-muted-foreground">Settings</div>
          </div>
        </button>
      </div>
    </motion.aside>

    {showCreateModal && (
      <CreateProjectModal onClose={() => setShowCreateModal(false)} />
    )}
    </>
  );
}
