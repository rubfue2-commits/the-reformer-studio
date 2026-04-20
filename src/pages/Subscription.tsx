import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription, PLANS, type SubscriptionPlan } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n/LanguageContext';

const SWIKLY_URL = 'https://www.swikly.com/'; // ← À remplacer par ton lien Swikly

function PlanCard({
  planId,
  selected,
  onSelect,
  language,
}: {
  planId: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
  language: string;
}) {
  const plan = PLANS[planId];
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;
  const name = t(plan.name_fr, plan.name_en);
  const badge = t(plan.badge_fr, plan.badge_en);
  const desc = t(plan.description_fr, plan.description_en);
  const isAnnual = planId === 'annual';
  const isCommitment = planId === 'commitment';

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-3xl border-2 p-5 text-left transition-all ${
        selected ? 'border-yellow-500 bg-yellow-500/5' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span
            className="font-body text-[10px] tracking-widest uppercase rounded-full px-3 py-1 font-semibold"
            style={{
              backgroundColor: plan.color + '22',
              color: plan.color,
            }}
          >
            {badge}
          </span>
          <h3 className="font-display text-xl text-foreground mt-2">{name}</h3>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 ${
            selected ? 'border-yellow-500 bg-yellow-500' : 'border-border'
          }`}
        >
          {selected && <span className="text-black text-xs font-bold">✓</span>}
        </div>
      </div>

      {/* Price display */}
      <div className="mb-2">
        {isAnnual ? (
          <div>
            <span className="font-display text-4xl text-foreground">{plan.price}€</span>
            <span className="font-body text-sm text-muted-foreground ml-1">/{t('an','year')}</span>
            <span className="font-body text-xs text-muted-foreground ml-2">
              ({plan.per_month}€/{t('mois','month')})
            </span>
          </div>
        ) : (
          <div>
            <span className="font-display text-4xl text-foreground">{plan.price}€</span>
            <span className="font-body text-sm text-muted-foreground ml-1">/{t('mois','month')}</span>
            {isCommitment && (
              <span className="font-body text-xs text-muted-foreground ml-2">
                (total {plan.total}€)
              </span>
            )}
          </div>
        )}
      </div>

      <p className="font-body text-sm text-muted-foreground">{desc}</p>

      {isCommitment && (
        <div className="mt-3 rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2">
          <p className="font-body text-xs text-purple-400">
            ⚠️ {t(
              'Engagement contractuel de 12 mois. Résiliation anticipée = paiement du solde restant.',
              '12-month contractual commitment. Early cancellation = payment of remaining balance.'
            )}
          </p>
        </div>
      )}
    </button>
  );
}

export default function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;
  const { subscription, isActive, createCheckout, refresh } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [contractAccepted, setContractAccepted] = useState(false);
  const [swiklyDone, setSwiklyDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'plan' | 'contract' | 'deposit' | 'success'>('plan');

  // Handle return from Stripe
  useEffect(() => {
    if (searchParams.get('success') === '1') {
      setStep('deposit');
      refresh();
    }
    if (searchParams.get('canceled') === '1') {
      setError(t('Paiement annulé. Réessaie quand tu veux.', 'Payment canceled. Try again anytime.'));
    }
  }, [searchParams]);

  // Already subscribed
  if (isActive) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <span className="text-6xl mb-4">✅</span>
        <h1 className="font-display text-3xl text-foreground mb-2 text-center">
          {t('Abonnement actif', 'Active subscription')}
        </h1>
        <p className="font-body text-sm text-muted-foreground text-center mb-8">
          {t('Tu as accès à toute la plateforme.', 'You have full access to the platform.')}
        </p>
        <button
          onClick={() => navigate('/home')}
          className="rounded-xl bg-yellow-500 text-black font-body font-semibold px-8 py-3"
        >
          {t('Accéder à la plateforme', 'Go to platform')}
        </button>
      </div>
    );
  }

  // Step 1: Choose plan
  if (step === 'plan') {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-10">
        <div className="max-w-lg mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-foreground mb-2">
              {t('Choisir ta formule', 'Choose your plan')}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {t(
                'Accès illimité à toutes les séances Pilates + suivi personnalisé',
                'Unlimited access to all Pilates sessions + personal tracking'
              )}
            </p>
          </div>

          {/* Caution badge */}
          <div className="rounded-2xl bg-card border border-border px-4 py-3 mb-5 flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="font-body text-sm font-semibold text-foreground">
                {t('Caution bancaire Swikly', 'Swikly bank deposit')}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {t(
                  '500€ pré-autorisés sur ta carte (non débités) · Libérés en fin d'abonnement',
                  '500€ pre-authorized on your card (not charged) · Released at end of subscription'
                )}
              </p>
            </div>
          </div>

          {/* Plan cards */}
          <div className="space-y-3 mb-6">
            {(['monthly', 'annual', 'commitment'] as SubscriptionPlan[]).map(planId => (
              <PlanCard
                key={planId}
                planId={planId}
                selected={selectedPlan === planId}
                onSelect={() => setSelectedPlan(planId)}
                language={language}
              />
            ))}
          </div>

          {error && <p className="font-body text-sm text-red-400 mb-4 text-center">{error}</p>}

          <button
            onClick={() => setStep('contract')}
            className="w-full rounded-xl bg-yellow-500 text-black font-body font-semibold py-4 text-base"
          >
            {t('Continuer →', 'Continue →')}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Contract
  if (step === 'contract') {
    const plan = PLANS[selectedPlan];
    const isCommitment = selectedPlan === 'commitment';

    const handleProceedToPayment = async () => {
      if (!contractAccepted) return;
      setLoading(true);
      setError(null);
      const { url, error: checkoutError } = await createCheckout(selectedPlan, contractAccepted);
      setLoading(false);
      if (checkoutError || !url) {
        setError(checkoutError ?? t('Erreur lors de la création du paiement.', 'Error creating payment.'));
        return;
      }
      window.location.href = url;
    };

    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-10">
        <div className="max-w-lg mx-auto w-full">
          <button onClick={() => setStep('plan')} className="font-body text-sm text-muted-foreground mb-6">
            ← {t('Retour', 'Back')}
          </button>

          <h1 className="font-display text-3xl text-foreground mb-2">
            {t('Contrat & Conditions', 'Contract & Terms')}
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            {t('Formule choisie', 'Selected plan')} : <strong>{t(plan.name_fr, plan.name_en)}</strong>
            {' — '}
            {selectedPlan === 'annual'
              ? '588€ / an'
              : plan.price + '€ / ' + t('mois', 'month')}
          </p>

          {/* Contract text */}
          <div className="rounded-3xl bg-card border border-border p-5 mb-5 max-h-64 overflow-y-auto">
            <h2 className="font-body font-semibold text-foreground mb-3">
              {t('Conditions Générales d'Abonnement', 'General Subscription Terms')}
            </h2>
            <div className="font-body text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p><strong>{t('1. Objet', '1. Purpose')}</strong><br />
              {t(
                'Le présent contrat régit l'accès à la plateforme The Reformer Studio, permettant l'accès aux contenus vidéo de Pilates et au suivi personnalisé.',
                'This contract governs access to The Reformer Studio platform, providing access to Pilates video content and personalized tracking.'
              )}</p>

              <p><strong>{t('2. Formule et tarification', '2. Plan and pricing')}</strong><br />
              {selectedPlan === 'monthly' && t(
                'Abonnement mensuel à 49€/mois, sans engagement. Résiliation possible à tout moment avec un préavis d'un mois.',
                'Monthly subscription at 49€/month, no commitment. Cancellable anytime with one month's notice.'
              )}
              {selectedPlan === 'annual' && t(
                'Abonnement annuel à 588€, payé en une fois. Donne accès à la plateforme pour 12 mois. Non remboursable.',
                'Annual subscription at 588€, paid once. Gives access to the platform for 12 months. Non-refundable.'
              )}
              {selectedPlan === 'commitment' && t(
                'Abonnement avec engagement de 12 mois à 56€/mois (total 672€). Les mensualités sont dues même en cas de résiliation anticipée. En cas de résiliation avant le terme, le solde restant sera exigible immédiatement.',
                '12-month commitment subscription at 56€/month (total 672€). Monthly payments are due even in case of early termination. In case of early cancellation, the remaining balance will be immediately due.'
              )}</p>

              <p><strong>{t('3. Caution bancaire', '3. Security deposit')}</strong><br />
              {t(
                'Une caution de 500€ sera pré-autorisée via Swikly sur ta carte bancaire. Cette somme n'est pas débitée et sera libérée à la fin de l'abonnement, sous réserve du respect des conditions d'utilisation.',
                'A 500€ deposit will be pre-authorized via Swikly on your bank card. This amount is not charged and will be released at the end of the subscription, subject to compliance with terms of use.'
              )}</p>

              <p><strong>{t('4. Accès et contenu', '4. Access and content')}</strong><br />
              {t(
                'L'accès à la plateforme est strictement personnel et non transférable. Tout partage de compte entraîne la résiliation immédiate sans remboursement.',
                'Access to the platform is strictly personal and non-transferable. Any account sharing results in immediate termination without refund.'
              )}</p>

              {isCommitment && (
                <p className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                  <strong>⚠️ {t('ENGAGEMENT FERME 12 MOIS', '⚠️ FIRM 12-MONTH COMMITMENT')}</strong><br />
                  {t(
                    'En acceptant ces conditions, vous vous engagez irrévocablement pour une durée de 12 mois. Le non-paiement d'une mensualité entraîne l'exigibilité immédiate du solde restant ainsi que des frais de recouvrement.',
                    'By accepting these terms, you irrevocably commit for a period of 12 months. Non-payment of a monthly installment results in immediate enforceability of the remaining balance plus collection fees.'
                  )}
                </p>
              )}

              <p><strong>{t('5. Résiliation', '5. Cancellation')}</strong><br />
              {t(
                'Toute demande de résiliation doit être faite par email à contact@thereformerstudio.com. La résiliation prend effet à la fin de la période en cours pour l'abonnement mensuel sans engagement.',
                'All cancellation requests must be made by email to contact@thereformerstudio.com. Cancellation takes effect at the end of the current period for monthly subscriptions without commitment.'
              )}</p>
            </div>
          </div>

          {/* Accept checkbox */}
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <div
              onClick={() => setContractAccepted(!contractAccepted)}
              className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all cursor-pointer ${
                contractAccepted ? 'bg-yellow-500 border-yellow-500' : 'border-border bg-card'
              }`}
            >
              {contractAccepted && <span className="text-black text-xs font-bold">✓</span>}
            </div>
            <span className="font-body text-sm text-foreground">
              {t(
                'J'ai lu et j'accepte les conditions générales d'abonnement, y compris les conditions d'engagement.',
                'I have read and accept the general subscription terms, including the commitment conditions.'
              )}
            </span>
          </label>

          {error && <p className="font-body text-sm text-red-400 mb-4">{error}</p>}

          <button
            onClick={handleProceedToPayment}
            disabled={!contractAccepted || loading}
            className="w-full rounded-xl bg-yellow-500 text-black font-body font-semibold py-4 text-base disabled:opacity-40"
          >
            {loading ? '...' : t('Procéder au paiement →', 'Proceed to payment →')}
          </button>
          <p className="font-body text-xs text-muted-foreground text-center mt-3">
            🔒 {t('Paiement sécurisé via Stripe', 'Secure payment via Stripe')}
          </p>
        </div>
      </div>
    );
  }

  // Step 3: Swikly deposit
  if (step === 'deposit') {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-10">
        <div className="max-w-lg mx-auto w-full">
          <div className="text-center mb-8">
            <span className="text-5xl block mb-4">✅</span>
            <h1 className="font-display text-3xl text-foreground mb-2">
              {t('Paiement confirmé !', 'Payment confirmed!')}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {t(
                'Il reste une dernière étape : la caution bancaire de 500€ via Swikly.',
                'One last step: the 500€ bank deposit via Swikly.'
              )}
            </p>
          </div>

          <div className="rounded-3xl bg-card border border-border p-5 mb-6">
            <h2 className="font-body font-semibold text-foreground mb-2">
              🔐 {t('Caution Swikly — 500€', 'Swikly Deposit — 500€')}
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-4">
              {t(
                'Swikly pré-autorise 500€ sur ta carte. Cette somme n'est PAS débitée — elle sert uniquement de garantie. Elle est libérée automatiquement à la fin de ton abonnement.',
                'Swikly pre-authorizes 500€ on your card. This amount is NOT charged — it serves as a guarantee only. It is automatically released at the end of your subscription.'
              )}
            </p>
            <div className="space-y-2 mb-4">
              {[
                t('Aucun débit immédiat', 'No immediate charge'),
                t('Libération automatique en fin d'abonnement', 'Automatic release at subscription end'),
                t('Protège la plateforme et tes données', 'Protects the platform and your data'),
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-green-500 text-sm">✓</span>
                  <span className="font-body text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <a
              href={SWIKLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSwiklyDone(true)}
              className="block w-full rounded-xl bg-foreground text-background font-body font-semibold py-4 text-center text-sm"
            >
              {t('Déposer ma caution sur Swikly →', 'Submit my deposit on Swikly →')}
            </a>
          </div>

          {swiklyDone && (
            <button
              onClick={() => {
                setStep('success');
                refresh();
              }}
              className="w-full rounded-xl bg-yellow-500 text-black font-body font-semibold py-4 text-base"
            >
              {t('J'ai déposé ma caution →', 'I've submitted my deposit →')}
            </button>
          )}

          <button
            onClick={() => setStep('success')}
            className="w-full text-center font-body text-xs text-muted-foreground mt-3"
          >
            {t('Passer pour l'instant (à faire avant le 1er accès)', 'Skip for now (required before first access)')}
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <span className="text-6xl mb-4">🎉</span>
      <h1 className="font-display text-4xl text-foreground mb-2 text-center">
        {t('Bienvenue !', 'Welcome!')}
      </h1>
      <p className="font-body text-sm text-muted-foreground text-center mb-8">
        {t(
          'Ton abonnement est actif. La plateforme t'attend.',
          'Your subscription is active. The platform is ready for you.'
        )}
      </p>
      <button
        onClick={() => navigate('/home')}
        className="rounded-xl bg-yellow-500 text-black font-body font-semibold px-10 py-4 text-base"
      >
        {t('Accéder à la plateforme 🧘', 'Access the platform 🧘')}
      </button>
    </div>
  );
}
