import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserPrefs, Updatable } from '@/lib/database.types';

type PrefsUpdate = Updatable<'user_preferences'>;

interface UsePreferencesResult {
  preferences: UserPrefs | null;
  loading: boolean;
  error: string | null;
  savePreferences: (patch: PrefsUpdate) => Promise<{ error: string | null }>;
  completeOnboarding: (patch: PrefsUpdate) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

export function usePreferences(): UsePreferencesResult {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!user) { setPreferences(null); setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (err) setError(err.message);
    else { setPreferences(data as UserPrefs); setError(null); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  const savePreferences = useCallback(async (patch: PrefsUpdate) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error: err } = await supabase
      .from('user_preferences')
      .update(patch as any)
      .eq('user_id', user.id)
      .select()
      .single();
    if (err) return { error: err.message };
    setPreferences(data as UserPrefs);
    return { error: null };
  }, [user]);

  const completeOnboarding = useCallback(
    async (patch: PrefsUpdate) => savePreferences({ ...patch, onboarding_completed: true }),
    [savePreferences]
  );

  return { preferences, loading, error, savePreferences, completeOnboarding, refresh: fetchPreferences };
}
