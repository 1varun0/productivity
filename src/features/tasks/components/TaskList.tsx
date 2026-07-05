import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../hooks/useTasks';
import { useMemo } from 'react';
import type { SortOption } from '@/pages/TodayPage';
import { useStore } from '@/store/useStore';
import { useLists } from '@/features/lists/hooks/useLists';
import { TaskItem } from './TaskItem';
import { CompletedTaskGroups } from './CompletedTaskGroups';

export function TaskList({ sortOption = 'recent' }: { sortOption?: SortOption }) {
  const { tasks, isLoading } = useTasks();
  const { lists } = useLists();
  const activeListId = useStore(state => state.activeListId);

  const { activeTasks, historicalTasks } = useMemo(() => {
    if (!tasks) return { activeTasks: [], historicalTasks: [] };
    
    // Filter by active space or overview logic
    const filtered = activeListId 
      ? tasks.filter(task => task.list_id === activeListId)
      : tasks.filter(task => task.list_id === null || task.is_priority);

    // Sort function for active tasks
    const sortTasks = (taskArray: typeof tasks) => {
      return [...taskArray].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        
        // Group by list in Overview
        if (activeListId === null) {
          if (a.is_priority && !b.is_priority) return -1;
          if (!a.is_priority && b.is_priority) return 1;

          if (!a.list_id && b.list_id) return -1;
          if (a.list_id && !b.list_id) return 1;
          
          if (a.list_id && b.list_id && a.list_id !== b.list_id) {
            const listA = lists?.find(l => l.id === a.list_id)?.name || '';
            const listB = lists?.find(l => l.id === b.list_id)?.name || '';
            if (listA !== listB) return listA.localeCompare(listB);
          }
        }

        if (sortOption === 'due') {
          if (!a.due_date && !b.due_date) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    };

    const twoHoursMs = 2 * 60 * 60 * 1000;
    const now = Date.now();

    const active: typeof tasks = [];
    const historical: typeof tasks = [];

    filtered.forEach(task => {
      if (!task.completed) {
        active.push(task);
      } else {
        const completedDate = new Date(task.completed_at || task.updated_at || task.created_at).getTime();
        if (now - completedDate < twoHoursMs) {
          active.push(task);
        } else {
          historical.push(task);
        }
      }
    });

    return {
      activeTasks: sortTasks(active),
      historicalTasks: historical
    };
  }, [tasks, lists, sortOption, activeListId]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-card/40 rounded-xl animate-pulse shadow-inset-edge" />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-8 border border-border/30 rounded-xl bg-card/20 shadow-inset-edge text-sm text-muted-foreground flex flex-col items-center justify-center min-h-[140px] text-center"
      >
        <span className="text-foreground/70 mb-1 font-medium">
          {activeListId ? "No tasks here yet." : "Your day is clear."}
        </span>
        <span className="opacity-60 text-xs">Press <kbd className="font-mono bg-white/10 border border-white/10 text-white/80 px-1.5 py-0.5 rounded mx-1 shadow-sm">⌘K</kbd> to capture a thought.</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {activeTasks.map((task) => (
          <TaskItem key={task.id} task={task} activeListId={activeListId} />
        ))}
      </AnimatePresence>
      <CompletedTaskGroups tasks={historicalTasks} activeListId={activeListId} />
    </div>
  );
}
