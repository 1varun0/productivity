import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useFocusTimer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const completeSessionMutation = useMutation({
    mutationFn: async (payload: {
      durationMinutes: number;
      taskId: string | null;
      intention: string;
      completionState: 'completed' | 'interrupted';
      reflection: string;
      parkedThoughtCount: number;
      startedAt: number | null;
      endsAt: number | null;
    }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          duration_minutes: payload.durationMinutes,
          task_id: payload.taskId === 'deep-thinking' ? null : payload.taskId,
          intention: payload.intention,
          completion_state: payload.completionState,
          reflection: payload.reflection,
          parked_thought_count: payload.parkedThoughtCount,
          started_at: payload.startedAt ? new Date(payload.startedAt).toISOString() : null,
          ends_at: payload.endsAt ? new Date(payload.endsAt).toISOString() : null
        })
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus_sessions', user?.id] });
    }
  });

  return { completeSession: completeSessionMutation.mutateAsync };
}
