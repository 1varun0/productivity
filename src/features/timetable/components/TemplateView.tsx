import { useMemo } from 'react';
import { useTimetable } from '../hooks/useTimetable';
import { TemplateRow } from './TemplateRow';
import { TemplateModal } from './TemplateModal';
import { GRID_START_HOUR, GRID_HOURS, getMondayDow } from '../types';

export function TemplateView() {
  const {
    templateBlocks,
    addTemplateBlock,
    updateTemplateBlock,
    deleteTemplateBlock,
    isDirty,
    isSaved,
    editingBlock,
    modalPreset,
    openModal,
    closeModal,
  } = useTimetable();

  const today = useMemo(() => getMondayDow(new Date()), []);

  // Group blocks by day
  const blocksByDay = useMemo(() => {
    const map: Record<number, typeof templateBlocks> = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    for (const block of templateBlocks) {
      if (block.archived) continue;
      for (const day of block.repeat_days) {
        if (map[day]) map[day].push(block);
      }
    }
    return map;
  }, [templateBlocks]);

  const blockCount = templateBlocks.filter(b => !b.archived).length;

  const handleCellClick = (day: number, slot: number) => {
    openModal({ day, slot });
  };

  const handleBlockClick = (block: typeof templateBlocks[0]) => {
    openModal(undefined, block);
  };

  const handleSave = (data: { name: string; category: string; color: string; start_slot: number; duration_slots: number; repeat_days: number[] }) => {
    if (editingBlock) {
      updateTemplateBlock(editingBlock.id, data);
    } else {
      addTemplateBlock(data);
    }
  };

  // Time header labels (7am to 9pm)
  const timeLabels = useMemo(() => {
    const labels = [];
    for (let h = GRID_START_HOUR; h < GRID_START_HOUR + GRID_HOURS; h++) {
      labels.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return labels;
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#0e0e0e' }}>
      {/* Info bar */}
      <div className="flex justify-between items-center h-14 px-6 shrink-0" style={{
        backgroundColor: '#0e0e0e', borderBottom: '1px solid #1c1b1b',
      }}>
        <div style={{
          fontFamily: 'Inter', fontSize: '11px', lineHeight: '14px',
          letterSpacing: '0.01em', fontWeight: 500, color: '#c8c4d5', opacity: 0.8,
        }}>
          Weekly template · {blockCount} blocks · auto-applied every week
        </div>
        <button
          className="px-4 py-2 uppercase transition-colors"
          style={{
            fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px',
            letterSpacing: '0.08em', fontWeight: 700,
            backgroundColor: isSaved ? 'transparent' : isDirty ? '#534ab7' : '#534ab7',
            color: isSaved ? '#84d6b9' : 'white',
            border: `1px solid ${isSaved ? '#84d6b9' : '#534ab7'}`,
          }}
        >
          {isSaved ? 'SAVED ✓' : 'SAVE TEMPLATE'}
        </button>
      </div>

      {/* Grid canvas */}
      <div className="flex-1 overflow-auto relative" style={{ backgroundColor: '#0e0e0e' }}>
        <div className="relative" style={{ minWidth: '1200px' }}>
          {/* Grid background lines */}
          <div className="absolute inset-0 z-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(to right, #1c1b1b 1px, transparent 1px), linear-gradient(to bottom, #1c1b1b 1px, transparent 1px)',
            backgroundSize: '80px 64px',
            backgroundPosition: '64px 32px',
            opacity: 0.5,
          }} />

          {/* Header row (time labels) */}
          <div className="sticky top-0 z-10 flex h-[32px]" style={{ backgroundColor: '#0e0e0e', borderBottom: '1px solid #1c1b1b' }}>
            <div className="w-[64px] shrink-0 sticky left-0 z-20 flex items-end p-2 pb-1" style={{
              backgroundColor: '#0e0e0e', borderRight: '1px solid #1c1b1b',
            }}>
              <span style={{ fontFamily: 'Inter', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: '#c8c4d5' }}>
                DAY \ TIME
              </span>
            </div>
            <div className="flex">
              {timeLabels.map(label => (
                <div key={label} className="w-[160px] shrink-0 p-2 pb-1 flex items-end">
                  <span style={{ fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px', letterSpacing: '0.08em', fontWeight: 700, color: '#c8c4d5' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Day rows */}
          <div className="relative">
            {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
              <TemplateRow
                key={dayIndex}
                dayIndex={dayIndex}
                blocks={blocksByDay[dayIndex] ?? []}
                isToday={dayIndex === today}
                onCellClick={handleCellClick}
                onBlockClick={handleBlockClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <TemplateModal
        isOpen={!!(modalPreset || editingBlock)}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={deleteTemplateBlock}
        editingBlock={editingBlock}
        preset={modalPreset}
      />
    </div>
  );
}
