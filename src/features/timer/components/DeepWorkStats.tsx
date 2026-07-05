import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Flame, Target, Clock } from 'lucide-react';

export function DeepWorkStats() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['deep_work_stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('duration_minutes, completion_state, created_at')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      if (error) throw error;

      let focusedMinutes = 0;
      let sessionsCompleted = 0;

      data?.forEach(session => {
        if (session.completion_state === 'completed') {
          sessionsCompleted++;
          focusedMinutes += session.duration_minutes;
        } else if (session.completion_state === 'interrupted') {
          // You could optionally calculate partial time if you wanted, 
          // but usually we just count completed time for deep work.
        }
      });

      return {
        focusedMinutes,
        sessionsCompleted,
        // Mocking streak for now as it requires complex historical querying.
        // It can be added later as part of the analytics expansion.
        streak: 1 
      };
    },
    enabled: !!user
  });

  if (!stats) return null;

  return (
    <div className="flex items-center gap-6 px-2 py-1">
      <div className="flex items-center gap-2 text-[10px] font-medium tracking-widest uppercase text-muted-foreground/40" title="Focused Minutes Today">
        <Clock size={10} className="opacity-70" />
        <span>{stats.focusedMinutes}m</span>
      </div>
      
      <div className="flex items-center gap-2 text-[10px] font-medium tracking-widest uppercase text-muted-foreground/40" title="Sessions Completed">
        <Target size={10} className="opacity-70" />
        <span>{stats.sessionsCompleted}</span>
      </div>

      {stats.streak > 1 && (
        <div className="flex items-center gap-2 text-[10px] font-medium tracking-widest uppercase text-orange-500/50" title="Current Streak">
          <Flame size={10} className="opacity-70" />
          <span>{stats.streak} day</span>
        </div>
      )}
    </div>
  );
}
