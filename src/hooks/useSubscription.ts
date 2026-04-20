import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// ─── 2 formules uniquement ───────────────────────────────────────────────────
// annual     : 588€/an payé en une fois (= 49€/mois)
// commitment : 56€/mois avec engagement 12 mois obligatoire (= 672€/an)
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionPlan = 'annual' | 'commitment';
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
  annual: {
    id: 'annual' as SubscriptionPlan,
    name_fr: 'Annuel',
    name_en: 'Annual',
    price: 588,
    per_month: 49,
    interval_fr: 'an',
    interval_en: 'year',
    commitment: false,
    badge_fr: 'Meilleur prix',
    badge_en: 'Best value',
    description_fr: "Payé en une fois · 49€/mois · 12 mois d'accès",
    description_en: 'Paid once · 49€/month · 12 months access',
    color: '#B8973E',
    popular: true,
  },
  commitment: {
    id: 'commitment' as SubscriptionPlan,
    name_fr: 'Mensuel 12 mois',
    name_en: 'Monthly 12 months',
    price: 56,
    per_month: 56,
    total: 672,
    interval_fr: 'mois',
    interval_en: 'month',
    commitment: true,
    badge_fr: 'Engagement 12 mois',
    badge_en: '12-month commitment',
    description_fr: 'Prélevé chaque mois · Engagement contractuel obligatoire',
    description_en: 'Billed monthly · Mandatory contractual commitment',
    color: '#8B5CF6',
    popular: false,
  },
} as const;

interface UseSubscriptionResult {
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  createCheckout: (
    plan: SubscriptionPlan,
    contractAccepted: boolean
  ) => Promise<{ url: string | null; error: string | null }>;
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
    setSubscription((data as Subscription) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const createCheckout = useCallback(
    async (plan: SubscriptionPlan, contractAccepted: boolean) => {
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
    },
    [user]
  );

  const isActive =
    subscription?.status === 'active' || subscription?.status === 'trialing';

  return { subscription, loading, isActive, createCheckout, refresh: fetchSubscription };
}
