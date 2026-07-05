import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useThoughtParking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const parkThoughtMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('captures')
        .insert({
          content,
          user_id: user.id
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures', user?.id] });
    }
  });

  return { parkThought: parkThoughtMutation.mutateAsync, isPending: parkThoughtMutation.isPending };
}
