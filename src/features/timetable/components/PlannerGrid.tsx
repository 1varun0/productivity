import { useMemo } from 'react';
import type { DayBlock } from '../types';
import { GRID_START_HOUR, GRID_HOURS, GRID_START_SLOT, slotToTime12 } from '../types';
import { PlannerBlock } from './PlannerBlock';
import { PlannerSlot } from './PlannerSlot';
import { NowIndicator } from './NowIndicator';

interface PlannerGridProps {
  dayBlocks: DayBlock[];
  selectedTaskId: string | null;
  isSlotFree: (startSlot: number, durationSlots: number) => boolean;
  onSlotClick: (slot: number) => void;
  onRemoveEntry: (id: string, taskId: string | null) => void;
}

const ROW_HEIGHT = 52; // px per hour

export function PlannerGrid({ dayBlocks, selectedTaskId, isSlotFree, onSlotClick, onRemoveEntry }: PlannerGridProps) {
  const timeLabels = useMemo(() => {
    const labels = [];
    for (let h = GRID_START_HOUR; h < GRID_START_HOUR + GRID_HOURS; h++) {
      const slot = h * 2;
      labels.push({ label: slotToTime12(slot), hour: h });
    }
    return labels;
  }, []);

  // Generate droppable slots when a task is selected
  const droppableSlots = useMemo(() => {
    if (!selectedTaskId) return [];
    const slots: number[] = [];
    const totalSlots = GRID_HOURS * 2; // 30min slots
    for (let i = 0; i < totalSlots; i++) {
      const slot = GRID_START_SLOT + i;
      if (isSlotFree(slot, 2)) { // default 1hr = 2 slots
        slots.push(slot);
      }
    }
    return slots;
  }, [selectedTaskId, isSlotFree]);

  // Check which slots are occupied by existing blocks
  const occupiedSlots = useMemo(() => {
    const set = new Set<number>();
    for (const block of dayBlocks) {
      for (let s = block.start_slot; s < block.start_slot + block.duration_slots; s++) {
        set.add(s);
      }
    }
    return set;
  }, [dayBlocks]);

  return (
    <div className="flex-1 overflow-y-auto relative pt-2 pb-12">
      {/* Background Hover Rows */}
      <div className="absolute top-2 left-[42px] right-0 flex flex-col z-0">
        {timeLabels.map((_, i) => (
          <div key={`bg-${i}`} className="w-full transition-colors hover:bg-[#131313]" style={{
            height: `${ROW_HEIGHT}px`,
            borderTop: '0.5px solid #141414',
          }} />
        ))}
      </div>
      {/* Time column */}
      <div className="absolute top-0 bottom-0 left-0 w-[42px] z-10 pt-2 pointer-events-none" style={{
        borderRight: '1px solid #111111',
        backgroundColor: 'rgba(15, 15, 15, 0.8)',
        backdropFilter: 'blur(4px)',
      }}>
        {timeLabels.map(({ label }) => (
          <div key={label} className="flex items-start justify-center pr-2" style={{ height: `${ROW_HEIGHT}px` }}>
            <span className="-translate-y-1/2" style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
              color: '#333333', lineHeight: '1',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Blocks container */}
      <div className="relative ml-[50px] mr-4" style={{ minHeight: `${GRID_HOURS * ROW_HEIGHT}px` }}>
        {/* Render existing blocks */}
        {dayBlocks.map(block => (
          <div key={block.id} className="group">
            <PlannerBlock
              block={block}
              onRemove={block.locked ? undefined : onRemoveEntry}
            />
          </div>
        ))}

        {/* Render droppable slots */}
        {droppableSlots.map(slot => (
          <PlannerSlot
            key={`drop-${slot}`}
            slot={slot}
            isDroppable={true}
            isOccupied={occupiedSlots.has(slot)}
            onDrop={onSlotClick}
          />
        ))}

        {/* Now indicator */}
        <NowIndicator />
      </div>
    </div>
  );
}
