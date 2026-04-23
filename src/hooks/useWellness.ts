import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface WellnessEntry {
  id: string;
  user_id: string;
  entry_date: string;
  energy: number;
  mood: number;
  body: number;
  sleep: number;
  stress: number;
  tags: string[];
  note: string;
  created_at: string;
}

export interface WellnessInsert {
  entry_date?: string;
  energy: number;
  mood: number;
  body: number;
  sleep: number;
  stress: number;
  tags?: string[];
  note?: string;
}

interface UseWellnessResult {
  entries: WellnessEntry[];
  todayEntry: WellnessEntry | null;
  loading: boolean;
  error: string | null;
  saveEntry: (data: WellnessInsert) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

export function useWellness(): UseWellnessResult {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const { data, error: err } = await supabase
      .from('wellness_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(30);

    if (err) setError(err.message);
    else { setEntries((data as WellnessEntry[]) ?? []); setError(null); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.entry_date === today) ?? null;

  const saveEntry = useCallback(async (data: WellnessInsert) => {
    if (!user) return { error: 'Not authenticated' };

    const entry = {
      user_id: user.id,
      entry_date: data.entry_date ?? today,
      energy: data.energy,
      mood: data.mood,
      body: data.body,
      sleep: data.sleep,
      stress: data.stress,
      tags: data.tags ?? [],
      note: data.note ?? '',
    };

    const { data: saved, error: err } = await supabase
      .from('wellness_entries')
      .upsert(entry, { onConflict: 'user_id,entry_date' })
      .select()
      .single();

    if (err) return { error: err.message };

    setEntries(prev => {
      const filtered = prev.filter(e => e.entry_date !== entry.entry_date);
      return [saved as WellnessEntry, ...filtered].sort((a, b) =>
        b.entry_date.localeCompare(a.entry_date)
      );
    });
    return { error: null };
  }, [user, today]);

  return { entries, todayEntry, loading, error, saveEntry, refresh: fetchEntries };
}
