import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { ProjectMessage } from '../types';

export function useProjectChat(projectId: string) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId || !user) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      // Initial fetch — last 100 messages
      const { data: rawMessages, error } = await supabase
        .from('project_messages')
        .select('*')
        .eq('project_id', projectId)
        .eq('deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error || !rawMessages) {
        setIsLoading(false);
        return;
      }

      // Fetch user profiles for the senders
      const uniqueUserIds = Array.from(new Set(rawMessages.map(m => m.user_id)));
      
      const { data: profiles } = await supabase.rpc('get_user_profiles', {
        user_ids: uniqueUserIds
      });

      const profileMap = new Map(profiles?.map((p: { id: string; name: string; avatar_url?: string }) => [p.id, p]));

      const enrichedMessages = rawMessages.map(m => ({
        ...m,
        sender: profileMap.get(m.user_id) || { id: m.user_id, name: 'Unknown User' }
      }));

      setMessages(enrichedMessages as ProjectMessage[]);
      setIsLoading(false);
    };

    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, async (payload) => {
        // Fetch sender details for the new message
        const { data: profiles } = await supabase.rpc('get_user_profiles', {
          user_ids: [payload.new.user_id]
        });
        
        const senderData = profiles?.[0] || { id: payload.new.user_id, name: 'Unknown User' };

        setMessages(prev => {
          // Avoid duplicates (e.g., from optimistic update)
          if (prev.some(m => m.id === payload.new.id)) return prev;
          const newMsg = { ...payload.new, sender: senderData } as ProjectMessage;
          return [...prev, newMsg];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setMessages(prev => {
          if (payload.new.deleted) {
            return prev.filter(m => m.id !== payload.new.id);
          }
          return prev.map(m =>
            m.id === payload.new.id ? { ...m, ...payload.new } : m
          );
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, user]);

  const sendMessage = async (content: string, attachments: ProjectMessage['attachments'] = []) => {
    if (!user) return;
    const trimmed = content.trim();
    if (!trimmed && attachments.length === 0) return;

    // Optimistic insert
    const optimistic: ProjectMessage = {
      id: crypto.randomUUID(),
      project_id: projectId,
      user_id: user.id,
      content: trimmed,
      edited_at: null,
      deleted: false,
      created_at: new Date().toISOString(),
      attachments,
      sender: {
        id: user.id,
        name: user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url,
      }
    };

    setMessages(prev => [...prev, optimistic]);

    const { error } = await supabase
      .from('project_messages')
      .insert({
        id: optimistic.id, // specify ID so realtime listener can deduplicate
        project_id: projectId,
        user_id: user.id,
        content: trimmed,
        attachments,
      });

    if (error) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      console.error('Failed to send message:', error);
    }
  };

  const editMessage = async (id: string, newContent: string) => {
    if (!user) return;
    const trimmed = newContent.trim();
    if (!trimmed) return;

    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, content: trimmed, edited_at: new Date().toISOString() } : m
    ));

    await supabase
      .from('project_messages')
      .update({ content: trimmed, edited_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
  };

  const deleteMessage = async (id: string) => {
    if (!user) return;
    setMessages(prev => prev.filter(m => m.id !== id));
    await supabase
      .from('project_messages')
      .update({ deleted: true })
      .eq('id', id)
      .eq('user_id', user.id);
  };

  return { messages, isLoading, sendMessage, editMessage, deleteMessage };
}
