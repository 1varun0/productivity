import { memo, useMemo, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { TimetableBlock } from '../types';
import { TimetableBlockCard } from './TimetableBlockCard';

interface TimetableCellProps {
  day: number;
  hour: number;
  blocks: TimetableBlock[];
  isToday: boolean;
  cellWidth: number;
  cellHeight: number;
  onCellClick: (day: number, hour: number) => void;
  onBlockClick: (block: TimetableBlock) => void;
  onBlockContextMenu?: (block: TimetableBlock, e: React.MouseEvent) => void;
  onBlockDrop?: (day: number, hour: number, payload: any) => boolean;
}

export const TimetableCell = memo(function TimetableCell({
  day,
  hour,
  blocks,
  cellWidth,
  cellHeight,
  onCellClick,
  onBlockClick,
  onBlockContextMenu,
  onBlockDrop,
}: TimetableCellProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (isFlashing) {
      const timer = setTimeout(() => setIsFlashing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isFlashing]);

  // Find if there's a block that starts at this hour
  const blockAtHour = useMemo(
    () => blocks.find(b => b.start_hour === hour),
    [blocks, hour]
  );

  // Check if this hour is covered by a multi-hour block that started earlier
  const coveredByBlock = useMemo(
    () => blocks.find(b => b.start_hour < hour && b.start_hour + b.duration > hour),
    [blocks, hour]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Conflict check 
    if (blockAtHour || coveredByBlock) {
      setIsFlashing(true);
      return;
    }

    try {
      const payloadStr = e.dataTransfer.getData('application/json');
      if (payloadStr && onBlockDrop) {
        const payload = JSON.parse(payloadStr);
        const success = onBlockDrop(day, hour, payload);
        if (!success) {
          setIsFlashing(true);
        }
      }
    } catch (err) {
      console.error('Failed to parse dropped block payload', err);
    }
  };

  // If covered by a spanning block, render an empty invisible cell
  if (coveredByBlock) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: cellWidth,
          height: cellHeight,
          borderRight: `1px solid ${isFlashing ? '#D85A30' : '#111111'}`,
          borderBottom: `1px solid ${isFlashing ? '#D85A30' : '#111111'}`,
          boxSizing: 'border-box',
          position: 'relative',
          flexShrink: 0,
          transition: isFlashing ? 'none' : 'border-color 0.3s ease',
        }}
      />
    );
  }

  // If a block starts at this hour, render the block card
  if (blockAtHour) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: cellWidth,
          height: cellHeight,
          borderRight: `1px solid ${isFlashing ? '#D85A30' : '#111111'}`,
          borderBottom: `1px solid ${isFlashing ? '#D85A30' : '#111111'}`,
          boxSizing: 'border-box',
          position: 'relative',
          flexShrink: 0,
          transition: isFlashing ? 'none' : 'border-color 0.3s ease',
        }}
      >
        <TimetableBlockCard
          block={blockAtHour}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          onBlockClick={onBlockClick}
          onBlockContextMenu={onBlockContextMenu}
        />
      </div>
    );
  }

  // Empty cell — clickable
  return (
    <div
      className="group"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: cellWidth,
        height: cellHeight,
        borderRight: `1px solid ${isFlashing ? '#D85A30' : '#111111'}`,
        borderBottom: `1px solid ${isFlashing ? '#D85A30' : '#111111'}`,
        boxSizing: 'border-box',
        position: 'relative',
        flexShrink: 0,
        cursor: 'pointer',
        backgroundColor: isDragOver ? '#2a2850' : undefined,
        transition: isFlashing ? 'none' : 'border-color 0.3s ease, background-color 0.1s ease',
      }}
      onClick={() => onCellClick(day, hour)}
    >
      <div
        className="opacity-0 group-hover:opacity-100"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#131313',
          transition: 'opacity 0.1s ease',
          userSelect: 'none',
          zIndex: 1, // behind the dragover color
        }}
      >
        <Plus size={16} color="#474553" />
      </div>
    </div>
  );
});
