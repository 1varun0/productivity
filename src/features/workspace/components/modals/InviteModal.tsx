import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useProjectRole } from '../../hooks/useProjectRole';
import { MemberListItem } from '../shared/MemberListItem';
import type { ProjectRole } from '../../types';



interface InviteModalProps { projectId: string; onClose: () => void; }

export function InviteModal({ projectId, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>('member');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'duplicate'>('idle');
  
  const members = useWorkspaceStore(s => s.members[projectId]) ?? [];
  const pendingInvites = useWorkspaceStore(s => s.pendingInvites[projectId]) ?? [];
  const fetchPendingInvites = useWorkspaceStore(s => s.fetchPendingInvites);
  const sendInvite = useWorkspaceStore(s => s.sendInvite);
  const revokeInvite = useWorkspaceStore(s => s.revokeInvite);
  const removeMember = useWorkspaceStore(s => s.removeMember);
  const updateMemberRole = useWorkspaceStore(s => s.updateMemberRole);
  const curRole = useProjectRole(projectId);
  const isOwner = curRole === 'owner';
  const availableRoles: ProjectRole[] = isOwner ? ['viewer', 'member', 'owner'] : ['viewer', 'member'];

  useEffect(() => {
    fetchPendingInvites(projectId);
  }, [projectId, fetchPendingInvites]);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleInvite = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) return;

    // Duplicate check
    const isMember = members.some(m => m.profile?.username?.toLowerCase() === trimmedEmail);
    if (isMember) {
      setStatus('duplicate');
      return;
    }

    setStatus('sending');
    try {
      await sendInvite(projectId, trimmedEmail, role);
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 2000);
      await fetchPendingInvites(projectId); // Refresh to be safe
    } catch (e) {
      setStatus('error');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    await removeMember(projectId, userId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(19,19,19,0.8)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-[440px] max-h-[80vh] flex flex-col rounded-md shadow-2xl" style={{ backgroundColor: '#201f1f', border: '1px solid #474553' }} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 flex justify-between items-center shrink-0 rounded-t-md" style={{ borderBottom: '1px solid #474553', backgroundColor: '#131313' }}>
          <h3 style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 500, color: '#e5e2e1', letterSpacing: '-0.01em' }}>Invite members</h3>
          <button onClick={onClose} style={{ color: '#928f9e' }} className="hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              value={email} 
              onChange={e => { setEmail(e.target.value); setStatus('idle'); }} 
              onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }} 
              placeholder="teammate@email.com" 
              autoFocus 
              className="px-4 py-2 outline-none rounded-sm transition-colors" 
              style={{ backgroundColor: '#0e0e0e', border: status === 'duplicate' ? '1px solid #D85A30' : '1px solid #474553', color: '#e5e2e1', fontFamily: 'Inter', fontSize: '13px' }} 
            />
            
            <div className="flex items-center justify-between h-4">
              {status === 'duplicate' && <span style={{ color: '#D85A30', fontSize: '11px', fontWeight: 500 }}>Already a member</span>}
              {status === 'success' && <span style={{ color: '#5DCAA5', fontSize: '11px', fontWeight: 500 }}>Invite sent ✓</span>}
              {status === 'error' && <span style={{ color: '#D85A30', fontSize: '11px', fontWeight: 500 }}>Failed to send invite</span>}
              {status === 'idle' || status === 'sending' ? <span /> : null}
            </div>

            <div className="flex gap-0 mt-1">
              {availableRoles.map(r => (
                <button key={r} onClick={() => setRole(r)} className="flex-1 py-1.5 first:rounded-l-sm last:rounded-r-sm transition-colors" style={{ backgroundColor: role === r ? '#2a2a2a' : '#0e0e0e', border: role === r ? '1px solid #c5c0ff' : '1px solid #474553', color: role === r ? '#c5c0ff' : '#928f9e', fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>{r}</button>
              ))}
            </div>
            
            <button 
              onClick={handleInvite} 
              disabled={!validateEmail(email.trim()) || status === 'sending'} 
              className="px-4 py-2 mt-1 rounded-sm flex items-center justify-center gap-2 transition-all hover:bg-[#6056d6]" 
              style={{ 
                backgroundColor: '#534AB7', 
                color: '#fff', 
                fontFamily: 'Inter', 
                fontSize: '10px', 
                letterSpacing: '0.08em', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                opacity: (!validateEmail(email.trim()) || status === 'sending') ? 0.5 : 1 
              }}
            >
              {status === 'sending' ? <><Loader2 size={12} className="animate-spin" /> Sending...</> : 'Send Invite'}
            </button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              <span style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.08em', fontWeight: 700, color: '#928f9e', marginBottom: '4px' }}>MEMBERS</span>
              {members.map(m => (
                <MemberListItem
                  key={m.id}
                  member={m}
                  currentUserRole={curRole || 'viewer'}
                  onRoleChange={(userId, role) => updateMemberRole(projectId, userId, role)}
                  onRemove={handleRemoveMember}
                />
              ))}
            </div>
          )}

          {pendingInvites.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              <span style={{ fontFamily: 'Inter', fontSize: '10px', letterSpacing: '0.08em', fontWeight: 700, color: '#928f9e', marginBottom: '4px' }}>PENDING</span>
              {pendingInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 group" style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '13px', color: '#e5e2e1', fontFamily: 'Inter' }}>{inv.invited_email}</span>
                    <span style={{ fontSize: '11px', color: '#928f9e', fontFamily: 'Inter' }}>Pending · <span className="uppercase text-[9px] font-bold tracking-wider">{inv.role}</span></span>
                  </div>
                  {isOwner && (
                    <button onClick={() => revokeInvite(inv.id, projectId)} style={{ color: '#928f9e' }} className="opacity-0 group-hover:opacity-100 hover:text-[#D85A30] transition-all p-1" title="Revoke invite"><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
