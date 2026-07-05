import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface List {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
  position: number;
}

export function useLists() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: lists, isLoading, error } = useQuery({
    queryKey: ['lists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as List[];
    },
    enabled: !!user,
  });

  const createListMutation = useMutation({
    mutationFn: async ({ name, icon, color }: { name: string; icon?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('lists')
        .insert({
          user_id: user?.id,
          name,
          icon,
          color,
          position: lists ? lists.length : 0,
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as List;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] });
    }
  });

  const renameListMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('lists')
        .update({ name })
        .eq('id', id)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] });
    }
  });

  const reorderListsMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const promises = orderedIds.map((id, index) => 
        supabase
          .from('lists')
          .update({ position: index })
          .eq('id', id)
          .eq('user_id', user?.id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: ['lists', user?.id] });
      const previousLists = queryClient.getQueryData<List[]>(['lists', user?.id]);
      
      if (previousLists) {
        // Optimistically update
        const idToPosition = new Map(orderedIds.map((id, i) => [id, i]));
        const nextLists = [...previousLists].sort((a, b) => {
          const posA = idToPosition.get(a.id) ?? 0;
          const posB = idToPosition.get(b.id) ?? 0;
          return posA - posB;
        });
        queryClient.setQueryData<List[]>(['lists', user?.id], nextLists);
      }
      return { previousLists };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(['lists', user?.id], context.previousLists);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] });
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, delete non-priority tasks in this list
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('list_id', id)
        .eq('is_priority', false)
        .eq('user_id', user?.id);
        
      if (tasksError) throw tasksError;

      // Then delete the list (priority tasks will automatically be SET NULL by DB constraint)
      const { error: listError } = await supabase
        .from('lists')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
        
      if (listError) throw listError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    }
  });

  return {
    lists,
    isLoading,
    error,
    createList: (params: { name: string; icon?: string; color?: string }) => createListMutation.mutateAsync(params),
    renameList: (id: string, name: string) => renameListMutation.mutateAsync({ id, name }),
    reorderLists: (orderedIds: string[]) => reorderListsMutation.mutateAsync(orderedIds),
    deleteList: (id: string) => deleteListMutation.mutateAsync(id),
  };
}
