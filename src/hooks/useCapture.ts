import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';

export function useCapture() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const activeListId = useStore(state => state.activeListId);

  const captureMutation = useMutation({
    mutationFn: async (payload: { content: string; dueDate: string | null }) => {
      if (!user) throw new Error("Not authenticated");
      
      // Save as a task
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: payload.content,
          due_date: payload.dueDate,
          user_id: user.id,
          list_id: activeListId || null
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    }
  });

  return { capture: captureMutation.mutateAsync, isPending: captureMutation.isPending };
}
