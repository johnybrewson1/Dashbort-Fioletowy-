import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useSupabaseUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Supabase user:', user);
      console.log('Supabase error:', error);
      if (user) {
        console.log('User ID:', user.id);
        console.log('User email:', user.email);
      }
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user);
        if (session?.user) {
          console.log('Session user ID:', session.user.id);
          console.log('Session user email:', session.user.email);
        }
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  console.log('useSupabaseUser - user:', user, 'userId:', user?.id);
  
  return {
    user,
    loading,
    userId: user?.id // Usunięto fallback - jeśli nie ma user, to nie ma userId
  };
};
