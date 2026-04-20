import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, Updatable } from '@/lib/database.types';

type ProfileUpdate = Updatable<'profiles'>;

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (patch: ProfileUpdate) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (err) setError(err.message);
    else { setProfile(data as Profile); setError(null); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = useCallback(async (patch: ProfileUpdate) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error: err } = await supabase
      .from('profiles')
      // @ts-ignore - database types mismatch
      .update(patch as any)
      .eq('id', user.id)
      .select()
      .single();
    if (err) return { error: err.message };
    setProfile(data as Profile);
    return { error: null };
  }, [user]);

  return { profile, loading, error, updateProfile, refresh: fetchProfile };
}
