import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Workout } from '@/lib/database.types';

interface WorkoutFilters {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  maxDuration?: number;
}

interface UseWorkoutsResult {
  workouts: Workout[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWorkouts(filters: WorkoutFilters = {}): UseWorkoutsResult {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { difficulty, category, maxDuration } = filters;

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('workouts')
      .select('*')
      .eq('is_published', true)
      .order('duration_minutes', { ascending: true });

    if (difficulty) query = query.eq('difficulty', difficulty);
    if (category) query = query.eq('category', category);
    if (maxDuration) query = query.lte('duration_minutes', maxDuration);

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else { setWorkouts((data as Workout[]) ?? []); setError(null); }
    setLoading(false);
  }, [difficulty, category, maxDuration]);

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);

  return { workouts, loading, error, refresh: fetchWorkouts };
}

export function useWorkoutBySlug(slug: string | undefined) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from('workouts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setWorkout(data as Workout);
        setLoading(false);
      });
  }, [slug]);

  return { workout, loading, error };
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setLoading(false); return; }
      supabase
        .from('favorites')
        .select('workout_id')
        .eq('user_id', data.user.id)
        .then(({ data: favs }) => {
          setFavoriteIds(new Set((favs ?? []).map((f: { workout_id: string }) => f.workout_id)));
          setLoading(false);
        });
    });
  }, []);

  const toggle = useCallback(async (workoutId: string) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const userId = data.user.id;
    if (favoriteIds.has(workoutId)) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('workout_id', workoutId);
      setFavoriteIds(prev => { const s = new Set(prev); s.delete(workoutId); return s; });
    } else {
      await supabase.from('favorites').insert({ user_id: userId, workout_id: workoutId } as any);
      setFavoriteIds(prev => new Set(prev).add(workoutId));
    }
  }, [favoriteIds]);

  return { favoriteIds, loading, toggle, isFavorite: (id: string) => favoriteIds.has(id) };
}
