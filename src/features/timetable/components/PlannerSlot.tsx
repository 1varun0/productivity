import { memo } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { slotToTime } from '../types';

interface PlannerSlotProps {
  slot: number;
  isDroppable: boolean;
  isOccupied: boolean;
  onDrop: (slot: number) => void;
}

const ROW_HEIGHT = 52;
const GRID_START_SLOT = 14;

export const PlannerSlot = memo(function PlannerSlot({ slot, isDroppable, isOccupied, onDrop }: PlannerSlotProps) {
  if (isOccupied || !isDroppable) return null;

  const slotsFromStart = slot - GRID_START_SLOT;
  const top = (slotsFromStart / 2) * ROW_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 z-10 flex items-center justify-center cursor-pointer transition-colors group"
      style={{
        top: `${top}px`,
        height: `${ROW_HEIGHT / 2}px`, // half-hour slot
        backgroundColor: '#1a1730',
        border: '1px dashed rgba(197, 192, 255, 0.4)',
      }}
      onClick={() => onDrop(slot)}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#c5c0ff')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(197, 192, 255, 0.4)')}
    >
      <div className="flex items-center gap-1 group-hover:text-[#e3dfff]" style={{
        fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px',
        letterSpacing: '0.08em', fontWeight: 700,
        color: '#7F77DD', textTransform: 'uppercase',
      }}>
        <ArrowDownToLine size={12} />
        Drop here to schedule ({slotToTime(slot)})
      </div>
    </div>
  );
});
