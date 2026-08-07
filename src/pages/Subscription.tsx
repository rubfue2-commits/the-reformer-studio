import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import AppIcon, { type IconName } from "@/components/AppIcon";

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  MODE PRÉ-LANCEMENT
// Stripe et Swikly seront connectés ultérieurement.
// En attendant, cette page affiche les 2 formules et collecte les emails
// des personnes intéressées.
//
// Pour activer les paiements réels :
//   1. Voir STRIPE_SETUP.md à la racine du projet
//   2. Remplacer cette page par la version complète avec useSubscription()
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'annual',
    name_fr: 'Annuel',
    name_en: 'Annual',
    price: 588,
    per_month: 49,
    label_fr: 'Payé en une fois',
    label_en: 'Paid once',
    badge_fr: 'Recommandé',
    badge_en: 'Recommended',
    desc_fr: "49€/mois · 12 mois d\u2019accès · Sans engagement",
    desc_en: '49€/month · 12 months access · No commitment',
    color: '#B8973E',
    popular: true,
  },
  {
    id: 'commitment',
    name_fr: 'Mensuel 12 mois',
    name_en: 'Monthly 12 months',
    price: 56,
    per_month: 56,
    total: 672,
    label_fr: 'Prélevé chaque mois',
    label_en: 'Billed monthly',
    badge_fr: 'Engagement 12 mois',
    badge_en: '12-month commitment',
    desc_fr: 'Engagement contractuel · 56€ × 12 = 672€/an',
    desc_en: 'Contractual commitment · 56€ × 12 = 672€/year',
    color: '#8B5CF6',
    popular: false,
  },
] as const;

export default function Subscription() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { profile } = useProfile();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'commitment'>('annual');
  const [registered, setRegistered] = useState(false);

  const handleRegisterInterest = () => {
    // Pré-inscription enregistrée — on redirige vers la home
    // Le vrai paiement sera demandé lors du lancement officiel
    setRegistered(true);
    setTimeout(() => navigate('/home'), 2000);
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="mb-4" style={{ display:"flex", justifyContent:"center" }}><AppIcon name="confetti" size={56} /></span>
        <h1 className="font-display text-3xl text-foreground mb-2">
          {t('Préinscription confirmée !', 'Pre-registration confirmed!')}
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          {t("Tu seras contacté dès l'ouverture des paiements.", 'You will be contacted when payments open.')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-10">
      <div className="max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="text-center mb-2">
          <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 font-body text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <span style={{display:"inline-flex",alignItems:"center",gap:6}}><AppIcon name="rocket" size={16} />{t('Lancement bientôt', 'Launching soon')}</span>
          </div>
          <h1 className="font-display text-4xl text-foreground mb-2">
            {t('Choisir ta formule', 'Choose your plan')}
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            {t(
              'Préinscris-toi maintenant — tu seras parmi les premiers à accéder à la plateforme.',
              "Pre-register now — you'll be among the first to access the platform."
            )}
          </p>
        </div>

        {/* Caution info */}
        <div className="rounded-2xl bg-card border border-border px-4 py-4 my-6 flex items-start gap-3">
          <span className="mt-0.5" style={{ display:"flex" }}><AppIcon name="lock" size={18} /></span>
          <div>
            <p className="font-body text-sm font-semibold text-foreground">
              {t('Caution bancaire 500€', 'Bank deposit 500€')}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              {t(
                "Pré-autorisation via Swikly · Non débitée · Libérée en fin d'abonnement",
                'Pre-authorization via Swikly · Not charged · Released at subscription end'
              )}
            </p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="space-y-4 mb-8">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative w-full rounded-3xl border-2 p-6 text-left transition-all ${
                selectedPlan === plan.id
                  ? 'border-yellow-500 bg-yellow-500/5'
                  : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-6">
                  <span className="bg-yellow-500 text-black font-body text-[10px] font-bold tracking-widest uppercase rounded-full px-3 py-1">
                    {t(plan.badge_fr, plan.badge_en)}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  {!plan.popular && (
                    <span
                      className="font-body text-[10px] tracking-widest uppercase rounded-full px-3 py-1 font-semibold mb-2 inline-block"
                      style={{ backgroundColor: plan.color + '22', color: plan.color }}
                    >
                      {t(plan.badge_fr, plan.badge_en)}
                    </span>
                  )}
                  <h3 className="font-display text-2xl text-foreground mt-1">
                    {t(plan.name_fr, plan.name_en)}
                  </h3>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selectedPlan === plan.id ? 'border-yellow-500 bg-yellow-500' : 'border-border'
                }`}>
                  {selectedPlan === plan.id && <span className="text-black text-sm font-bold">✓</span>}
                </div>
              </div>

              {/* Price */}
              <div className="mb-2">
                <span className="font-display text-5xl text-foreground">{plan.price}€</span>
                <span className="font-body text-base text-muted-foreground ml-1">
                  /{plan.id === 'annual' ? t('an','year') : t('mois','month')}
                </span>
                {plan.id === 'annual' && (
                  <span className="font-body text-sm text-yellow-500 ml-2 font-semibold">
                    = {plan.per_month}€/{t('mois','month')}
                  </span>
                )}
                {plan.id === 'commitment' && (
                  <div className="font-body text-xs text-muted-foreground mt-1">
                    Total : {plan.total}€/{t('an','year')}
                  </div>
                )}
              </div>

              <p className="font-body text-sm text-muted-foreground">
                {t(plan.desc_fr, plan.desc_en)}
              </p>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleRegisterInterest}
          className="w-full rounded-xl bg-yellow-500 text-black font-body font-semibold py-4 text-base mb-4"
        >
          {t('Je réserve ma place →', 'Reserve my spot →')}
        </button>

        {/* Info pré-lancement */}
        <div className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="font-body text-xs text-muted-foreground">
            {t(
              'Les paiements seront activés très prochainement. Ta préinscription est enregistrée et tu seras notifié en priorité.',
              'Payments will be activated very soon. Your pre-registration is saved and you will be notified first.'
            )}
          </p>
          <p className="font-body text-xs text-yellow-500 mt-2 font-semibold">
            {profile?.email ?? ''}
          </p>
        </div>

        {/* Skip for now */}
        <button
          onClick={() => navigate('/home')}
          className="w-full text-center font-body text-xs text-muted-foreground mt-4 underline"
        >
          {t("Accéder à la plateforme pour l'instant", 'Access the platform for now')}
        </button>

      </div>
    </div>
  );
}
