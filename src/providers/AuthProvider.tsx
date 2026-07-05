import { useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useProfileStore } from '@/store/useProfileStore';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        useProfileStore.getState().fetchProfile();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        useProfileStore.getState().fetchProfile();
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const signInWithMagicLink = async (email: string) => {
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUsername = async (newUsername: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { username: newUsername }
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signInWithGoogle, signInWithMagicLink, signOut, updateUsername }}>
      {children}
    </AuthContext.Provider>
  );
}
