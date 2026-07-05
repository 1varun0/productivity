import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/profile';

interface ProfileStore {
  profile: Profile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'username'>>) => Promise<void>;
  updateAppearance: (updates: Partial<Pick<Profile, 'accent_color' | 'compact_mode' | 'theme'>>) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
}

export function applyAccentColor(color: string) {
  document.documentElement.style.setProperty('--color-accent', color);
  document.documentElement.style.setProperty('--color-primary', color);
}

export function applyCompactMode(enabled: boolean) {
  document.body.classList.toggle('compact', enabled);
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ profile: null, isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Fallback: auto-create the missing profile inline
        await supabase.from('profiles').insert({
          id: session.user.id,
          display_name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
          username: session.user.user_metadata?.username ?? null,
        });
        
        const { data: newData, error: newError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!newError && newData) {
          set({ profile: newData as Profile });
          applyAccentColor(newData.accent_color);
          applyCompactMode(newData.compact_mode);
        }
      } else {
        set({ profile: data as Profile });
        applyAccentColor(data.accent_color);
        applyCompactMode(data.compact_mode);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return;

    // Optimistic update
    set({ profile: { ...profile, ...updates } });

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) {
      console.error('Failed to update profile:', error);
      // Revert optimism by refetching
      await get().fetchProfile();
    }
  },

  updateAppearance: async (updates) => {
    const { profile } = get();
    if (!profile) return;

    // Apply global CSS instantly
    if (updates.accent_color !== undefined) {
      applyAccentColor(updates.accent_color);
    }
    if (updates.compact_mode !== undefined) {
      applyCompactMode(updates.compact_mode);
    }

    // Optimistic update
    set({ profile: { ...profile, ...updates } });

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) {
      console.error('Failed to update appearance:', error);
      // Revert optimism
      await get().fetchProfile();
    }
  },

  sendPasswordReset: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;
    
    const { error } = await supabase.auth.resetPasswordForEmail(session.user.email);
    if (error) {
      console.error('Failed to send password reset:', error);
    }
  }
}));
