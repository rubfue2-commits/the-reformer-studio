import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription, PLANS, type SubscriptionPlan } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n/LanguageContext';

const SWIKLY_URL = 'https://www.swikly.com/'; // ← Remplace par ton lien Swikly

// ─────────────────────────────────────────────────────────────────────────────
// Plan Card
// ─────────────────────────────────────────────────────────────────────────────
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
  const isAnnual = planId === 'annual';

  return (
    <button
      onClick={onSelect}
      className={`relative w-full rounded-3xl border-2 p-6 text-left transition-all ${
        selected ? 'border-yellow-500 bg-yellow-500/5' : 'border-border bg-card'
      }`}
    >
      {/* Popular badge */}
      {isAnnual && (
        <div className="absolute -top-3 left-6">
          <span className="bg-yellow-500 text-black font-body text-[10px] font-bold tracking-widest uppercase rounded-full px-3 py-1">
            ⭐ {t('Recommandé', 'Recommended')}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <span
            className="font-body text-[10px] tracking-widest uppercase rounded-full px-3 py-1 font-semibold"
            style={{ backgroundColor: plan.color + '22', color: plan.color }}
          >
            {t(plan.badge_fr, plan.badge_en)}
          </span>
          <h3 className="font-display text-2xl text-foreground mt-3">
            {t(plan.name_fr, plan.name_en)}
          </h3>
        </div>
        <div className={`w-7 h-7 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 transition-all ${
          selected ? 'border-yellow-500 bg-yellow-500' : 'border-border'
        }`}>
          {selected && <span className="text-black text-sm font-bold">✓</span>}
        </div>
      </div>

      {/* Price */}
      {isAnnual ? (
        <div className="mb-1">
          <span className="font-display text-5xl text-foreground">{plan.price}€</span>
          <span className="font-body text-base text-muted-foreground ml-1">/{t('an','year')}</span>
          <div className="mt-1">
            <span className="font-body text-sm text-yellow-500 font-semibold">
              = {plan.per_month}€/{t('mois','month')}
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-1">
          <span className="font-display text-5xl text-foreground">{plan.price}€</span>
          <span className="font-body text-base text-muted-foreground ml-1">/{t('mois','month')}</span>
          <div className="mt-1">
            <span className="font-body text-sm text-muted-foreground">
              {t('Total','Total')} : {plan.total}€/{t('an','year')}
            </span>
          </div>
        </div>
      )}

      <p className="font-body text-sm text-muted-foreground mt-3">
        {t(plan.description_fr, plan.description_en)}
      </p>

      {/* Commitment warning */}
      {plan.commitment && (
        <div className="mt-4 rounded-xl bg-purple-500/10 border border-purple-500/20 px-4 py-3">
          <p className="font-body text-xs text-purple-400">
            ⚠️ {t(
              'Engagement contractuel 12 mois. Résiliation anticipée = solde restant dû.',
              '12-month contractual commitment. Early cancellation = remaining balance due.'
            )}
          </p>
        </div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;
  const { subscription, isActive, createCheckout, refresh } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('annual');
  const [contractAccepted, setContractAccepted] = useState(false);
  const [swiklyDone, setSwiklyDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'plan' | 'contract' | 'deposit' | 'success'>('plan');

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      setStep('deposit');
      refresh();
    }
    if (searchParams.get('canceled') === '1') {
      setError(t('Paiement annulé. Tu peux réessayer.', 'Payment canceled. You can try again.'));
    }
  }, [searchParams]);

  // Already subscribed
  if (isActive) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="text-6xl mb-4">✅</span>
        <h1 className="font-display text-3xl text-foreground mb-2">
          {t('Abonnement actif', 'Active subscription')}
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          {t('Tu as accès à toute la plateforme.', 'You have full access to the platform.')}
        </p>
        <button onClick={() => navigate('/home')}
          className="rounded-xl bg-yellow-500 text-black font-body font-semibold px-8 py-3">
          {t('Accéder à la plateforme →', 'Go to platform →')}
        </button>
      </div>
    );
  }

  // ── STEP 1 : Choose plan ──────────────────────────────────────────────────
  if (step === 'plan') {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-10">
        <div className="max-w-lg mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-foreground mb-2">
              {t('Ton abonnement', 'Your subscription')}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {t(
                'Accès illimité à toutes les séances · Suivi personnalisé · Vidéos HD',
                'Unlimited access to all sessions · Personal tracking · HD videos'
              )}
            </p>
          </div>

          {/* Caution info */}
          <div className="rounded-2xl bg-card border border-border px-4 py-4 mb-6 flex items-start gap-3">
            <span className="text-2xl mt-0.5">🔐</span>
            <div>
              <p className="font-body text-sm font-semibold text-foreground mb-1">
                {t('Caution bancaire 500€ via Swikly', 'Bank deposit 500€ via Swikly')}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {t(
                  'Montant pré-autorisé sur ta carte, non débité. Libéré à la fin de l'abonnement.',
                  'Amount pre-authorized on your card, not charged. Released at end of subscription.'
                )}
              </p>
            </div>
          </div>

          {/* The 2 plans */}
          <div className="space-y-4 mb-6">
            {(['annual', 'commitment'] as SubscriptionPlan[]).map(planId => (
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

  // ── STEP 2 : Contract ─────────────────────────────────────────────────────
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
        setError(checkoutError ?? t('Erreur lors du paiement.', 'Payment error.'));
        return;
      }
      window.location.href = url;
    };

    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-10">
        <div className="max-w-lg mx-auto w-full">
          <button onClick={() => setStep('plan')}
            className="font-body text-sm text-muted-foreground mb-6">
            ← {t('Retour', 'Back')}
          </button>

          <h1 className="font-display text-3xl text-foreground mb-1">
            {t('Contrat d'abonnement', 'Subscription contract')}
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            {t('Formule', 'Plan')} :&nbsp;
            <strong style={{ color: plan.color }}>
              {t(plan.name_fr, plan.name_en)}
            </strong>
            &nbsp;—&nbsp;
            {selectedPlan === 'annual'
              ? '588€/an'
              : '56€/mois × 12 = 672€'}
          </p>

          {/* Contract body */}
          <div className="rounded-3xl bg-card border border-border p-5 mb-5 max-h-72 overflow-y-auto">
            <h2 className="font-body font-bold text-foreground mb-4 text-sm uppercase tracking-widest">
              {t('Conditions Générales d'Abonnement', 'General Subscription Terms')}
            </h2>
            <div className="font-body text-xs text-muted-foreground space-y-4 leading-relaxed">
              <p>
                <strong className="text-foreground">{t('1. Objet', '1. Purpose')}</strong><br />
                {t(
                  'Le présent contrat régit l'accès à la plateforme The Reformer Studio, donnant accès aux séances de Pilates en vidéo, au suivi personnalisé et aux fonctionnalités de l'application.',
                  'This contract governs access to The Reformer Studio platform, giving access to Pilates video sessions, personalized tracking, and app features.'
                )}
              </p>

              <p>
                <strong className="text-foreground">{t('2. Formule et tarification', '2. Plan & pricing')}</strong><br />
                {selectedPlan === 'annual'
                  ? t(
                      'Abonnement annuel à 588€ payé en une seule fois, donnant accès à la plateforme pour 12 mois consécutifs à compter de la date de paiement. Non remboursable après 14 jours.',
                      'Annual subscription at 588€ paid in one installment, giving access to the platform for 12 consecutive months from the date of payment. Non-refundable after 14 days.'
                    )
                  : t(
                      'Abonnement mensuel avec engagement ferme de 12 mois à 56€/mois (total 672€). Les mensualités sont prélevées automatiquement. En cas de résiliation anticipée, le solde des mensualités restantes devient immédiatement exigible.',
                      'Monthly subscription with firm 12-month commitment at 56€/month (total 672€). Monthly payments are automatically charged. In case of early termination, the remaining balance becomes immediately due.'
                    )
                }
              </p>

              <p>
                <strong className="text-foreground">{t('3. Caution bancaire Swikly', '3. Swikly bank deposit')}</strong><br />
                {t(
                  'Une caution de 500€ sera pré-autorisée via Swikly sur ta carte bancaire. Cette somme n'est pas débitée et sera libérée automatiquement à l'issue de l'abonnement, sous réserve du respect des présentes conditions.',
                  'A 500€ deposit will be pre-authorized via Swikly on your bank card. This amount is not charged and will be automatically released at the end of the subscription, subject to compliance with these terms.'
                )}
              </p>

              <p>
                <strong className="text-foreground">{t('4. Accès personnel', '4. Personal access')}</strong><br />
                {t(
                  'L'accès est strictement personnel et non partageable. Tout partage de compte entraîne la résiliation immédiate sans remboursement et l'exigibilité de la caution.',
                  'Access is strictly personal and non-shareable. Any account sharing results in immediate termination without refund and forfeiture of the deposit.'
                )}
              </p>

              <p>
                <strong className="text-foreground">{t('5. Résiliation', '5. Cancellation')}</strong><br />
                {selectedPlan === 'annual'
                  ? t(
                      'L'abonnement annuel n'est pas résiliable avant son terme. En cas de force majeure, une demande écrite peut être adressée à contact@thereformerstudio.com.',
                      'The annual subscription cannot be canceled before its term. In case of force majeure, a written request can be sent to contact@thereformerstudio.com.'
                    )
                  : t(
                      'L'abonnement avec engagement 12 mois ne peut être résilié avant le terme sans pénalités. La résiliation doit être notifiée par email à contact@thereformerstudio.com au moins 30 jours avant la fin du contrat.',
                      'The 12-month commitment subscription cannot be canceled before the end date without penalties. Cancellation must be notified by email to contact@thereformerstudio.com at least 30 days before contract end.'
                    )
                }
              </p>

              {isCommitment && (
                <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-3 mt-2">
                  <p className="text-purple-300 font-semibold text-xs">
                    ⚠️ {t(
                      'ENGAGEMENT FERME 12 MOIS — En signant ce contrat, vous vous engagez de manière irrévocable pour 12 mois. Tout impayé entraîne l'exigibilité immédiate du solde restant et des frais de recouvrement.',
                      'FIRM 12-MONTH COMMITMENT — By signing this contract, you irrevocably commit for 12 months. Any non-payment results in immediate enforceability of the remaining balance and collection fees.'
                    )}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground/60">
                {t(
                  'Conformément au RGPD, vos données sont traitées uniquement dans le cadre de la gestion de votre abonnement.',
                  'In accordance with GDPR, your data is processed solely for subscription management purposes.'
                )}
              </p>
            </div>
          </div>

          {/* Accept */}
          <label className="flex items-start gap-3 mb-5 cursor-pointer">
            <div
              onClick={() => setContractAccepted(!contractAccepted)}
              className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all cursor-pointer ${
                contractAccepted ? 'bg-yellow-500 border-yellow-500' : 'border-border bg-card'
              }`}
            >
              {contractAccepted && <span className="text-black text-xs font-bold">✓</span>}
            </div>
            <span className="font-body text-sm text-foreground leading-snug">
              {t(
                'J'ai lu et j'accepte les conditions générales d'abonnement, y compris les conditions d'engagement et de caution.',
                'I have read and accept the general subscription terms, including the commitment and deposit conditions.'
              )}
            </span>
          </label>

          {error && <p className="font-body text-sm text-red-400 mb-4">{error}</p>}

          <button
            onClick={handleProceedToPayment}
            disabled={!contractAccepted || loading}
            className="w-full rounded-xl bg-yellow-500 text-black font-body font-semibold py-4 text-base disabled:opacity-40"
          >
            {loading
              ? '...'
              : selectedPlan === 'annual'
              ? t('Payer 588€ →', 'Pay 588€ →')
              : t('Payer 56€/mois →', 'Pay 56€/month →')
            }
          </button>

          <p className="font-body text-xs text-muted-foreground text-center mt-3">
            🔒 {t('Paiement 100% sécurisé via Stripe', '100% secure payment via Stripe')}
          </p>
        </div>
      </div>
    );
  }

  // ── STEP 3 : Swikly deposit ───────────────────────────────────────────────
  if (step === 'deposit') {
    return (
      <div className="min-h-screen bg-background flex flex-col px-6 py-10">
        <div className="max-w-lg mx-auto w-full text-center">
          <span className="text-6xl block mb-4">✅</span>
          <h1 className="font-display text-3xl text-foreground mb-2">
            {t('Paiement confirmé !', 'Payment confirmed!')}
          </h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            {t(
              'Dernière étape : dépose ta caution bancaire de 500€ via Swikly.',
              'Last step: submit your 500€ bank deposit via Swikly.'
            )}
          </p>

          <div className="rounded-3xl bg-card border border-border p-6 mb-6 text-left">
            <h2 className="font-body font-semibold text-foreground mb-3">
              🔐 {t('Caution Swikly — 500€', 'Swikly Deposit — 500€')}
            </h2>
            <div className="space-y-2 mb-5">
              {[
                t('Non débitée sur ton compte', 'Not charged from your account'),
                t('Pré-autorisation bancaire uniquement', 'Bank pre-authorization only'),
                t('Libérée automatiquement en fin d'abonnement', 'Automatically released at subscription end'),
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="font-body text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <a
              href={SWIKLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSwiklyDone(true)}
              className="block w-full rounded-xl bg-foreground text-background font-body font-semibold py-4 text-center"
            >
              {t('Déposer ma caution sur Swikly →', 'Submit my deposit on Swikly →')}
            </a>
          </div>

          {swiklyDone ? (
            <button
              onClick={() => { setStep('success'); refresh(); }}
              className="w-full rounded-xl bg-yellow-500 text-black font-body font-semibold py-4"
            >
              {t('Caution déposée — Accéder à la plateforme →', 'Deposit done — Access platform →')}
            </button>
          ) : (
            <button
              onClick={() => setStep('success')}
              className="font-body text-xs text-muted-foreground underline"
            >
              {t('Passer (à compléter dans les 48h)', 'Skip (to complete within 48h)')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 4 : Success ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl mb-4">🎉</span>
      <h1 className="font-display text-4xl text-foreground mb-2">
        {t('Bienvenue !', 'Welcome!')}
      </h1>
      <p className="font-body text-sm text-muted-foreground mb-8">
        {t(
          'Ton abonnement est actif. La plateforme t'attend !',
          'Your subscription is active. The platform is ready for you!'
        )}
      </p>
      <button
        onClick={() => navigate('/home')}
        className="rounded-xl bg-yellow-500 text-black font-body font-semibold px-10 py-4 text-lg"
      >
        {t('Commencer mon Pilates 🧘', 'Start my Pilates 🧘')}
      </button>
    </div>
  );
}
