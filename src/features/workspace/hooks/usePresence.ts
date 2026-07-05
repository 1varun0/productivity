import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import type { OnlineMember } from '../types';

export function usePresence(projectId: string | null) {
  const { setOnlineMembers } = useWorkspaceStore();
  const { user } = useAuth();

  useEffect(() => {
    if (!projectId || !user) return;

    const userName =
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'User';

    const channel = supabase.channel(`presence:${projectId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<OnlineMember>();
        const online = Object.values(state).flat();
        
        // Deduplicate by user_id to handle multiple tabs/connections
        const uniqueMembers = Array.from(
          new Map(online.map(m => [m.user_id, m])).values()
        );
        
        setOnlineMembers(uniqueMembers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            name: userName,
            avatar_url: user.user_metadata?.avatar_url || null,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [projectId, user, setOnlineMembers]);
}
