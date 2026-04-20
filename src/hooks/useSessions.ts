import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { WorkoutSession, Insertable } from '@/lib/database.types';

type SessionInsert = Omit<Insertable<'sessions'>, 'user_id'>;

interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  totalCalories: number;
  thisWeekCount: number;
  currentStreakDays: number;
}

interface UseSessionsResult {
  sessions: WorkoutSession[];
  stats: SessionStats;
  loading: boolean;
  error: string | null;
  logSession: (entry: SessionInsert) => Promise<{ error: string | null; data: WorkoutSession | null }>;
  deleteSession: (id: string) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function computeStreak(sessions: WorkoutSession[]): number {
  if (!sessions.length) return 0;
  const days = Array.from(new Set(sessions.map(s => startOfDay(new Date(s.completed_at))))).sort((a, b) => b - a);
  const today = startOfDay(new Date());
  const ONE_DAY = 86_400_000;
  if (days[0] !== today && days[0] !== today - ONE_DAY) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === ONE_DAY) streak++;
    else break;
  }
  return streak;
}

export function useSessions(): UseSessionsResult {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) { setSessions([]); setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });
    if (err) setError(err.message);
    else { setSessions((data as WorkoutSession[]) ?? []); setError(null); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const logSession = useCallback(async (entry: SessionInsert) => {
    if (!user) return { error: 'Not authenticated', data: null };
    const { data, error: err } = await supabase
      .from('sessions')
      .insert({ ...entry, user_id: user.id } as any)
      .select()
      .single();
    if (err) return { error: err.message, data: null };
    const inserted = data as WorkoutSession;
    setSessions(prev => [inserted, ...prev]);
    return { error: null, data: inserted };
  }, [user]);

  const deleteSession = useCallback(async (id: string) => {
    if (!user) return { error: 'Not authenticated' };
    const { error: err } = await supabase.from('sessions').delete().eq('id', id).eq('user_id', user.id);
    if (err) return { error: err.message };
    setSessions(prev => prev.filter(s => s.id !== id));
    return { error: null };
  }, [user]);

  const stats = useMemo<SessionStats>(() => {
    const weekStart = startOfDay(new Date()) - 6 * 86_400_000;
    let totalMinutes = 0, totalCalories = 0, thisWeekCount = 0;
    for (const s of sessions) {
      totalMinutes += s.duration_minutes ?? 0;
      totalCalories += s.calories_burned ?? 0;
      if (new Date(s.completed_at).getTime() >= weekStart) thisWeekCount++;
    }
    return { totalSessions: sessions.length, totalMinutes, totalCalories, thisWeekCount, currentStreakDays: computeStreak(sessions) };
  }, [sessions]);

  return { sessions, stats, loading, error, logSession, deleteSession, refresh: fetchSessions };
}
