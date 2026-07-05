import { useRef, useEffect } from 'react';
import { hourToLabel } from '../types';
import type { TimetableBlock, DueDateMarker } from '../types';
import { TimetableRow } from './TimetableRow';
import { NowIndicator } from './NowIndicator';
import { WeekSummaryFooter } from './WeekSummaryFooter';

const CELL_HEIGHT = 68;
const DAY_COL_WIDTH = 90;
const HEADER_HEIGHT = 32;

interface TimetableGridProps {
  blocksByDay: Record<number, TimetableBlock[]>;
  today: number;
  isCompact?: boolean;
  currentWeekStart: Date;
  dueDateMarkers: Record<number, DueDateMarker[]>;
  onCellClick: (day: number, hour: number) => void;
  onBlockClick: (block: TimetableBlock) => void;
  onBlockContextMenu?: (block: TimetableBlock, e: React.MouseEvent) => void;
  onBlockDrop?: (day: number, hour: number, payload: any) => boolean;
}

export function TimetableGrid({ 
  blocksByDay, 
  today, 
  isCompact, 
  currentWeekStart,
  dueDateMarkers,
  onCellClick, 
  onBlockClick, 
  onBlockContextMenu, 
  onBlockDrop 
}: TimetableGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = [0, 1, 2, 3, 4, 5, 6];
  
  const cellWidth = isCompact ? 48 : 64;

  // Scroll to current time on mount
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        const currentHour = new Date().getHours();
        // Offset by 1 hour to give visual context, clamping at 0
        const scrollHour = Math.max(0, currentHour - 1);
        containerRef.current!.scrollLeft = scrollHour * cellWidth;
      }, 100);
    }
  }, [cellWidth]);

  return (
    <main
      ref={containerRef}
      className="flex-1 overflow-auto relative w-full timetable-scrollbar"
      style={{ backgroundColor: '#0f0f0f' }}
    >
      <div id="timetable-export-container" style={{ width: 'max-content', backgroundColor: '#0f0f0f' }}>
        {/* Header row (sticky) */}
        <div
          className="flex sticky top-0 z-30 w-max"
        style={{
          backgroundColor: '#0f0f0f',
          borderBottom: '1px solid #1e1e1e',
        }}
      >
        {/* Corner cell */}
        <div
          style={{
            width: DAY_COL_WIDTH,
            height: HEADER_HEIGHT,
            position: 'sticky',
            left: 0,
            zIndex: 40,
            backgroundColor: '#0f0f0f',
            borderRight: '1px solid #1e1e1e',
            borderBottom: '1px solid #111111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#2e2e2e',
            textTransform: 'uppercase',
          }}
        >
          DAY
        </div>

        {/* Hour headers */}
        <div className="flex">
          {hours.map(h => (
            <div
              key={h}
              style={{
                width: cellWidth,
                height: HEADER_HEIGHT,
                borderBottom: '1px solid #111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#c8c4d5',
                opacity: 0.5,
                flexShrink: 0,
                textTransform: 'uppercase',
              }}
            >
              {hourToLabel(h)}
            </div>
          ))}
        </div>
      </div>

      {/* Grid body */}
      <div className="flex flex-col w-max relative">
        {/* Day rows */}
        {days.map(d => {
          const actualDate = new Date(currentWeekStart);
          actualDate.setDate(actualDate.getDate() + d);

          return (
            <TimetableRow
              key={d}
              day={d}
              blocks={blocksByDay[d] ?? []}
              isToday={d === today}
              cellWidth={cellWidth}
              cellHeight={CELL_HEIGHT}
              dayColumnWidth={DAY_COL_WIDTH}
              actualDate={actualDate}
              markers={dueDateMarkers[d] ?? []}
              onCellClick={onCellClick}
              onBlockClick={onBlockClick}
              onBlockContextMenu={onBlockContextMenu}
              onBlockDrop={onBlockDrop}
            />
          );
        })}

        <NowIndicator dayColumnWidth={DAY_COL_WIDTH} cellWidth={cellWidth} />
        </div>
        
        {/* Week Summary Footer */}
        <WeekSummaryFooter blocks={Object.values(blocksByDay).flat()} />
      </div>
    </main>
  );
}
