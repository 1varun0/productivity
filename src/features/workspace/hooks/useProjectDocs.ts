import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { ProjectDoc } from '../types';

// Simple debounce utility since lodash might not be available
function debounce<Args extends unknown[]>(
  func: (...args: Args) => void | Promise<void>,
  wait: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useProjectDocs(projectId: string) {
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const { user } = useAuth();

  const activeDoc = docs.find(d => d.id === activeDocId) ?? null;

  useEffect(() => {
    if (!projectId) return;

    const fetchDocs = async () => {
      const { data: rawDocs, error } = await supabase
        .from('project_docs')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error || !rawDocs) return;

      const uniqueUserIds = Array.from(new Set(rawDocs.map(d => d.last_edited_by).filter(Boolean))) as string[];
      
      let profileMap = new Map();
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase.rpc('get_user_profiles', {
          user_ids: uniqueUserIds
        });
        profileMap = new Map(profiles?.map((p: { id: string; name: string }) => [p.id, p]));
      }

      const enrichedDocs = rawDocs.map(d => ({
        ...d,
        editor: d.last_edited_by ? { name: profileMap.get(d.last_edited_by)?.name || 'Unknown' } : undefined
      }));

      setDocs(enrichedDocs as ProjectDoc[]);
    };

    fetchDocs();
  }, [projectId]);

  const createDoc = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('project_docs')
      .insert({
        project_id: projectId,
        title: 'Untitled',
        content: '',
        created_by: user.id,
        last_edited_by: user.id,
      })
      .select()
      .single();

    if (data) {
      const newDoc = {
        ...data,
        editor: { name: user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User' }
      } as ProjectDoc;
      
      setDocs(prev => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
    }
  };

  const updateDoc = useMemo(() =>
    debounce(async (id: string, updates: Partial<ProjectDoc>) => {
      if (!user) return;
      
      const now = new Date().toISOString();
      await supabase
        .from('project_docs')
        .update({
          ...updates,
          last_edited_by: user.id,
          updated_at: now,
        })
        .eq('id', id);

      setDocs(prev => prev.map(d =>
        d.id === id ? { 
          ...d, 
          ...updates, 
          updated_at: now,
          editor: { name: user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User' }
        } : d
      ));
    }, 800),
  [user]);

  const deleteDoc = async (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    if (activeDocId === id) setActiveDocId(null);
    await supabase.from('project_docs').delete().eq('id', id);
  };

  return { docs, activeDoc, setActiveDocId, createDoc, updateDoc, deleteDoc };
}
