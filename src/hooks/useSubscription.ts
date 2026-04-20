import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionPlan = 'monthly' | 'annual' | 'commitment';
export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  swikly_deposit_status: string | null;
  contract_accepted_at: string | null;
  created_at: string;
}

export const PLANS = {
  monthly: {
    id: 'monthly' as SubscriptionPlan,
    name_fr: 'Mensuel',
    name_en: 'Monthly',
    price: 49,
    interval: 'mois' as const,
    interval_en: 'month' as const,
    commitment: false,
    badge_fr: 'Sans engagement',
    badge_en: 'No commitment',
    description_fr: 'Résiliable à tout moment',
    description_en: 'Cancel anytime',
    color: '#3B82F6',
  },
  annual: {
    id: 'annual' as SubscriptionPlan,
    name_fr: 'Annuel',
    name_en: 'Annual',
    price: 588,
    interval: 'an' as const,
    interval_en: 'year' as const,
    commitment: false,
    badge_fr: 'Économisez 0€',
    badge_en: 'All included',
    description_fr: 'Payé en une fois, 12 mois d'accès',
    description_en: 'Paid once, 12 months access',
    color: '#B8973E',
    per_month: 49,
  },
  commitment: {
    id: 'commitment' as SubscriptionPlan,
    name_fr: 'Engagement 12 mois',
    name_en: '12-month commitment',
    price: 56,
    interval: 'mois' as const,
    interval_en: 'month' as const,
    commitment: true,
    badge_fr: 'Engagement obligatoire',
    badge_en: 'Mandatory commitment',
    description_fr: 'Prélevé mensuellement · 56€ × 12 = 672€',
    description_en: 'Billed monthly · 56€ × 12 = 672€',
    color: '#8B5CF6',
    total: 672,
  },
} as const;

interface UseSubscriptionResult {
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  createCheckout: (plan: SubscriptionPlan, contractAccepted: boolean) => Promise<{ url: string | null; error: string | null }>;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionResult {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setSubscription(data as Subscription ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const createCheckout = useCallback(async (plan: SubscriptionPlan, contractAccepted: boolean) => {
    if (!user) return { url: null, error: 'Not authenticated' };
    if (!contractAccepted) return { url: null, error: 'Contract must be accepted' };

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan,
          userId: user.id,
          email: user.email,
          contractAccepted,
          returnUrl: window.location.origin + '/subscription?success=1',
          cancelUrl: window.location.origin + '/subscription?canceled=1',
        },
      });

      if (error) return { url: null, error: error.message };
      return { url: data?.url ?? null, error: null };
    } catch (err: any) {
      return { url: null, error: err.message };
    }
  }, [user]);

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  return { subscription, loading, isActive, createCheckout, refresh: fetchSubscription };
}
