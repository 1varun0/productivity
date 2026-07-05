import React, { useState } from 'react';
import type { DueDateMarker } from '../types';
import { Flag } from 'lucide-react';

interface DueDateMarkerRowProps {
  markers: DueDateMarker[];
  dayColumnWidth: number;
  cellWidth: number;
}

// Simple helper to safely extract hour from date string if present
function getMarkerHour(dateStr: string): number {
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.getHours();
    }
  }
  return 23; // Default to 11 PM
}

export const DueDateMarkerRow = React.memo(function DueDateMarkerRow({ markers, dayColumnWidth, cellWidth }: DueDateMarkerRowProps) {
  if (markers.length === 0) return null;

  return (
    <div 
      className="relative flex items-center w-full"
      style={{
        height: '20px',
        marginLeft: `${dayColumnWidth}px`,
        borderBottom: '0.5px solid rgba(255, 255, 255, 0.02)'
      }}
    >
      {markers.map((marker, i) => {
        const hour = marker.type === 'deadline' ? 0 : getMarkerHour(marker.date);
        const leftPos = hour * cellWidth; // dynamic spacing
        
        // Stack markers visually if they overlap (simple offset)
        const offset = i * 4; // slight diagonal stacking if same hour, but normally they are sorted
        
        const isOverdue = marker.is_overdue;
        const bgColor = isOverdue ? '#3a1a1a' : `${marker.color}1E`; // 1E is ~12% opacity
        const borderColor = isOverdue ? '#D85A30' : marker.color;
        const textColor = isOverdue ? '#D85A30' : marker.color;

        return (
          <div
            key={`${marker.id}-${i}`}
            className="absolute top-1/2 -translate-y-1/2 flex items-center px-1.5 overflow-hidden group cursor-default"
            style={{
              left: `${leftPos + offset}px`,
              height: '16px',
              maxWidth: '120px',
              borderRadius: '3px',
              backgroundColor: bgColor,
              borderLeft: `2px solid ${borderColor}`,
              zIndex: 10 + i,
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              window.dispatchEvent(new CustomEvent('show-marker-tooltip', {
                detail: { marker, rect }
              }));
            }}
            onMouseLeave={() => {
              window.dispatchEvent(new CustomEvent('hide-marker-tooltip'));
            }}
          >
            {marker.type === 'deadline' && (
              <span className="mr-1 text-[9px]" style={{ color: textColor }}>⚑</span>
            )}
            {marker.type === 'task' && hour === 23 && !marker.is_overdue && (
              <Flag size={9} className="mr-1" style={{ color: textColor }} />
            )}
            <span 
              className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis font-medium"
              style={{ color: textColor }}
            >
              {marker.name}
            </span>
          </div>
        );
      })}
    </div>
  );
});

// A portal component you can drop once in TimetablePage to render the tooltip
export function MarkerTooltip() {
  const [data, setData] = useState<{ marker: DueDateMarker; rect: DOMRect } | null>(null);

  React.useEffect(() => {
    const show = (e: any) => setData(e.detail);
    const hide = () => setData(null);
    window.addEventListener('show-marker-tooltip', show);
    window.addEventListener('hide-marker-tooltip', hide);
    return () => {
      window.removeEventListener('show-marker-tooltip', show);
      window.removeEventListener('hide-marker-tooltip', hide);
    };
  }, []);

  if (!data) return null;

  const { marker, rect } = data;
  
  // Format date nicely
  const d = new Date(marker.date);
  const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const priorityLabel = marker.is_priority ? ' · High priority' : '';
  const overdueLabel = marker.is_overdue ? ' · OVERDUE' : '';

  return (
    <div
      className="fixed z-[9999] pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top - 4}px`,
        transform: 'translate(-50%, -100%)',
        backgroundColor: '#1e1e1e',
        border: '0.5px solid #2a2a2a',
        color: '#ccc',
        fontSize: '11px',
        borderRadius: '5px',
        padding: '5px 8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}
    >
      <div className="font-semibold text-[#eee] mb-0.5">{marker.name}</div>
      <div className="text-[#888] text-[10px]">
        Due: {dateLabel}{priorityLabel}
        {overdueLabel && <span className="text-[#D85A30] font-bold">{overdueLabel}</span>}
      </div>
    </div>
  );
}
