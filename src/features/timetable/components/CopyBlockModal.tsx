import { useState } from 'react';
import type { TimetableBlock } from '../types';
import { DAYS } from '../types';

interface CopyBlockModalProps {
  block: TimetableBlock;
  onClose: () => void;
  onCopy: (selectedDays: number[]) => void;
}

export function CopyBlockModal({ block, onClose, onCopy }: CopyBlockModalProps) {
  // Pre-select the day the block is currently on? Maybe not necessary, but good UX.
  // Actually, usually you want to copy to *other* days, so we can leave it unchecked or check it and let them uncheck.
  // Let's just leave all unchecked by default.
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCopy = () => {
    if (selectedDays.length === 0) {
      onClose();
      return;
    }
    onCopy(selectedDays);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div 
        className="w-[320px] rounded-xl flex flex-col overflow-hidden shadow-2xl"
        style={{
          backgroundColor: '#0F0F0F',
          border: '1px solid #1E1E1E'
        }}
      >
        <div className="px-5 py-4 border-b border-[#1E1E1E] flex flex-col gap-1">
          <h2 className="text-[14px] font-medium text-[#E5E2E1] m-0">Copy Block</h2>
          <p className="text-[12px] text-[#928f9e] m-0">
            Copy "{block.name}" to other days
          </p>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {DAYS.map((dayName, idx) => (
              <label 
                key={idx} 
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-[#1A1A1A]"
                style={{
                  backgroundColor: selectedDays.includes(idx) ? '#1A1A1A' : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedDays.includes(idx)}
                  onChange={() => toggleDay(idx)}
                  className="w-4 h-4 rounded border-[#333] bg-[#0F0F0F] text-[#534AB7] focus:ring-[#534AB7] focus:ring-offset-0 focus:ring-offset-transparent"
                />
                <span className="text-[13px] text-[#C8C4D5]">{dayName}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[#1E1E1E] flex justify-end gap-2 bg-[#0A0A0A]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium transition-colors"
            style={{ color: '#928f9e', backgroundColor: 'transparent' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={selectedDays.length === 0}
            className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{ 
              backgroundColor: selectedDays.length === 0 ? '#1A1A1A' : '#534AB7', 
              color: selectedDays.length === 0 ? '#666' : '#FFFFFF',
              boxShadow: selectedDays.length === 0 ? 'none' : '0 0 10px rgba(83, 74, 183, 0.3)'
            }}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
