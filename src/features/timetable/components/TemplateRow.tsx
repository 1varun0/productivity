import { memo } from 'react';
import { Plus } from 'lucide-react';
import type { TemplateBlock as TBlock } from '../types';
import { TemplateBlock } from './TemplateBlock';
import { DAYS, GRID_START_SLOT } from '../types';

interface TemplateRowProps {
  dayIndex: number;  // 0=MON ... 6=SUN
  blocks: TBlock[];
  isToday: boolean;
  onCellClick: (day: number, slot: number) => void;
  onBlockClick: (block: TBlock) => void;
}

export const TemplateRow = memo(function TemplateRow({
  dayIndex, blocks, isToday, onCellClick, onBlockClick
}: TemplateRowProps) {
  const dayLabel = DAYS[dayIndex];
  const isWeekend = dayIndex >= 5;

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Calculate which slot was clicked based on mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const slotWidth = 80; // each 30min slot = 80px
    const slotOffset = Math.floor(x / slotWidth);
    const clickedSlot = GRID_START_SLOT + slotOffset;
    onCellClick(dayIndex, clickedSlot);
  };

  return (
    <div
      className="flex h-[64px] group relative cursor-pointer transition-colors"
      style={{
        borderBottom: '1px solid #1c1b1b',
        backgroundColor: isToday ? '#0d0d18' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isToday) (e.currentTarget as HTMLElement).style.backgroundColor = '#131313';
      }}
      onMouseLeave={(e) => {
        if (!isToday) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      {/* Day label (sticky left) */}
      <div
        className="w-[64px] shrink-0 sticky left-0 z-10 flex items-center justify-center"
        style={{
          borderRight: '1px solid #1c1b1b',
          backgroundColor: isToday ? '#0d0d18' : '#0e0e0e',
        }}
      >
        <span style={{
          fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px',
          letterSpacing: '0.08em', fontWeight: 700,
          color: isToday ? '#7F77DD' : isWeekend ? '#928f9e' : '#c8c4d5',
        }} className="uppercase">
          {dayLabel}
        </span>
      </div>

      {/* Row content area (clickable to add) */}
      <div className="flex-1 relative" onClick={handleRowClick}>
        {/* Hover "+" indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Plus size={24} style={{ color: '#474553' }} />
        </div>

        {/* Blocks for this row */}
        {blocks.map(block => (
          <TemplateBlock
            key={block.id}
            block={block}
            onClick={(b) => { onBlockClick(b); }}
          />
        ))}
      </div>
    </div>
  );
});
