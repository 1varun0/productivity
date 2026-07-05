import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  completed_at?: string | null;
  created_at: string;
  due_date?: string;
  list_id?: string | null;
  is_priority: boolean;
  description?: string;
  updated_at?: string;
  task_attachments?: [{ count: number }];
  project_id?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  folder_id?: string | null;
}

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*, task_attachments(count)')
        .eq('user_id', user.id)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const completed_at = completed ? new Date().toISOString() : null;
      const { error } = await supabase
        .from('tasks')
        .update({ completed, completed_at })
        .eq('id', id)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.id] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', user?.id]);
      
      const completed_at = completed ? new Date().toISOString() : null;
      queryClient.setQueryData<Task[]>(['tasks', user?.id], old => 
        old?.map(task => task.id === id ? { ...task, completed, completed_at } : task)
      );
      
      return { previousTasks };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const togglePriorityMutation = useMutation({
    mutationFn: async ({ id, is_priority }: { id: string; is_priority: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ is_priority })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onMutate: async ({ id, is_priority }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.id] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', user?.id]);
      
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks', user?.id],
          previousTasks.map(task => 
            task.id === id ? { ...task, is_priority } : task
          )
        );
      }
      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.id] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', user?.id]);
      
      queryClient.setQueryData<Task[]>(['tasks', user?.id], old => 
        old?.filter(task => task.id !== id)
      );
      
      return { previousTasks };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', user?.id] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', user?.id]);
      
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks', user?.id],
          previousTasks.map(task => 
            task.id === id ? { ...task, ...updates } : task
          )
        );
      }
      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    }
  });

  return {
    tasks,
    isLoading,
    error,
    toggleTask: (id: string, completed: boolean) => toggleTaskMutation.mutate({ id, completed }),
    togglePriority: (id: string, is_priority: boolean) => togglePriorityMutation.mutate({ id, is_priority }),
    deleteTask: (id: string) => deleteTaskMutation.mutate(id),
    updateTask: (id: string, updates: Partial<Task>) => updateTaskMutation.mutate({ id, ...updates }),
  };
}
