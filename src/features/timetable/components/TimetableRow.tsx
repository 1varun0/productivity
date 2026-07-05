import { memo } from 'react';
import { DAYS } from '../types';
import type { TimetableBlock, DueDateMarker } from '../types';
import { TimetableCell } from './TimetableCell';
import { DueDateMarkerRow } from './DueDateMarkerRow';

interface TimetableRowProps {
  day: number;
  blocks: TimetableBlock[];
  isToday: boolean;
  cellWidth: number;
  cellHeight: number;
  dayColumnWidth: number;
  actualDate: Date;
  markers?: DueDateMarker[];
  onCellClick: (day: number, hour: number) => void;
  onBlockClick: (block: TimetableBlock) => void;
  onBlockContextMenu?: (block: TimetableBlock, e: React.MouseEvent) => void;
  onBlockDrop?: (day: number, hour: number, payload: any) => boolean;
}

export const TimetableRow = memo(function TimetableRow({
  day,
  blocks,
  isToday,
  cellWidth,
  cellHeight,
  dayColumnWidth,
  actualDate,
  markers = [],
  onCellClick,
  onBlockClick,
  onBlockContextMenu,
  onBlockDrop,
}: TimetableRowProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div
      className="flex relative w-max"
      style={{
        backgroundColor: isToday ? '#0d0d18' : undefined,
      }}
    >
      {/* Day label — sticky left */}
      <div
        className="flex flex-col items-center justify-center sticky left-0 z-30 shrink-0"
        style={{
          width: dayColumnWidth,
          borderRight: isToday ? '1px solid #1e1e1e' : '1px solid #111111',
          borderBottom: isToday ? '1px solid #1e1e1e' : '1px solid #111111',
          backgroundColor: isToday ? '#0d0d18' : '#0f0f0f',
        }}
      >
        <span className="text-[10px] uppercase font-bold" style={{ color: isToday ? '#7F77DD' : '#555' }}>
          {DAYS[day].slice(0, 3)}
        </span>
        <span className="text-[11px]" style={{ color: isToday ? '#AFA9EC' : '#777' }}>
          {actualDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {markers.length > 0 && (
          <div className="flex gap-[3px] mt-1 items-center">
            {markers.slice(0, 3).map(m => (
              <div 
                key={m.id} 
                className="w-[5px] h-[5px] rounded-full" 
                style={{ background: m.is_overdue ? '#D85A30' : m.color }} 
                title={m.name} 
              />
            ))}
            {markers.length > 3 && (
              <span className="text-[9px] text-[#444] leading-none">+{markers.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Content wrapper */}
      <div className="flex flex-col relative w-max">
        {markers.length > 0 && (
          <DueDateMarkerRow markers={markers} dayColumnWidth={0} cellWidth={cellWidth} />
        )}
        <div className="flex relative w-max" style={{ height: cellHeight }}>
          {hours.map(hour => (
            <TimetableCell
              key={hour}
              day={day}
              hour={hour}
              blocks={blocks}
              isToday={isToday}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              onCellClick={onCellClick}
              onBlockClick={onBlockClick}
              onBlockContextMenu={onBlockContextMenu}
              onBlockDrop={onBlockDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
