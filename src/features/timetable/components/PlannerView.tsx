import { useCallback } from 'react';
import { Pointer, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTimetable } from '../hooks/useTimetable';
import { PlannerTaskPanel } from './PlannerTaskPanel';
import { PlannerGrid } from './PlannerGrid';
import { BLOCK_COLORS } from '../types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDayHeader(date: Date): { label: string; dateStr: string } {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const dayName = WEEKDAYS[date.getDay()];
  const monthName = MONTHS[date.getMonth()];
  return {
    label: isToday ? 'TODAY' : dayName.toUpperCase(),
    dateStr: isToday ? `${dayName}, ${monthName} ${date.getDate()}` : `${monthName} ${date.getDate()}`,
  };
}

export function PlannerView() {
  const {
    unscheduledTasks,
    getDayBlocks,
    isSlotFree,
    selectedTaskId,
    setSelectedTask,
    activeDate,
    setActiveDate,
    scheduleTask,
    unscheduleEntry,
    tasks,
  } = useTimetable();

  const { label, dateStr } = formatDayHeader(activeDate);

  // Find the selected task details
  const selectedTask = tasks?.find(t => t.id === selectedTaskId);

  const handleSlotClick = useCallback((slot: number) => {
    if (!selectedTaskId || !selectedTask) return;

    scheduleTask({
      taskId: selectedTaskId,
      name: selectedTask.title,
      category: 'Work',
      color: selectedTask.is_priority ? BLOCK_COLORS.error : BLOCK_COLORS.tertiary,
      date: activeDate,
      startSlot: slot,
      durationSlots: 2, // default 1h
    });
  }, [selectedTaskId, selectedTask, activeDate, scheduleTask]);

  const handleRemoveEntry = useCallback((id: string, taskId: string | null) => {
    unscheduleEntry(id, taskId);
  }, [unscheduleEntry]);

  const handlePrevDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    setActiveDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 1);
    setActiveDate(d);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel: Unscheduled tasks */}
      <PlannerTaskPanel
        tasks={unscheduledTasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={(id) => setSelectedTask(selectedTaskId === id ? null : id)}
      />

      {/* Right panel: Day grid */}
      <div className="flex-1 flex flex-col relative" style={{ backgroundColor: '#0F0F0F' }}>
        {/* Scheduling hint bar (only when task selected) */}
        {selectedTask && (
          <div className="mx-4 mt-4 mb-2 p-2 flex items-center gap-2" style={{
            backgroundColor: '#1a1730',
            border: '1px solid #534ab7',
            borderRadius: '6px',
          }}>
            <Pointer size={16} style={{ color: '#c5c0ff' }} />
            <span style={{
              fontFamily: 'Inter', fontSize: '12px', color: '#c5c0ff',
            }}>
              <strong className="font-medium">Scheduling: {selectedTask.title}</strong> — tap a free slot to place this 1h block.
            </span>
          </div>
        )}

        {/* Day header with navigation */}
        <div className="px-4 py-2 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid #111111' }}>
          <button onClick={handlePrevDay} className="hover:text-[#e5e2e1] transition-colors" style={{ color: '#c8c4d5' }}>
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-end gap-2">
            <h2 style={{
              fontFamily: 'Inter', fontSize: '13px', fontWeight: 500, color: '#928f9e',
            }}>
              {label}
            </h2>
            <span style={{
              fontFamily: 'Inter', fontSize: '13px', fontWeight: 400, color: '#e0e0e0',
            }}>
              {dateStr}
            </span>
          </div>
          <button onClick={handleNextDay} className="hover:text-[#e5e2e1] transition-colors" style={{ color: '#c8c4d5' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Grid */}
        <PlannerGrid
          dayBlocks={getDayBlocks}
          selectedTaskId={selectedTaskId}
          isSlotFree={isSlotFree}
          onSlotClick={handleSlotClick}
          onRemoveEntry={handleRemoveEntry}
        />
      </div>
    </div>
  );
}
