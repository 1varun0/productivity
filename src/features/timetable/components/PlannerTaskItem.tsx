import { memo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Task } from '@/features/tasks/hooks/useTasks';

interface PlannerTaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const PlannerTaskItem = memo(function PlannerTaskItem({ task, isSelected, onSelect }: PlannerTaskItemProps) {
  // Determine color based on priority
  const dotColor = task.is_priority ? '#ffb4ab' : '#84d6b9';


  // Format due date
  const dueDateLabel = task.due_date
    ? (() => {
        const d = new Date(task.due_date);
        const now = new Date();
        const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Due Today';
        if (diff === 1) return 'Due Tomorrow';
        if (diff < 0) return 'Overdue';
        return `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      })()
    : '';

  if (isSelected) {
    return (
      <div
        className="p-3 cursor-pointer relative overflow-hidden"
        style={{
          borderBottom: '1px solid #534ab7',
          backgroundColor: '#1a1730',
        }}
        onClick={() => onSelect(task.id)}
      >
        {/* Left accent bar */}
        <div className="absolute inset-y-0 left-0 w-[1.5px]" style={{ backgroundColor: '#c5c0ff' }} />

        <div className="flex items-start gap-2 mb-2 ml-1">
          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#c5c0ff' }} />
          <div>
            <h3 style={{
              fontFamily: 'Inter', fontSize: '13px', lineHeight: '20px',
              fontWeight: 500, color: '#c5c0ff',
            }} className="leading-tight">
              {task.title}
            </h3>
            <span style={{
              fontFamily: 'Inter', fontSize: '10px', lineHeight: '14px',
              letterSpacing: '0.01em', fontWeight: 500,
              color: 'rgba(197, 192, 255, 0.7)',
            }}>
              {dueDateLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end ml-1">
          <span className="flex items-center gap-1 uppercase" style={{
            fontFamily: 'Inter', fontSize: '9px', letterSpacing: '0.08em', fontWeight: 700,
            color: '#c5c0ff',
          }}>
            <ArrowUpRight size={10} />
            tap a slot to place
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-3 cursor-pointer transition-colors group"
      style={{ borderBottom: '1px solid #111111' }}
      onClick={() => onSelect(task.id)}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1c1b1b')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: dotColor }} />
        <div>
          <h3 style={{
            fontFamily: 'Inter', fontSize: '13px', lineHeight: '20px',
            fontWeight: 400, color: '#e5e2e1',
          }} className="leading-tight">
            {task.title}
          </h3>
          <span style={{
            fontFamily: 'Inter', fontSize: '10px', lineHeight: '14px',
            letterSpacing: '0.01em', fontWeight: 500, color: '#c8c4d5',
          }}>
            {dueDateLabel}
          </span>
        </div>
      </div>
    </div>
  );
});
