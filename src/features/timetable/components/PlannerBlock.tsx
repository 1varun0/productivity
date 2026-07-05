import { memo } from 'react';
import { X } from 'lucide-react';
import type { DayBlock } from '../types';
import { slotToTime } from '../types';

interface PlannerBlockProps {
  block: DayBlock;
  onRemove?: (id: string, taskId: string | null) => void;
}

const ROW_HEIGHT = 52; // px per hour
const GRID_START_SLOT = 14; // 7am

export const PlannerBlock = memo(function PlannerBlock({ block, onRemove }: PlannerBlockProps) {
  const slotsFromStart = block.start_slot - GRID_START_SLOT;
  const top = (slotsFromStart / 2) * ROW_HEIGHT; // 2 slots per hour
  const height = (block.duration_slots / 2) * ROW_HEIGHT;
  const startTime = slotToTime(block.start_slot);
  const endTime = slotToTime(block.start_slot + block.duration_slots);

  // Template blocks (locked) — non-interactive base layer
  if (block.locked) {
    return (
      <div
        className="absolute left-0 right-0 z-0 flex items-center px-3 pointer-events-none"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: 'rgba(53, 53, 52, 0.1)',
          borderLeft: '1.5px solid rgba(146, 143, 158, 0.3)',
        }}
      >
        <span style={{
          fontFamily: 'Inter', fontSize: '9px', lineHeight: '12px',
          letterSpacing: '0.08em', fontWeight: 700,
          color: '#928f9e', // outline-variant
          textTransform: 'uppercase',
        }}>
          {block.name} · Template
        </span>
      </div>
    );
  }

  // Scheduled blocks — interactive
  return (
    <div
      className="absolute left-0 right-12 z-20 flex flex-col justify-between px-3 py-2"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `${block.color}1a`,
        border: `1px solid ${block.color}4d`, // 30% opacity
        borderLeft: `2px solid ${block.color}`,
      }}
    >
      <div>
        <div style={{
          fontFamily: 'Inter', fontSize: '12px', fontWeight: 500,
          color: block.color, lineHeight: '16px',
        }} className="leading-tight">
          {block.name}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
          color: `${block.color}b3`, marginTop: '2px',
        }}>
          {startTime} - {endTime}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span style={{
          fontFamily: 'Inter', fontSize: '8px', letterSpacing: '0.08em',
          fontWeight: 700, color: `${block.color}80`, textTransform: 'uppercase',
        }}>
          {block.category}
        </span>
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(block.id, block.task_id ?? null); }}
            className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
            style={{ color: '#ffb4ab' }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
});
