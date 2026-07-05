import type { ProjectMember, ProjectRole } from '../../types';

interface MemberListItemProps {
  member: ProjectMember;
  currentUserRole: ProjectRole;
  onRoleChange: (userId: string, role: ProjectRole) => void;
  onRemove: (userId: string) => void;
}

const ROLES: ProjectRole[] = ['viewer', 'member', 'owner'];

export function MemberListItem({ member: m, currentUserRole, onRoleChange, onRemove }: MemberListItemProps) {
  const isOwner = currentUserRole === 'owner';
  const name = m.profile?.username || m.user_id;
  const displayName = m.profile?.username || m.user_id.slice(0, 12);
  const initial = name.charAt(0).toUpperCase();

  const handleRemove = () => {
    if (confirm(`Remove ${name}?`)) {
      onRemove(m.user_id);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 group" style={{ borderBottom: '1px solid #2a2a2a' }}>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#2a2a2a', fontSize: '10px', color: '#e5e2e1' }}>
          {initial}
        </div>
        <div className="flex flex-col">
          <span style={{ fontSize: '13px', color: '#e5e2e1', fontFamily: 'Inter' }}>
            {displayName}
          </span>
        </div>
        
        {isOwner ? (
          <select 
            value={m.role} 
            onChange={(e) => onRoleChange(m.user_id, e.target.value as ProjectRole)}
            className="px-1.5 py-0.5 rounded-sm outline-none cursor-pointer hover:bg-[#2a2a2a] transition-colors ml-1"
            style={{ fontSize: '9px', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase', color: '#928f9e', backgroundColor: '#1c1b1b', border: '1px solid #474553', appearance: 'none' }}
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        ) : (
          <span className="px-1.5 py-0.5 rounded-sm ml-1" style={{ fontSize: '9px', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase', color: '#928f9e', backgroundColor: '#1c1b1b' }}>
            {m.role}
          </span>
        )}
      </div>
      {isOwner && m.role !== 'owner' && (
        <button 
          onClick={handleRemove} 
          style={{ color: '#928f9e', fontSize: '11px', fontWeight: 500 }} 
          className="opacity-0 group-hover:opacity-100 hover:text-[#D85A30] transition-all"
        >
          Remove
        </button>
      )}
    </div>
  );
}
