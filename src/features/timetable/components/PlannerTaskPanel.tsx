import { PlannerTaskItem } from './PlannerTaskItem';
import type { Task } from '@/features/tasks/hooks/useTasks';

interface PlannerTaskPanelProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
}

export function PlannerTaskPanel({ tasks, selectedTaskId, onSelectTask }: PlannerTaskPanelProps) {
  const handleSelect = (id: string) => {
    onSelectTask(selectedTaskId === id ? '' : id);
  };

  return (
    <aside className="w-[220px] shrink-0 flex flex-col" style={{
      borderRight: '1px solid #111111', backgroundColor: '#131313',
    }}>
      <div className="p-4 flex flex-col gap-1" style={{ borderBottom: '1px solid #111111' }}>
        <h2 style={{
          fontFamily: 'Inter', fontSize: '10px', lineHeight: '12px',
          letterSpacing: '0.08em', fontWeight: 700, color: '#e5e2e1',
          textTransform: 'uppercase',
        }}>
          UNSCHEDULED TASKS
        </h2>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#c8c4d5',
        }}>
          {tasks.length} tasks · click to schedule
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.map(task => (
          <PlannerTaskItem
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            onSelect={handleSelect}
          />
        ))}
        {tasks.length === 0 && (
          <div className="p-4 text-center" style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#928f9e',
          }}>
            All tasks scheduled
          </div>
        )}
      </div>
    </aside>
  );
}
