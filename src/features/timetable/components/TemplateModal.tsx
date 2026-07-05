import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { TemplateBlock } from '../types';
import { BLOCK_COLORS, BLOCK_COLOR_VALUES, CATEGORIES, DURATION_OPTIONS, DAYS, slotToTime } from '../types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: { name: string; category: string; color: string; start_slot: number; duration_slots: number; repeat_days: number[] }) => void;
  onDelete?: (id: string) => void;
  editingBlock?: TemplateBlock | null;
  preset?: { day: number; slot: number } | null;
}

export function TemplateModal({ isOpen, onClose, onSave, onDelete, editingBlock, preset }: TemplateModalProps) {
  const [name, setName] = useState('New Session');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [durationSlots, setDurationSlots] = useState(2);
  const [selectedColor, setSelectedColor] = useState<string>(BLOCK_COLORS.primary);
  const [repeatDays, setRepeatDays] = useState<number[]>([0]);
  const [startSlot, setStartSlot] = useState(14); // 7am default

  useEffect(() => {
    if (editingBlock) {
      setName(editingBlock.name);
      setCategory(editingBlock.category);
      setDurationSlots(editingBlock.duration_slots);
      setSelectedColor(editingBlock.color);
      setRepeatDays(editingBlock.repeat_days);
      setStartSlot(editingBlock.start_slot);
    } else if (preset) {
      setName('New Session');
      setCategory(CATEGORIES[0]);
      setDurationSlots(2);
      setSelectedColor(BLOCK_COLORS.primary);
      setRepeatDays([preset.day]);
      setStartSlot(preset.slot);
    }
  }, [editingBlock, preset]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ name, category, color: selectedColor, start_slot: startSlot, duration_slots: durationSlots, repeat_days: repeatDays });
    onClose();
  };

  const presetDayLabel = preset ? DAYS[preset.day] : '';
  const timeLabel = slotToTime(startSlot);
  const subtitle = editingBlock
    ? `${editingBlock.repeat_days.map(d => DAYS[d]).join(', ')} ${timeLabel}`
    : `${presetDayLabel} ${timeLabel}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
      <div className="w-[360px] flex flex-col" style={{ backgroundColor: '#131313', border: '1px solid #2a2a2a', borderRadius: '8px' }}>
        {/* Header */}
        <div className="p-5 flex justify-between items-start" style={{ borderBottom: '1px solid #1c1b1b' }}>
          <div>
            <h2 style={{ fontFamily: 'Inter', fontSize: '18px', lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: 500, color: '#e5e2e1', marginBottom: '4px' }}>
              {editingBlock ? 'Edit block' : 'Add block'}
            </h2>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#c8c4d5' }}>
              {subtitle}
            </p>
          </div>
          <button onClick={onClose} className="hover:text-[#e5e2e1] transition-colors" style={{ color: '#c8c4d5' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label style={{ fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#c8c4d5' }} className="uppercase">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 focus:outline-none transition-colors"
              style={{
                backgroundColor: '#0F0F0F', border: '1px solid #1c1b1b', borderRadius: '4px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: '18px',
                color: '#e5e2e1',
              }}
              onFocus={e => (e.target.style.borderColor = '#c5c0ff')}
              onBlur={e => (e.target.style.borderColor = '#1c1b1b')}
            />
          </div>

          {/* Category + Duration row */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label style={{ fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#c8c4d5' }} className="uppercase">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 focus:outline-none transition-colors appearance-none"
                style={{
                  backgroundColor: '#0F0F0F', border: '1px solid #1c1b1b', borderRadius: '4px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: '18px',
                  color: '#e5e2e1',
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label style={{ fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#c8c4d5' }} className="uppercase">Duration</label>
              <select
                value={durationSlots}
                onChange={e => setDurationSlots(Number(e.target.value))}
                className="w-full px-3 py-2 focus:outline-none transition-colors appearance-none"
                style={{
                  backgroundColor: '#0F0F0F', border: '1px solid #1c1b1b', borderRadius: '4px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: '18px',
                  color: '#e5e2e1',
                }}
              >
                {DURATION_OPTIONS.map(d => <option key={d.slots} value={d.slots}>{d.label}</option>)}
              </select>
            </div>
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-2 mt-1">
            <label style={{ fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#c8c4d5' }} className="uppercase">Color ID</label>
            <div className="flex gap-3 mt-1">
              {BLOCK_COLOR_VALUES.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="w-4 h-4 rounded-full transition-all"
                  style={{
                    backgroundColor: color,
                    border: selectedColor === color ? '1.5px solid white' : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (selectedColor !== color) (e.target as HTMLElement).style.borderColor = '#474553'; }}
                  onMouseLeave={e => { if (selectedColor !== color) (e.target as HTMLElement).style.borderColor = 'transparent'; }}
                />
              ))}
            </div>
          </div>

          {/* Repeat days (only for template) */}
          <div className="flex flex-col gap-2">
            <label style={{ fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#c8c4d5' }} className="uppercase">Repeat Days</label>
            <div className="flex gap-2 mt-1">
              {DAYS.map((day, idx) => (
                <button
                  key={day}
                  onClick={() => {
                    setRepeatDays(prev =>
                      prev.includes(idx)
                        ? prev.filter(d => d !== idx)
                        : [...prev, idx]
                    );
                  }}
                  className="px-2 py-1 transition-colors uppercase"
                  style={{
                    fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.08em', fontWeight: 700,
                    borderRadius: '2px',
                    backgroundColor: repeatDays.includes(idx) ? '#534ab7' : 'transparent',
                    color: repeatDays.includes(idx) ? '#fff' : '#c8c4d5',
                    border: `1px solid ${repeatDays.includes(idx) ? '#534ab7' : '#1c1b1b'}`,
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex justify-between items-center" style={{
          borderTop: '1px solid #1c1b1b', backgroundColor: '#0e0e0e',
          borderRadius: '0 0 8px 8px',
        }}>
          {editingBlock ? (
            <button
              onClick={() => { onDelete?.(editingBlock.id); onClose(); }}
              style={{ fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#ffb4ab' }}
              className="uppercase hover:opacity-70 transition-opacity"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 uppercase hover:text-[#e5e2e1] transition-colors"
              style={{ fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#c8c4d5' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 uppercase transition-colors"
              style={{
                fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700,
                backgroundColor: '#534ab7', color: 'white', border: '1px solid #534ab7',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#584fbc')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#534ab7')}
            >
              {editingBlock ? 'SAVE' : 'ADD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
