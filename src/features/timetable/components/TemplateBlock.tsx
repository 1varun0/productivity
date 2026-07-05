import { memo } from 'react';
import type { TemplateBlock as TBlock } from '../types';
import { slotToTime } from '../types';

interface TemplateBlockProps {
  block: TBlock;
  onClick: (block: TBlock) => void;
}

export const TemplateBlock = memo(function TemplateBlock({ block, onClick }: TemplateBlockProps) {
  // Each slot is 80px wide (160px per hour / 2 slots per hour)
  const slotWidth = 80;
  const gridStartSlot = 14; // 7am = slot 14

  const left = 64 + (block.start_slot - gridStartSlot) * slotWidth;
  const width = block.duration_slots * slotWidth;

  const startTime = slotToTime(block.start_slot);
  const endTime = slotToTime(block.start_slot + block.duration_slots);

  return (
    <div
      className="absolute z-10 overflow-hidden hover:opacity-90 cursor-pointer transition-opacity"
      style={{
        left: `${left}px`,
        width: `${width}px`,
        height: '64px',
        top: '0px',
        border: '1px solid #111111',
        borderLeftWidth: '2px',
        borderLeftColor: block.color,
        backgroundColor: `${block.color}1a`, // 10% opacity hex
      }}
      onClick={() => onClick(block)}
    >
      <div className="p-2 h-full flex flex-col justify-center">
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
          lineHeight: '18px', fontWeight: 400, color: block.color,
        }} className="leading-tight truncate">
          {block.name}
        </span>
        <span style={{
          fontFamily: 'Inter', fontSize: '9px', lineHeight: '12px',
          letterSpacing: '0.08em', fontWeight: 700, color: block.color,
          opacity: 0.7,
        }} className="mt-1 uppercase">
          {startTime} - {endTime}
        </span>
      </div>
    </div>
  );
});
