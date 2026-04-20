import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useProfile } from '@/hooks/useProfile';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { stats, sessions } = useSessions();
  const { workouts, loading } = useWorkouts();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const firstName = profile?.first_name ?? t('toi', 'you');
  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('Bonjour', 'Good morning')
    : hour < 18
    ? t('Bon après-midi', 'Good afternoon')
    : t('Bonsoir', 'Good evening');

  // Build 7-day streak dots
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const done = sessions.some(s => new Date(s.completed_at).toDateString() === dateStr);
    return { done, isToday: i === 6, dayLetter: ['L','M','M','J','V','S','D'][d.getDay() === 0 ? 6 : d.getDay() - 1] };
  });

  return (
    <div className="ios-page" style={{ background: 'var(--ios-bg)' }}>
      <div className="ios-page-content" style={{ paddingTop: 16 }}>

        {/* Greeting */}
        <div style={{ padding: '0 20px 20px' }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--ios-text-2)', marginBottom: 4 }}>
            {greeting} 👋
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 38, fontWeight: 300, color: 'var(--ios-text)', margin: 0, letterSpacing: -0.5 }}>
            {firstName}
          </h1>
        </div>

        {/* Streak Card */}
        <div style={{ margin: '0 16px 12px', background: 'var(--ios-card)', borderRadius: 20, padding: '18px 18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: 'var(--ios-text-3)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>
                {t('Streak actuel', 'Current streak')}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'Cormorant Garamond', fontSize: 48, fontWeight: 400, color: 'var(--ios-text)', lineHeight: 1 }}>
                  {stats.currentStreakDays}
                </span>
                <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--ios-text-2)' }}>
                  {t('jours', 'days')}
                </span>
              </div>
            </div>
            <span style={{ fontSize: 36 }}>🔥</span>
          </div>
          {/* 7-day dots */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {last7.map((day, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                <div className={`ios-streak-dot ${day.done ? 'done' : day.isToday ? 'today' : 'empty'}`}>
                  {day.done ? '✓' : ''}
                </div>
                <span style={{ fontFamily: 'DM Sans', fontSize: 10, color: day.isToday ? 'var(--ios-gold)' : 'var(--ios-text-3)', fontWeight: day.isToday ? 600 : 400 }}>
                  {day.dayLetter}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '0 16px 20px' }}>
          {[
            { label: t('Séances', 'Sessions'), value: stats.totalSessions },
            { label: t('Cette sem.', 'This week'),  value: stats.thisWeekCount },
            { label: t('Minutes', 'Minutes'),   value: stats.totalMinutes },
          ].map(s => (
            <div key={s.label} className="ios-stat">
              <div className="ios-stat-value">{s.value}</div>
              <div className="ios-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Section: Séances */}
        <div className="ios-section-header">
          {t('Commencer maintenant', 'Start now')}
        </div>

        {loading ? (
          <div style={{ margin: '0 16px', background: 'var(--ios-card)', borderRadius: 16, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--ios-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : workouts.slice(0, 3).map(w => (
          <div
            key={w.id}
            className="ios-pressable"
            onClick={() => navigate('/library')}
            style={{ margin: '0 16px 8px', background: 'var(--ios-card)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}
          >
            {/* Thumbnail placeholder */}
            <div style={{ width: 52, height: 52, background: 'var(--ios-card2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 24 }}>🧘</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 15, fontWeight: 500, color: 'var(--ios-text)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {language === 'fr' ? w.name_fr : w.name_en}
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--ios-text-3)', margin: 0 }}>
                {w.duration_minutes} min · {t(
                  w.difficulty === 'beginner' ? 'Débutant' : w.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé',
                  w.difficulty === 'beginner' ? 'Beginner' : w.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'
                )}
              </p>
            </div>
            <div style={{ width: 36, height: 36, background: 'var(--ios-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#000', fontSize: 14, marginLeft: 2 }}>▶</span>
            </div>
          </div>
        ))}

        {workouts.length > 3 && (
          <button
            onClick={() => navigate('/library')}
            style={{ display: 'block', width: 'calc(100% - 32px)', margin: '4px 16px 0', background: 'none', border: 'none', color: 'var(--ios-gold)', fontFamily: 'DM Sans', fontSize: 14, fontWeight: 500, padding: '12px 0', cursor: 'pointer', textAlign: 'center' }}
          >
            {t('Voir toutes les séances', 'View all sessions')} →
          </button>
        )}

        {workouts.length === 0 && !loading && (
          <div style={{ margin: '0 16px', background: 'var(--ios-card)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🎬</span>
            <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--ios-text-2)', margin: 0 }}>
              {t('Les vidéos arrivent bientôt', 'Videos coming soon')}
            </p>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
