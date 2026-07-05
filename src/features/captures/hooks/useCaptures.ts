import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';

export interface Capture {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useCaptures() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const activeListId = useStore(state => state.activeListId);

  const { data: captures, isLoading, error } = useQuery({
    queryKey: ['captures', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('captures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Capture[];
    },
    enabled: !!user,
  });

  const deleteCaptureMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('captures')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['captures', user?.id] });
      const previousCaptures = queryClient.getQueryData<Capture[]>(['captures', user?.id]);
      
      queryClient.setQueryData<Capture[]>(['captures', user?.id], old => 
        old?.filter(capture => capture.id !== id)
      );
      
      return { previousCaptures };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousCaptures) {
        queryClient.setQueryData(['captures', user?.id], context.previousCaptures);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['captures', user?.id] });
    },
  });

  const convertToTaskMutation = useMutation({
    mutationFn: async (capture: Capture) => {
      // Create new task
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: capture.content,
          user_id: user?.id,
          list_id: activeListId || null,
        });
      if (taskError) throw taskError;

      // Delete capture
      const { error: deleteError } = await supabase
        .from('captures')
        .delete()
        .eq('id', capture.id)
        .eq('user_id', user?.id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    }
  });

  return {
    captures,
    isLoading,
    error,
    deleteCapture: (id: string) => deleteCaptureMutation.mutate(id),
    convertToTask: (capture: Capture) => convertToTaskMutation.mutate(capture),
  };
}
