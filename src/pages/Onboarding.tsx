import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '@/hooks/usePreferences';
import { useLanguage } from '@/i18n/LanguageContext';

type Goal = 'weight_loss' | 'strength' | 'flexibility' | 'posture' | 'rehabilitation' | 'relaxation';
type Level = 'beginner' | 'intermediate' | 'advanced';
type Focus = 'core' | 'legs' | 'arms' | 'back' | 'full_body';

const GOALS = [
  { id: 'weight_loss'    as Goal, fr: 'Perte de poids', en: 'Weight loss',   emoji: '🔥' },
  { id: 'strength'       as Goal, fr: 'Renforcement',   en: 'Strength',      emoji: '💪' },
  { id: 'flexibility'    as Goal, fr: 'Souplesse',      en: 'Flexibility',   emoji: '🧘' },
  { id: 'posture'        as Goal, fr: 'Posture',        en: 'Posture',       emoji: '🎯' },
  { id: 'rehabilitation' as Goal, fr: 'Reeducation',    en: 'Rehab',         emoji: '🩺' },
  { id: 'relaxation'     as Goal, fr: 'Relaxation',     en: 'Relaxation',    emoji: '✨'       },
];

const LEVELS = [
  { id: 'beginner'     as Level, fr: 'Debutante',     en: 'Beginner',     desc_fr: 'Je commence le pilates',   desc_en: 'Just starting pilates'   },
  { id: 'intermediate' as Level, fr: 'Intermediaire', en: 'Intermediate', desc_fr: 'Quelques mois de pratique', desc_en: 'A few months of practice' },
  { id: 'advanced'     as Level, fr: 'Avancee',       en: 'Advanced',     desc_fr: 'Plus de un an',            desc_en: 'Over a year of practice'  },
];

const FOCUSES = [
  { id: 'core'      as Focus, fr: 'Abdos / Centre', en: 'Core',       emoji: '⭕' },
  { id: 'legs'      as Focus, fr: 'Jambes',         en: 'Legs',       emoji: '🦵' },
  { id: 'arms'      as Focus, fr: 'Bras',           en: 'Arms',       emoji: '💪' },
  { id: 'back'      as Focus, fr: 'Dos',            en: 'Back',       emoji: '🔙' },
  { id: 'full_body' as Focus, fr: 'Corps entier',   en: 'Full body',  emoji: '🌟' },
];

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

  const toggleGoal  = (g: Goal)  => setGoals(p   => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);
  const toggleFocus = (f: Focus) => setFocuses(p  => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);

  const canNext = () => {
    if (step === 0) return goals.length > 0;
    if (step === 1) return level !== null;
    if (step === 3) return focuses.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    await completeOnboarding({
      goals: goals as any,
      experience_level: level,
      weekly_frequency: frequency,
      focus_areas: focuses as any,
    });
    setSaving(false);
    navigate('/home');
  };

  const chipActive   = (active: boolean) => ({
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8,
    padding: '16px 12px', borderRadius: 18, cursor: 'pointer',
    background: active ? 'rgba(196,150,58,0.18)' : 'var(--ios-card)',
    border: active ? '1.5px solid var(--ios-gold)' : '0.5px solid rgba(255,255,255,0.08)',
    transition: 'all 0.2s',
  });

  const stepTitles = [
    t('Tes objectifs', 'Your goals'),
    t('Ton niveau', 'Your level'),
    t('Ta frequence', 'Your frequency'),
    t('Zones de travail', 'Focus areas'),
  ];

  return (
    <div style={{ minHeight: '100%', background: 'var(--ios-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--ios-card2)', marginTop: 44 }}>
        <div style={{ height: '100%', width: `${((step + 1) / totalSteps) * 100}%`, background: 'var(--ios-gold)', transition: 'width 0.4s ease' }} />
      </div>

      {/* Header */}
      <div style={{ padding: '24px 24px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            style={{ background: 'none', border: 'none', color: 'var(--ios-gold)', fontSize: 26, cursor: 'pointer', padding: 0 }}>
            &#8249;
          </button>
        )}
        <div>
          <p style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: 'var(--ios-gold)', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>
            {step + 1} / {totalSteps}
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 34, fontWeight: 300, color: '#fff', margin: 0 }}>
            {stepTitles[step]}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>

        {/* Step 0: Goals */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {GOALS.map(g => {
              const active = goals.includes(g.id);
              return (
                <button key={g.id} onClick={() => toggleGoal(g.id)} style={chipActive(active)}>
                  <span style={{ fontSize: 28 }}>{g.emoji}</span>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: active ? 'var(--ios-gold)' : 'var(--ios-text-2)' }}>
                    {language === 'fr' ? g.fr : g.en}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 1: Level */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEVELS.map(l => {
              const active = level === l.id;
              return (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  style={{ ...chipActive(active), flexDirection: 'row', gap: 14, padding: '18px 20px', textAlign: 'left' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: active ? 'var(--ios-gold)' : 'transparent',
                    border: active ? '2px solid var(--ios-gold)' : '2px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && <span style={{ color: '#000', fontSize: 12, fontWeight: 700 }}>&#10003;</span>}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 16, fontWeight: 500, color: active ? 'var(--ios-gold)' : '#fff', margin: '0 0 3px' }}>
                      {language === 'fr' ? l.fr : l.en}
                    </p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--ios-text-3)', margin: 0 }}>
                      {language === 'fr' ? l.desc_fr : l.desc_en}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Frequency */}
        {step === 2 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--ios-text-3)', marginBottom: 36 }}>
              {t('Combien de seances par semaine ?', 'How many sessions per week?')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
              {[2, 3, 4, 5].map(f => (
                <button key={f} onClick={() => setFrequency(f)} style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: frequency === f ? 'var(--ios-gold)' : 'var(--ios-card)',
                  border: frequency === f ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                  color: frequency === f ? '#000' : '#fff',
                  fontFamily: 'Cormorant Garamond', fontSize: 32, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {f}
                </button>
              ))}
            </div>
            <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: 'var(--ios-text-2)', marginTop: 20 }}>
              {frequency}x / {t('semaine', 'week')}
            </p>
          </div>
        )}

        {/* Step 3: Focus */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FOCUSES.map(f => {
              const active = focuses.includes(f.id);
              return (
                <button key={f.id} onClick={() => toggleFocus(f.id)} style={chipActive(active)}>
                  <span style={{ fontSize: 28 }}>{f.emoji}</span>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500, color: active ? 'var(--ios-gold)' : 'var(--ios-text-2)' }}>
                    {language === 'fr' ? f.fr : f.en}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 20px 36px' }}>
        {step < totalSteps - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="ios-btn-primary">
            {t('Continuer', 'Continue')}
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!canNext() || saving} className="ios-btn-primary">
            {saving ? '...' : t('Commencer ! 🧘', 'Start! 🧘')}
          </button>
        )}
      </div>
    </div>
  );
}
