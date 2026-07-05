import { useState, useEffect } from 'react';
import { X, Briefcase, Rocket, Star, Globe, Code, Boxes } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useNavigate } from 'react-router-dom';
import { PROJECT_COLORS, PROJECT_ICONS } from '../../types';

const ICON_COMPONENTS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  briefcase: Briefcase,
  rocket: Rocket,
  star: Star,
  globe: Globe,
  code: Code,
  boxes: Boxes,
};

interface CreateProjectModalProps {
  onClose: () => void;
}

export function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(PROJECT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>(PROJECT_ICONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const createProject = useWorkspaceStore(s => s.createProject);
  const setActiveProject = useWorkspaceStore(s => s.setActiveProject);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim() || isCreating) return;
    setIsCreating(true);

    const newId = await createProject(name.trim(), selectedColor, selectedIcon);
    if (newId) {
      setActiveProject(newId);
      navigate(`/app/workspace/${newId}`);
    }

    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(19, 19, 19, 0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-[400px] flex flex-col"
        style={{
          backgroundColor: '#201f1f',
          border: '1px solid #474553',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{
            borderBottom: '1px solid #474553',
            backgroundColor: '#131313',
          }}
        >
          <h3
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              lineHeight: '24px',
              letterSpacing: '-0.01em',
              fontWeight: 500,
              color: '#e5e2e1',
            }}
          >
            New project
          </h3>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#928f9e' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#e5e2e1')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#928f9e')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                lineHeight: '12px',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: '#928f9e',
              }}
            >
              PROJECT NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
              }}
              placeholder="e.g. Website Redesign"
              autoFocus
              className="px-4 py-2 outline-none rounded-sm transition-colors"
              style={{
                backgroundColor: '#0e0e0e',
                border: '1px solid #474553',
                color: '#e5e2e1',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                lineHeight: '20px',
              }}
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1">
            <label
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                lineHeight: '12px',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: '#928f9e',
              }}
            >
              COLOR
            </label>
            <div className="flex gap-4">
              {PROJECT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="w-6 h-6 rounded-sm transition-all"
                  style={{
                    backgroundColor: color,
                    boxShadow:
                      selectedColor === color
                        ? `0 0 0 2px #131313, 0 0 0 4px ${color}`
                        : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="flex flex-col gap-1">
            <label
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                lineHeight: '12px',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: '#928f9e',
              }}
            >
              ICON
            </label>
            <div className="flex gap-4">
              {PROJECT_ICONS.map(iconName => {
                const IconComp = ICON_COMPONENTS[iconName];
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className="w-8 h-8 rounded-sm flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: isSelected ? '#2a2a2a' : '#0e0e0e',
                      border: isSelected
                        ? `1px solid ${selectedColor}`
                        : '1px solid #474553',
                      color: isSelected ? selectedColor : '#928f9e',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.borderColor = '#928f9e';
                        (e.currentTarget as HTMLElement).style.color = '#e5e2e1';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.borderColor = '#474553';
                        (e.currentTarget as HTMLElement).style.color = '#928f9e';
                      }
                    }}
                  >
                    {IconComp && <IconComp size={18} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end gap-4"
          style={{
            borderTop: '1px solid #474553',
            backgroundColor: '#131313',
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-sm transition-colors"
            style={{
              border: '1px solid #474553',
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              lineHeight: '12px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#928f9e',
              textTransform: 'uppercase',
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
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="px-6 py-2 rounded-sm transition-colors"
            style={{
              backgroundColor: '#0e0e0e',
              border: `1px solid ${selectedColor}`,
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              lineHeight: '12px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: selectedColor,
              textTransform: 'uppercase',
              opacity: !name.trim() || isCreating ? 0.5 : 1,
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
