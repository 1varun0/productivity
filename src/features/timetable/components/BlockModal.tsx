import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import type { TimetableBlock, BlockFormData, Category } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  FULL_DAY_NAMES,
  hourTo12,
  hasConflict,
  getConflictingBlock,
} from '../types';

const CATEGORIES_LIST: Category[] = ['sleep', 'class', 'work', 'health', 'meals', 'personal', 'commute', 'free'];
const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

interface BlockModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  day: number;
  hour: number;
  block?: TimetableBlock | null;
  allBlocks: TimetableBlock[];
  onClose: () => void;
  onAdd: (day: number, startHour: number, data: BlockFormData) => void;
  onUpdate: (id: string, data: BlockFormData) => void;
  onDelete: (id: string) => void;
}

export function BlockModal({
  isOpen,
  mode,
  day,
  hour,
  block,
  allBlocks,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
}: BlockModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  const defaultCategory: Category = block?.category as Category ?? 'class';
  const [name, setName] = useState(block?.name ?? 'New Task');
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [color, setColor] = useState(block?.color ?? (CATEGORY_COLORS[defaultCategory as keyof typeof CATEGORY_COLORS]?.border || '#534AB7'));
  const [duration, setDuration] = useState(block?.duration ?? 1);
  const [notes, setNotes] = useState(block?.notes ?? '');
  const [conflictMsg, setConflictMsg] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      const cat = (block?.category as Category) ?? 'class';
      setName(block?.name ?? 'New Task');
      setCategory(cat);
      setColor(block?.color ?? (CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]?.border || '#534AB7'));
      setDuration(block?.duration ?? 1);
      setNotes(block?.notes ?? '');
      setConflictMsg('');
      setShowCustomInput(!CATEGORIES_LIST.includes(cat as any));
      setTimeout(() => nameRef.current?.select(), 50);
    }
  }, [isOpen, block]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleCategoryClick = useCallback((cat: Category) => {
    setCategory(cat);
    setColor(CATEGORY_COLORS[cat].border);
  }, []);

  const handleSubmit = useCallback(() => {
    const formData: BlockFormData = { name, category, color, duration, notes: notes || undefined };
    const excludeId = mode === 'edit' ? block?.id : undefined;

    if (hasConflict(allBlocks, day, hour, duration, excludeId)) {
      const conflicting = getConflictingBlock(allBlocks, day, hour, duration, excludeId);
      setConflictMsg(`This overlaps with ${conflicting?.name ?? 'another block'}`);
      return;
    }

    if (mode === 'add') {
      onAdd(day, hour, formData);
    } else if (block) {
      onUpdate(block.id, formData);
    }
    onClose();
  }, [name, category, color, duration, notes, mode, block, day, hour, allBlocks, onAdd, onUpdate, onClose]);

  const handleDelete = useCallback(() => {
    if (block) {
      onDelete(block.id);
      onClose();
    }
  }, [block, onDelete, onClose]);

  if (!isOpen) return null;

  const subtitle = `${FULL_DAY_NAMES[day]} · ${hourTo12(hour)}`;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="flex flex-col"
        style={{
          width: 280,
          backgroundColor: '#161616',
          border: '1px solid #1e1e1e',
          borderRadius: 4,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            height: 40,
            borderBottom: '1px solid #1e1e1e',
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              lineHeight: '14px',
              letterSpacing: '0.01em',
              color: '#e5e2e1',
              textTransform: 'uppercase',
            }}
          >
            {mode === 'add' ? 'Add block' : 'Edit block'}
          </span>
          <button
            onClick={onClose}
            style={{ color: '#c8c4d5' }}
            className="hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4" style={{ padding: 16 }}>
          {/* Subtitle */}
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              color: '#928f9e',
              letterSpacing: '0.01em',
            }}
          >
            {subtitle}
          </span>

          {/* Name field */}
          <div className="flex flex-col gap-1">
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#c8c4d5',
                textTransform: 'uppercase',
              }}
            >
              NAME
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                backgroundColor: '#0f0f0f',
                border: '1px solid #1e1e1e',
                color: '#e5e2e1',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                lineHeight: '20px',
                padding: 8,
                borderRadius: 4,
                outline: 'none',
                width: '100%',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#534AB7')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1">
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#c8c4d5',
                textTransform: 'uppercase',
              }}
            >
              DURATION
            </label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              style={{
                backgroundColor: '#0f0f0f',
                border: '1px solid #1e1e1e',
                color: '#e5e2e1',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                lineHeight: '20px',
                padding: 8,
                borderRadius: 4,
                outline: 'none',
                width: '100%',
                appearance: 'none' as const,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#534AB7')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
            >
              {DURATION_OPTIONS.map(d => (
                <option key={d} value={d}>{d} {d === 1 ? 'hour' : 'hours'}</option>
              ))}
            </select>
          </div>

          {/* Category dots */}
          <div
            className="flex flex-col gap-2"
            style={{ paddingTop: 8, borderTop: '1px solid #1e1e1e' }}
          >
            <div className="flex justify-between items-center">
              <label
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#c8c4d5',
                  textTransform: 'uppercase',
                }}
              >
                CATEGORY
              </label>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 10, color: '#928f9e', fontFamily: "'Inter', sans-serif" }}>
                  COLOR
                </span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  title="Override color"
                  style={{
                    width: 20,
                    height: 20,
                    padding: 0,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES_LIST.filter(c => c !== 'free').map(cat => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    title={CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                    onClick={() => {
                      handleCategoryClick(cat);
                      setShowCustomInput(false);
                    }}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS].border,
                      border: isSelected ? '2px solid #ffffff' : '2px solid transparent',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  />
                );
              })}
              
              {!showCustomInput && (
                <button
                  type="button"
                  title="Add custom category"
                  onClick={() => setShowCustomInput(true)}
                  className="hover:bg-[#2a2a2a] hover:text-white transition-colors"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #3a3a3a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#928f9e',
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
              )}

              {showCustomInput && (
                <input
                  type="text"
                  placeholder="Custom name..."
                  value={CATEGORIES_LIST.includes(category as any) ? '' : category}
                  onChange={e => setCategory(e.target.value)}
                  autoFocus
                  style={{
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #1e1e1e',
                    color: '#e5e2e1',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 4,
                    outline: 'none',
                    flex: 1,
                    minWidth: 80,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#534AB7')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
                />
              )}
            </div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                color: '#666666',
                marginTop: 2,
              }}
            >
              {CATEGORIES_LIST.includes(category as any) ? CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] : category || 'Custom'}
            </span>
          </div>

          {/* Notes field */}
          <div className="flex flex-col gap-1">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#928f9e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Notes
            </span>
            <textarea
              placeholder="e.g. Bring textbook"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                backgroundColor: '#0f0f0f',
                border: '1px solid #1e1e1e',
                color: '#e5e2e1',
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                padding: '8px',
                borderRadius: 4,
                outline: 'none',
                minHeight: 48,
                resize: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#534AB7')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
            />
          </div>

          {/* Conflict message */}
          {conflictMsg && (
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: '#D85A30',
              }}
            >
              {conflictMsg}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <button
                onClick={handleDelete}
                className="uppercase"
                style={{
                  backgroundColor: '#1e1010',
                  border: '1px solid #3a1a1a',
                  color: '#ff6b6b',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 12,
                  paddingRight: 12,
                  borderRadius: 4,
                  transition: 'background-color 0.15s ease',
                }}
              >
                DELETE
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="flex-1 uppercase"
              style={{
                backgroundColor: '#1E1E1E',
                border: '1px solid #534AB7',
                color: '#ffffff',
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 4,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#534AB7')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1E1E1E')}
            >
              {mode === 'add' ? 'CREATE BLOCK' : 'UPDATE BLOCK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
