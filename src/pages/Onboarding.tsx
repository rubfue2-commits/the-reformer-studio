import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '@/hooks/usePreferences';
import { useLanguage } from '@/i18n/LanguageContext';

type Goal = 'weight_loss' | 'strength' | 'flexibility' | 'posture' | 'rehabilitation' | 'relaxation';
type Level = 'beginner' | 'intermediate' | 'advanced';
type Focus = 'core' | 'legs' | 'arms' | 'back' | 'full_body';

const GOALS: { id: Goal; fr: string; en: string; emoji: string }[] = [
  { id: 'weight_loss',    fr: 'Perte de poids',   en: 'Weight loss',   emoji: '🔥' },
  { id: 'strength',       fr: 'Renforcement',      en: 'Strength',      emoji: '💪' },
  { id: 'flexibility',    fr: 'Souplesse',         en: 'Flexibility',   emoji: '🧘' },
  { id: 'posture',        fr: 'Posture',           en: 'Posture',       emoji: '🎯' },
  { id: 'rehabilitation', fr: 'Rééducation',       en: 'Rehabilitation',emoji: '🩺' },
  { id: 'relaxation',     fr: 'Relaxation',        en: 'Relaxation',    emoji: '✨' },
];

const LEVELS: { id: Level; fr: string; en: string; desc_fr: string; desc_en: string }[] = [
  { id: 'beginner',     fr: 'Débutante',      en: 'Beginner',      desc_fr: 'Je commence le pilates',           desc_en: 'Just starting pilates' },
  { id: 'intermediate', fr: 'Intermédiaire',  en: 'Intermediate',  desc_fr: 'Je pratique depuis quelques mois', desc_en: 'Practicing for a few months' },
  { id: 'advanced',     fr: 'Avancée',        en: 'Advanced',      desc_fr: "Je pratique depuis plus d'un an",  desc_en: 'Practicing for over a year' },
];

const FOCUSES: { id: Focus; fr: string; en: string; emoji: string }[] = [
  { id: 'core',      fr: 'Centre / Abdos', en: 'Core',       emoji: '⭕' },
  { id: 'legs',      fr: 'Jambes',         en: 'Legs',        emoji: '🦵' },
  { id: 'arms',      fr: 'Bras',           en: 'Arms',        emoji: '💪' },
  { id: 'back',      fr: 'Dos',            en: 'Back',        emoji: '🔙' },
  { id: 'full_body', fr: 'Corps entier',   en: 'Full body',   emoji: '🌟' },
];

const FREQUENCIES = [2, 3, 4, 5];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = usePreferences();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [frequency, setFrequency] = useState(3);
  const [focuses, setFocuses] = useState<Focus[]>([]);
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleGoal = (g: Goal) =>
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const toggleFocus = (f: Focus) =>
    setFocuses(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const handleFinish = async () => {
    setSaving(true);
    const { error } = await completeOnboarding({
      goals: goals as any,
      experience_level: level,
      weekly_frequency: frequency,
      focus_areas: focuses as any,
    });
    setSaving(false);
    if (!error) navigate('/home');
  };

  const canNext = () => {
    if (step === 0) return goals.length > 0;
    if (step === 1) return level !== null;
    if (step === 2) return true;
    if (step === 3) return focuses.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-border">
        <div
          className="h-1 bg-yellow-500 transition-all duration-500"
          style={{ width: progress + '%' }}
        />
      </div>

      <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
        {/* Step indicator */}
        <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-2">
          {t('Étape', 'Step')} {step + 1}/{totalSteps}
        </p>

        {/* ─── STEP 0: GOALS ─── */}
        {step === 0 && (
          <>
            <h1 className="font-display text-3xl text-foreground mb-1">
              {t('Tes objectifs', 'Your goals')}
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              {t('Choisis tout ce qui te correspond.', 'Select everything that applies to you.')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    goals.includes(g.id)
                      ? 'border-yellow-500 bg-yellow-500/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  <span className="text-2xl block mb-2">{g.emoji}</span>
                  <span className="font-body text-sm font-medium">
                    {language === 'fr' ? g.fr : g.en}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ─── STEP 1: LEVEL ─── */}
        {step === 1 && (
          <>
            <h1 className="font-display text-3xl text-foreground mb-1">
              {t('Ton niveau', 'Your level')}
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              {t('Sois honnête, aucun niveau n'est meilleur qu'un autre.', 'Be honest, no level is better than another.')}
            </p>
            <div className="space-y-3">
              {LEVELS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition-all ${
                    level === l.id
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <p className="font-body font-semibold text-foreground text-base">
                    {language === 'fr' ? l.fr : l.en}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    {language === 'fr' ? l.desc_fr : l.desc_en}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ─── STEP 2: FREQUENCY ─── */}
        {step === 2 && (
          <>
            <h1 className="font-display text-3xl text-foreground mb-1">
              {t('Ta fréquence', 'Your frequency')}
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-8">
              {t('Combien de séances par semaine ?', 'How many sessions per week?')}
            </p>
            <div className="flex justify-center gap-4 mt-4">
              {FREQUENCIES.map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`w-16 h-16 rounded-2xl font-display text-2xl transition-all ${
                    frequency === f
                      ? 'bg-yellow-500 text-black'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="text-center font-body text-sm text-muted-foreground mt-6">
              {frequency}×&nbsp;{t('par semaine', 'per week')}
            </p>
          </>
        )}

        {/* ─── STEP 3: FOCUS AREAS ─── */}
        {step === 3 && (
          <>
            <h1 className="font-display text-3xl text-foreground mb-1">
              {t('Zones de travail', 'Focus areas')}
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              {t('Quelles zones veux-tu cibler ?', 'Which areas do you want to target?')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {FOCUSES.map(f => (
                <button
                  key={f.id}
                  onClick={() => toggleFocus(f.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    focuses.includes(f.id)
                      ? 'border-yellow-500 bg-yellow-500/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  <span className="text-2xl block mb-2">{f.emoji}</span>
                  <span className="font-body text-sm font-medium">
                    {language === 'fr' ? f.fr : f.en}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-auto pt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 rounded-xl border border-border py-3 font-body text-sm text-muted-foreground"
            >
              {t('Retour', 'Back')}
            </button>
          )}
          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 rounded-xl bg-foreground text-background font-body py-3 text-sm disabled:opacity-40"
            >
              {t('Continuer', 'Continue')}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canNext() || saving}
              className="flex-1 rounded-xl bg-yellow-500 text-black font-body py-3 text-sm font-semibold disabled:opacity-40"
            >
              {saving ? '...' : t("C'est parti !", "Let's go!")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
