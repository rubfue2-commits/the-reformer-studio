import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface ReferralData {
  code: string;
  referrals: ReferralEntry[];
  totalCount: number;
  subscription: SubscriptionData | null;
}

export interface ReferralEntry {
  id: string;
  referee_id: string;
  referred_at: string;
  months_completed: number;
  referee_gift_applied: boolean;
  referrer_reward_applied: boolean;
}

export interface SubscriptionData {
  billing_type: 'annual_upfront' | 'monthly';
  status: string;
  months_paid: number;
  monthly_price_cents: number;
  gift_month_applied: boolean;
  current_period_end: string | null;
}

interface UseReferralResult {
  referralCode: string | null;
  referrals: ReferralEntry[];
  totalReferrals: number;
  subscription: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useReferral(): UseReferralResult {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    try {
      // 1. Récupérer ou créer le code de parrainage
      const { data: codeData, error: codeErr } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .single();

      if (codeErr && codeErr.code === 'PGRST116') {
        // Pas encore de code — en créer un
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { data: created } = await supabase
          .from('referral_codes')
          .insert({ user_id: user.id, code: newCode })
          .select('code')
          .single();
        setReferralCode(created?.code ?? null);
      } else {
        setReferralCode(codeData?.code ?? null);
      }

      // 2. Récupérer les parrainages de cette marraine
      const { data: referralData, error: refErr } = await supabase
        .from('referrals')
        .select('id, referee_id, referred_at, months_completed, referee_gift_applied, referrer_reward_applied')
        .eq('referrer_id', user.id)
        .order('referred_at', { ascending: false });

      if (refErr) throw refErr;
      setReferrals((referralData as ReferralEntry[]) ?? []);

      // 3. Récupérer l'abonnement — source de vérité : profiles (sync Stripe via back-office)
      const { data: subData } = await supabase
        .from('profiles')
        .select('has_active_subscription, subscription_plan, subscription_end_date')
        .eq('id', user.id)
        .maybeSingle();

      setSubscription(subData?.has_active_subscription ? {
        billing_type: subData.subscription_plan === 'monthly' ? 'monthly' : 'annual_upfront',
        status: subData.subscription_plan === 'monthly' ? 'monthly_active' : 'active',
        months_paid: 0,
        monthly_price_cents: subData.subscription_plan === 'monthly' ? 5600 : 4900,
        gift_month_applied: false,
        current_period_end: (subData as any).subscription_end_date ?? null,
      } : null);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return {
    referralCode,
    referrals,
    totalReferrals: referrals.length,
    subscription,
    loading,
    error,
    refresh: fetchAll,
  };
}
