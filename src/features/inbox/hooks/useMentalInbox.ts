import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface InboxItem {
  id: string;
  user_id: string;
  content: string;
  source: 'focus' | 'quick_capture' | 'manual';
  linked_task_id?: string | null;
  linked_focus_session_id?: string | null;
  space_id?: string | null;
  resolved_at?: string | null;
  status: 'unresolved' | 'resolved' | 'converted_to_task';
  created_at: string;
}

export function useMentalInbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: inboxItems, isLoading } = useQuery({
    queryKey: ['mental_inbox', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('mental_inbox')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InboxItem[];
    },
    enabled: !!user,
  });

  const parkThoughtMutation = useMutation({
    mutationFn: async (payload: Partial<InboxItem>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('mental_inbox')
        .insert({
          ...payload,
          user_id: user.id,
        });
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['mental_inbox', user?.id] })
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InboxItem> }) => {
      const { error } = await supabase
        .from('mental_inbox')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['mental_inbox', user?.id] })
  });

  const convertToTaskMutation = useMutation({
    mutationFn: async (item: InboxItem) => {
      if (!user) throw new Error("Not authenticated");
      
      // 1. Create task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: item.content,
          user_id: user.id,
          list_id: item.space_id || null, // preserve space if any
          // we could preserve linked_focus_session_id if tasks table supported it, but it might not.
        })
        .select('id')
        .single();
        
      if (taskError) throw taskError;

      // 2. Resolve inbox item
      const { error: updateError } = await supabase
        .from('mental_inbox')
        .update({
          status: 'converted_to_task',
          linked_task_id: taskData.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      return taskData.id;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['mental_inbox', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    }
  });

  return {
    inboxItems,
    isLoading,
    parkThought: parkThoughtMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    convertToTask: convertToTaskMutation.mutateAsync,
  };
}
