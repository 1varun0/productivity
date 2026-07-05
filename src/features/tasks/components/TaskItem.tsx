import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Calendar, Flag, Paperclip } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { Task } from '../hooks/useTasks';
import { useTasks } from '../hooks/useTasks';
import { useLists } from '@/features/lists/hooks/useLists';
import { useWorkspaceStore } from '@/features/workspace/store/useWorkspaceStore';

const getRelativeDateInfo = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let label = '';
  let state: 'overdue' | 'today' | 'upcoming' = 'upcoming';

  if (diffDays === 0) {
    label = 'Today';
    state = 'today';
  } else if (diffDays === 1) {
    label = 'Yesterday';
    state = 'overdue';
  } else if (diffDays > 1) {
    label = `${diffDays} days overdue`;
    state = 'overdue';
  } else if (diffDays === -1) {
    label = 'Tomorrow';
    state = 'upcoming';
  } else {
    label = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    state = 'upcoming';
  }

  return { label, state };
};

interface TaskItemProps {
  task: Task;
  activeListId: string | null;
  isHistorical?: boolean;
}

export function TaskItem({ task, activeListId, isHistorical }: TaskItemProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleTask, togglePriority, deleteTask } = useTasks();
  const { lists } = useLists();
  const projects = useWorkspaceStore(s => s.projects);

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ 
        opacity: task.completed ? (isHistorical ? 0.35 : 0.5) : 1, 
        y: 0, 
        scale: task.completed ? 0.98 : 1 
      }}
      exit={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 35, mass: 1 }}
      onClick={() => {
        searchParams.set('taskId', task.id);
        setSearchParams(searchParams);
      }}
      className={`group flex items-center justify-between p-3.5 rounded-xl border border-transparent transition-all duration-300 relative overflow-hidden cursor-pointer ${isHistorical ? 'hover:border-border/20 hover:bg-card/20' : 'hover:border-border/40 hover:bg-card/40 hover:shadow-inset-edge'}`}
    >
      <div className="flex items-center gap-4 overflow-hidden relative z-10 w-full">
        <button 
          onClick={(e) => { e.stopPropagation(); toggleTask(task.id, !task.completed); }}
          className={`flex-shrink-0 w-5 h-5 rounded-[6px] flex items-center justify-center border transition-all duration-300 active:scale-75 ${task.completed ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20' : 'border-border/80 bg-background hover:border-primary/50 hover:bg-card shadow-inset-edge'}`}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 600, damping: 25 }}
              >
                <Check size={12} strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <div className="flex flex-col">
          <span className={`text-[15px] truncate transition-all duration-500 ease-out ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground/90 font-medium'}`}>
            {task.title}
          </span>
          
          <div className="flex items-center gap-3 mt-1">
            {task.due_date && (
              (() => {
                const { label, state } = getRelativeDateInfo(task.due_date);
                
                let colorClass = 'text-muted-foreground/40';
                if (!task.completed) {
                  if (state === 'overdue') colorClass = 'text-amber-500/60';
                  else if (state === 'today') colorClass = 'text-primary/90';
                  else colorClass = 'text-primary/40';
                }

                return (
                  <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-500 ${colorClass}`}>
                    <Calendar size={10} className={state === 'overdue' && !task.completed ? 'opacity-80' : ''} />
                    {label}
                  </span>
                );
              })()
            )}
            
            {/* Space Indicator in Overview */}
            {activeListId === null && task.list_id && (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30">
                {lists?.find(l => l.id === task.list_id)?.name}
              </span>
            )}
            {/* Project badge */}
            {task.project_id && (() => {
              const proj = projects.find(p => p.id === task.project_id);
              return proj ? (
                <span
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#1a1730', color: '#7F77DD' }}
                >
                  {proj.name}
                </span>
              ) : null;
            })()}
            {/* Priority Indicator */}
            {task.is_priority && !task.completed && (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-500/70">
                <Flag size={10} className="fill-amber-500/20" />
                Priority
              </span>
            )}
            {/* Attachment Indicator */}
            {task.task_attachments?.[0]?.count ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 transition-colors group-hover:text-foreground/70">
                <Paperclip size={10} />
                {task.task_attachments[0].count}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      
      <div className="flex items-center relative z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); togglePriority(task.id, !task.is_priority); }}
          className={`p-2 rounded-lg transition-all active:scale-90 ${task.is_priority ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10 opacity-100' : 'text-muted-foreground/50 hover:text-amber-500 hover:bg-amber-500/10 opacity-0 group-hover:opacity-100'}`}
          title={task.is_priority ? "Remove Priority" : "Mark as Priority"}
        >
          <Flag size={16} className={task.is_priority ? 'fill-amber-500/20' : ''} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
          className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all p-2 rounded-lg ml-1 active:scale-90 opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
