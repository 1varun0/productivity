import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Task } from '../hooks/useTasks';
import { TaskItem } from './TaskItem';
import { startOfDay, startOfWeek, startOfMonth, subMonths, isAfter, isBefore } from 'date-fns';

// Added to force Vite HMR after date-fns installation

interface TaskGroup {
  id: string;
  label: string;
  tasks: Task[];
  defaultOpen?: boolean;
}

interface CompletedTaskGroupsProps {
  tasks: Task[];
  activeListId: string | null;
}

export function CompletedTaskGroups({ tasks, activeListId }: CompletedTaskGroupsProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'completed-today': true, // Open by default
  });

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const groups = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const now = new Date();
    const today = startOfDay(now);
    const thisWeek = startOfWeek(now);
    const thisMonth = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = thisMonth; // anything before thisMonth and after lastMonthStart

    const buckets: Record<string, Task[]> = {
      'completed-today': [],
      'completed-this-week': [],
      'completed-earlier-this-month': [],
      'completed-last-month': [],
      'completed-long-ago': [],
    };

    tasks.forEach(task => {
      // Fallback to updated_at or created_at if completed_at is missing for old tasks
      const completedDate = new Date(task.completed_at || task.updated_at || task.created_at);

      if (isAfter(completedDate, today) || completedDate.getTime() === today.getTime()) {
        buckets['completed-today'].push(task);
      } else if (isAfter(completedDate, thisWeek) || completedDate.getTime() === thisWeek.getTime()) {
        buckets['completed-this-week'].push(task);
      } else if (isAfter(completedDate, thisMonth) || completedDate.getTime() === thisMonth.getTime()) {
        buckets['completed-earlier-this-month'].push(task);
      } else if (isAfter(completedDate, lastMonthStart) && isBefore(completedDate, lastMonthEnd)) {
        buckets['completed-last-month'].push(task);
      } else {
        buckets['completed-long-ago'].push(task);
      }
    });

    const result: TaskGroup[] = [];
    if (buckets['completed-today'].length > 0) result.push({ id: 'completed-today', label: 'Completed Today', tasks: buckets['completed-today'], defaultOpen: true });
    if (buckets['completed-this-week'].length > 0) result.push({ id: 'completed-this-week', label: 'Completed This Week', tasks: buckets['completed-this-week'] });
    if (buckets['completed-earlier-this-month'].length > 0) result.push({ id: 'completed-earlier-this-month', label: 'Earlier This Month', tasks: buckets['completed-earlier-this-month'] });
    if (buckets['completed-last-month'].length > 0) result.push({ id: 'completed-last-month', label: 'Last Month', tasks: buckets['completed-last-month'] });
    if (buckets['completed-long-ago'].length > 0) result.push({ id: 'completed-long-ago', label: 'A Long Time Ago', tasks: buckets['completed-long-ago'] });

    return result;
  }, [tasks]);

  if (groups.length === 0) return null;

  return (
    <div className="mt-8 space-y-4 pt-4 border-t border-border/10">
      {groups.map(group => {
        const isOpen = openGroups[group.id] ?? group.defaultOpen;
        
        return (
          <div key={group.id} className="flex flex-col">
            <button 
              onClick={() => toggleGroup(group.id)}
              className="flex items-center gap-2 py-2 px-1 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors w-fit group cursor-pointer"
            >
              <div className="flex-shrink-0 transition-transform duration-300">
                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </div>
              <span>{group.label}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                &middot; {group.tasks.length}
              </span>
            </button>
            
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pt-1 pb-4">
                    {group.tasks.map(task => (
                      <TaskItem key={task.id} task={task} activeListId={activeListId} isHistorical={true} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
