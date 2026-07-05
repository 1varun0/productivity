import { memo } from 'react';
import { FileText } from 'lucide-react';
import type { TimetableBlock } from '../types';
import { CATEGORY_COLORS, formatHourRange } from '../types';
import type { Category } from '../types';

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface TimetableBlockCardProps {
  block: TimetableBlock;
  cellWidth: number;
  cellHeight: number;
  onBlockClick: (block: TimetableBlock) => void;
  onBlockContextMenu?: (block: TimetableBlock, e: React.MouseEvent) => void;
}

export const TimetableBlockCard = memo(function TimetableBlockCard({ block, cellWidth, cellHeight, onBlockClick, onBlockContextMenu }: TimetableBlockCardProps) {
  const colors = CATEGORY_COLORS[block.category as Category] ?? CATEGORY_COLORS.free;
  const width = block.duration * cellWidth - 4;
  const mainColor = block.color || colors.border;

  return (
    <div
      className="absolute cursor-pointer group"
      style={{
        top: 2,
        bottom: 2,
        left: 0,
        width,
        borderRadius: 4,
        zIndex: 10,
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: 4,
        borderLeft: `2px solid ${mainColor}`,
        backgroundColor: hexToRgba(mainColor, 0.1),
        transition: 'filter 0.1s ease',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onBlockClick(block);
      }}
      onContextMenu={(e) => {
        if (onBlockContextMenu) {
          e.preventDefault();
          e.stopPropagation();
          onBlockContextMenu(block, e);
        }
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
      }}
    >
      <div 
        className={`flex ${cellHeight <= 32 ? 'flex-row items-center gap-2' : 'flex-col'} h-full`} 
        style={{ color: mainColor, minWidth: 0, width: '100%' }}
      >
        <div className="flex items-start gap-1 w-full">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              lineHeight: 1.2,
              paddingBottom: 2,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {block.name}
          </span>
          {block.notes && <FileText size={10} style={{ opacity: 0.7, marginTop: 2, flexShrink: 0 }} />}
        </div>
        {block.duration >= 2 && (
          <span
            style={{
              display: 'block',
              width: '100%',
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              opacity: 0.7,
              marginTop: cellHeight <= 32 ? 0 : 2,
              lineHeight: 1.2,
              paddingBottom: 2,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflow: 'hidden',
            }}
          >
            {formatHourRange(block.start_hour, block.duration)}
          </span>
        )}
      </div>
    </div>
  );
});
