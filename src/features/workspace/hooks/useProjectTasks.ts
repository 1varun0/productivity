import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Task } from '@/features/tasks/hooks/useTasks';

export function useProjectTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId) {
      return;
    }
    // Initial fetch
    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setTasks(data as Task[]);
        setIsLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => {
              // Avoid duplicates (optimistic + realtime)
              if (prev.some(t => t.id === (payload.new as Task).id)) return prev;
              return [...prev, payload.new as Task];
            });
          }
          if (payload.eventType === 'UPDATE') {
            setTasks(prev =>
              prev.map(t =>
                t.id === (payload.new as Task).id ? (payload.new as Task) : t
              )
            );
          }
          if (payload.eventType === 'DELETE') {
            setTasks(prev =>
              prev.filter(t => t.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const addTask = useCallback(
    async (title: string) => {
      if (!projectId || !user) return;

      const optimisticTask: Task = {
        id: crypto.randomUUID(),
        user_id: user.id,
        title,
        completed: false,
        created_at: new Date().toISOString(),
        is_priority: false,
        project_id: projectId,
        created_by: user.id,
      };

      setTasks(prev => [...prev, optimisticTask]);

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          user_id: user.id,
          project_id: projectId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        // Rollback
        setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
      } else if (data) {
        // Replace optimistic
        setTasks(prev =>
          prev.map(t => (t.id === optimisticTask.id ? (data as Task) : t))
        );
      }
    },
    [projectId, user]
  );

  const toggleTask = useCallback(
    async (taskId: string, completed: boolean) => {
      const completed_at = completed ? new Date().toISOString() : null;

      // Optimistic
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, completed, completed_at } : t
        )
      );

      await supabase
        .from('tasks')
        .update({ completed, completed_at })
        .eq('id', taskId);
    },
    []
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, ...updates } : t))
      );

      await supabase.from('tasks').update(updates).eq('id', taskId);
    },
    []
  );

  return { tasks, isLoading, addTask, toggleTask, updateTask };
}
