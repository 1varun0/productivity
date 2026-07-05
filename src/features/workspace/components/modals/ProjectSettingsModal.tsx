import { useState, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useProjectRole } from '../../hooks/useProjectRole';
import { MemberListItem } from '../shared/MemberListItem';
import type { Project } from '../../types';
import * as Icons from 'lucide-react';

const PROJECT_COLORS = ['#D85A30', '#5DCAA5', '#498FE9', '#B753B4', '#E9B949', '#6353B7'];
const PROJECT_ICONS = ['Box', 'Star', 'Heart', 'Zap', 'Shield', 'Target'];

interface Props {
  project: Project;
  onClose: () => void;
  onOpenInvite: () => void;
}

type Section = 'general' | 'members' | 'danger';

export function ProjectSettingsModal({ project, onClose, onOpenInvite }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('general');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(19,19,19,0.8)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-[700px] h-[500px] flex rounded-md shadow-2xl overflow-hidden" style={{ backgroundColor: '#201f1f', border: '1px solid #474553' }} onClick={e => e.stopPropagation()}>
        
        {/* Settings Nav */}
        <div className="w-48 flex flex-col shrink-0" style={{ backgroundColor: '#131313', borderRight: '1px solid #2a2a2a' }}>
          <div className="px-5 py-4 shrink-0">
            <h3 style={{ fontFamily: 'Inter', fontSize: '15px', fontWeight: 600, color: '#e5e2e1', letterSpacing: '-0.01em' }}>Project Settings</h3>
          </div>
          <div className="flex flex-col px-3 gap-1 mt-2">
            <button 
              onClick={() => setActiveSection('general')} 
              className={`px-3 py-2 text-left rounded-md transition-colors ${activeSection === 'general' ? 'bg-[#2a2a2a]' : 'hover:bg-[#1c1b1b]'}`}
              style={{ fontSize: '13px', color: activeSection === 'general' ? '#e5e2e1' : '#928f9e', fontWeight: 500 }}
            >
              General
            </button>
            <button 
              onClick={() => setActiveSection('members')} 
              className={`px-3 py-2 text-left rounded-md transition-colors ${activeSection === 'members' ? 'bg-[#2a2a2a]' : 'hover:bg-[#1c1b1b]'}`}
              style={{ fontSize: '13px', color: activeSection === 'members' ? '#e5e2e1' : '#928f9e', fontWeight: 500 }}
            >
              Members
            </button>
            <button 
              onClick={() => setActiveSection('danger')} 
              className={`px-3 py-2 text-left rounded-md transition-colors mt-4 ${activeSection === 'danger' ? 'bg-[#D85A3015]' : 'hover:bg-[#1c1b1b]'}`}
              style={{ fontSize: '13px', color: '#D85A30', fontWeight: 500 }}
            >
              Danger Zone
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#928f9e] hover:text-[#e5e2e1] transition-colors z-10"><X size={20} /></button>
          
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeSection === 'general' && <GeneralSection project={project} />}
            {activeSection === 'members' && <MembersSection projectId={project.id} onOpenInvite={() => { onClose(); onOpenInvite(); }} />}
            {activeSection === 'danger' && <DangerZoneSection project={project} />}
          </div>
        </div>

      </div>
    </div>
  );
}

function GeneralSection({ project }: { project: Project }) {
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState(project.color);
  const [icon, setIcon] = useState(project.icon);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const updateProject = useWorkspaceStore(s => s.updateProject);

  const isDirty = name.trim() !== project.name || color !== project.color || icon !== project.icon;
  const isValid = name.trim().length > 0 && name.trim().length <= 50;

  const handleSave = async () => {
    if (!isValid || !isDirty) return;
    setIsSaving(true);
    await updateProject(project.id, { name: name.trim(), color, icon });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col max-w-sm">
      <h2 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 500, color: '#e5e2e1', marginBottom: '24px' }}>General Settings</h2>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#928f9e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            maxLength={50}
            className="px-4 py-2 outline-none rounded-sm" 
            style={{ backgroundColor: '#131313', border: '1px solid #2a2a2a', color: '#e5e2e1', fontSize: '13px' }} 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#928f9e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</label>
          <div className="flex gap-3">
            {PROJECT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                style={{ backgroundColor: c, border: color === c ? '2px solid #fff' : '2px solid transparent' }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#928f9e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Icon</label>
          <div className="flex gap-2">
            {PROJECT_ICONS.map(i => {
              const Icon = (Icons as any)[i];
              return (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-colors"
                  style={{ backgroundColor: icon === i ? color + '30' : '#131313', color: icon === i ? color : '#928f9e', border: icon === i ? `1px solid ${color}50` : '1px solid #2a2a2a' }}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={!isDirty || !isValid || isSaving}
            className="px-6 py-2 rounded-sm transition-colors hover:bg-[#6056d6]"
            style={{ 
              backgroundColor: '#534AB7', 
              color: '#fff', 
              fontSize: '12px', 
              fontWeight: 600,
              opacity: (!isDirty || !isValid || isSaving) ? 0.5 : 1
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span style={{ color: '#5DCAA5', fontSize: '12px', fontWeight: 500 }}>Saved ✓</span>}
        </div>
      </div>
    </div>
  );
}

function MembersSection({ projectId, onOpenInvite }: { projectId: string; onOpenInvite: () => void }) {
  const members = useWorkspaceStore(s => s.members[projectId]) ?? [];
  const curRole = useProjectRole(projectId);
  const updateMemberRole = useWorkspaceStore(s => s.updateMemberRole);
  const removeMember = useWorkspaceStore(s => s.removeMember);

  return (
    <div className="flex flex-col h-full">
      <h2 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 500, color: '#e5e2e1', marginBottom: '24px' }}>Members</h2>
      <div className="flex flex-col gap-1 flex-1">
        {members.map(m => (
          <MemberListItem 
            key={m.id}
            member={m}
            currentUserRole={curRole || 'viewer'}
            onRoleChange={(userId, role) => updateMemberRole(projectId, userId, role)}
            onRemove={(userId) => removeMember(projectId, userId)}
          />
        ))}
        
        {curRole === 'owner' && (
          <button 
            onClick={onOpenInvite}
            className="mt-4 text-left self-start hover:underline transition-all"
            style={{ color: '#c5c0ff', fontSize: '13px', fontWeight: 500 }}
          >
            + Invite someone
          </button>
        )}
      </div>
    </div>
  );
}

function DangerZoneSection({ project }: { project: Project }) {
  const archiveProject = useWorkspaceStore(s => s.archiveProject);
  const deleteProject = useWorkspaceStore(s => s.deleteProject);

  return (
    <div className="flex flex-col max-w-md">
      <h2 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 500, color: '#D85A30', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle size={18} /> Danger Zone
      </h2>
      
      <div className="flex flex-col gap-6">
        <DangerRow 
          title="Archive project"
          description="Hide this project from the sidebar. You can restore it later."
          actionText="ARCHIVE"
          variant="outline"
          onConfirm={() => archiveProject(project.id)}
        />

        <div style={{ height: '1px', backgroundColor: '#2a2a2a' }} />

        <DangerRow 
          title="Delete project"
          description="Permanently delete this project and all its data. This cannot be undone."
          actionText="DELETE"
          variant="filled"
          requireConfirmText={project.name}
          onConfirm={() => deleteProject(project.id)}
        />
      </div>
    </div>
  );
}

interface DangerRowProps {
  title: string;
  description: string;
  actionText: string;
  variant: 'outline' | 'filled';
  requireConfirmText?: string;
  onConfirm: () => void;
}

function DangerRow({ title, description, actionText, variant, requireConfirmText, onConfirm }: DangerRowProps) {
  const [step, setStep] = useState<'idle' | 'confirming'>('idle');
  const [inputVal, setInputVal] = useState('');
  const timeoutRef = useRef<any>(null);

  const handleClick = () => {
    if (requireConfirmText) {
      setStep('confirming');
    } else {
      if (step === 'idle') {
        setStep('confirming');
        timeoutRef.current = setTimeout(() => setStep('idle'), 3000);
      } else {
        clearTimeout(timeoutRef.current);
        onConfirm();
      }
    }
  };

  const handleCancel = () => {
    setStep('idle');
    setInputVal('');
  };

  const isMatched = inputVal === requireConfirmText;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#e5e2e1' }}>{title}</span>
          <span style={{ fontSize: '13px', color: '#928f9e', lineHeight: 1.4 }}>{description}</span>
        </div>
        
        {(!requireConfirmText || step === 'idle') && (
          <button 
            onClick={handleClick}
            className="px-4 py-2 rounded-sm shrink-0 transition-all font-bold text-[11px] tracking-wider uppercase"
            style={{
              backgroundColor: variant === 'filled' ? '#D85A30' : 'transparent',
              border: variant === 'outline' ? '1px solid #D85A30' : 'none',
              color: variant === 'filled' ? '#fff' : '#D85A30',
            }}
          >
            {step === 'confirming' && !requireConfirmText ? `CONFIRM ${actionText}` : actionText}
          </button>
        )}
      </div>

      {step === 'confirming' && requireConfirmText && (
        <div className="flex flex-col gap-2 p-4 rounded-md" style={{ backgroundColor: '#D85A3010', border: '1px solid #D85A3030' }}>
          <label style={{ fontSize: '12px', color: '#e5e2e1' }}>Type <strong>{requireConfirmText}</strong> to confirm:</label>
          <div className="flex gap-2">
            <input 
              autoFocus
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') handleCancel(); if (e.key === 'Enter' && isMatched) onConfirm(); }}
              className="flex-1 px-3 py-1.5 rounded-sm outline-none"
              style={{ backgroundColor: '#131313', border: '1px solid #D85A3050', color: '#e5e2e1', fontSize: '13px' }}
            />
            <button 
              disabled={!isMatched}
              onClick={onConfirm}
              className="px-4 py-1.5 rounded-sm font-bold text-[11px] tracking-wider uppercase transition-all"
              style={{ backgroundColor: '#D85A30', color: '#fff', opacity: isMatched ? 1 : 0.5 }}
            >
              {actionText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
