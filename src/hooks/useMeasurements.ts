import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Measurement, Insertable } from '@/lib/database.types';

type MeasurementInsert = Omit<Insertable<'measurements'>, 'user_id'>;

interface UseMeasurementsResult {
  measurements: Measurement[];
  latest: Measurement | null;
  loading: boolean;
  error: string | null;
  addMeasurement: (entry: MeasurementInsert) => Promise<{ error: string | null; data: Measurement | null }>;
  deleteMeasurement: (id: string) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

export function useMeasurements(): UseMeasurementsResult {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeasurements = useCallback(async () => {
    if (!user) { setMeasurements([]); setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('measured_at', { ascending: false });
    if (err) setError(err.message);
    else { setMeasurements((data as Measurement[]) ?? []); setError(null); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMeasurements(); }, [fetchMeasurements]);

  const addMeasurement = useCallback(async (entry: MeasurementInsert) => {
    if (!user) return { error: 'Not authenticated', data: null };
    const { data, error: err } = await supabase
      .from('measurements')
      .upsert({ ...entry, user_id: user.id } as any, { onConflict: 'user_id,measured_at' })
      .select()
      .single();
    if (err) return { error: err.message, data: null };
    const inserted = data as Measurement;
    setMeasurements(prev => {
      const filtered = prev.filter(m => m.id !== inserted.id);
      return [inserted, ...filtered].sort((a, b) => a.measured_at < b.measured_at ? 1 : -1);
    });
    return { error: null, data: inserted };
  }, [user]);

  const deleteMeasurement = useCallback(async (id: string) => {
    if (!user) return { error: 'Not authenticated' };
    const { error: err } = await supabase
      .from('measurements').delete().eq('id', id).eq('user_id', user.id);
    if (err) return { error: err.message };
    setMeasurements(prev => prev.filter(m => m.id !== id));
    return { error: null };
  }, [user]);

  return { measurements, latest: measurements[0] ?? null, loading, error, addMeasurement, deleteMeasurement, refresh: fetchMeasurements };
}
