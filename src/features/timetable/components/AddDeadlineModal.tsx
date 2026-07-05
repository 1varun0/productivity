import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface AddDeadlineModalProps {
  isOpen: boolean;
  defaultDate: Date;
  onClose: () => void;
  onAdd: (data: { name: string; date: string; color: string; notes?: string }) => void;
}

const COLOR_OPTIONS = [
  '#D85A30', // red
  '#BA7517', // amber
  '#534AB7', // purple
  '#0F6E56', // green
  '#993556', // pink
];

export function AddDeadlineModal({
  isOpen,
  defaultDate,
  onClose,
  onAdd,
}: AddDeadlineModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('New Deadline');
  const [dateStr, setDateStr] = useState(defaultDate.toISOString().split('T')[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('New Deadline');
      setDateStr(defaultDate.toISOString().split('T')[0]);
      setColor(COLOR_OPTIONS[0]);
      setNotes('');
      setTimeout(() => nameRef.current?.select(), 50);
    }
  }, [isOpen, defaultDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      date: dateStr,
      color,
      notes: notes.trim() || undefined,
    });
    onClose();
  }, [name, dateStr, color, notes, onAdd, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div
        className="relative flex flex-col w-full max-w-[340px] rounded-[10px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#161616',
          border: '0.5px solid #2a2a2a',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <h2 className="text-[13px] font-semibold text-[#ccc] tracking-wide">
            ADD DEADLINE
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#666] hover:text-[#eee] hover:bg-[#222] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#555] uppercase tracking-wider">
              Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#eee] focus:outline-none focus:border-[#444] transition-colors"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#555] uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={e => setDateStr(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#eee] focus:outline-none focus:border-[#444] transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#555] uppercase tracking-wider">
              Color
            </label>
            <div className="flex items-center space-x-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full border-[2px] transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#fff' : 'transparent',
                    transform: color === c ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-[#555] uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add context..."
              rows={2}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#eee] focus:outline-none focus:border-[#444] transition-colors resize-none placeholder:text-[#555]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-3 bg-[#111] border-t border-[#2a2a2a] space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[12px] font-medium text-[#888] hover:text-[#eee] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 text-[12px] font-medium rounded-[6px] transition-all active:scale-95 text-[#eee]"
            style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
            }}
          >
            Add Deadline
          </button>
        </div>
      </div>
    </div>
  );
}
