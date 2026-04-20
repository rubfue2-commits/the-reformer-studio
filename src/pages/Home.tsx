import { useNavigate } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { useProfile } from '@/hooks/useProfile';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { stats, sessions, logSession } = useSessions();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const firstName = profile?.first_name ?? t('toi', 'you');

  // Days of the week for streak display
  const weekDays = language === 'fr'
    ? ['L', 'M', 'M', 'J', 'V', 'S', 'D']
    : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Last 7 days activity
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const done = sessions.some(s => new Date(s.completed_at).toDateString() === dateStr);
    const isToday = i === 6;
    return { done, isToday };
  });

  const handleQuickLog = async (workoutId: string, durationMinutes: number) => {
    await logSession({
      workout_id: workoutId,
      completed_at: new Date().toISOString(),
      duration_minutes: durationMinutes,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">
            {t('Bonjour', 'Hello')}
          </p>
          <h1 className="font-display text-3xl text-foreground capitalize">{firstName} ✨</h1>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center"
        >
          <span className="font-display text-sm text-foreground">
            {(profile?.first_name ?? 'U')[0].toUpperCase()}
          </span>
        </button>
      </div>

      <div className="px-6 space-y-5">
        {/* Streak card */}
        <div className="rounded-3xl bg-card p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                {t('Streak actuel', 'Current streak')}
              </p>
              <p className="font-display text-4xl text-foreground">
                {stats.currentStreakDays}
                <span className="font-body text-base text-muted-foreground ml-1">
                  {t('jours', 'days')}
                </span>
              </p>
            </div>
            <span className="text-4xl">🔥</span>
          </div>
          {/* 7-day mini calendar */}
          <div className="flex gap-2">
            {last7.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  day.done
                    ? 'bg-yellow-500 text-black'
                    : day.isToday
                    ? 'border border-yellow-500 text-yellow-500'
                    : 'bg-border text-muted-foreground'
                }`}>
                  {day.done ? '✓' : day.isToday ? '·' : ''}
                </div>
                <span className="font-body text-[10px] text-muted-foreground">{weekDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('Séances', 'Sessions'), value: stats.totalSessions },
            { label: t('Cette sem.', 'This week'), value: stats.thisWeekCount },
            { label: t('Minutes', 'Minutes'), value: stats.totalMinutes },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-card border border-border p-4 text-center">
              <p className="font-display text-3xl text-foreground">{s.value}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Start a session */}
        <div>
          <h2 className="font-body text-sm tracking-widest uppercase text-muted-foreground mb-3">
            {t('Commencer une séance', 'Start a session')}
          </h2>
          {workoutsLoading ? (
            <div className="rounded-2xl bg-card border border-border p-5 text-center">
              <p className="font-body text-sm text-muted-foreground">
                {t('Chargement...', 'Loading...')}
              </p>
            </div>
          ) : workouts.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-5 text-center">
              <p className="font-body text-sm text-muted-foreground">
                {t('Aucune séance disponible pour l'instant.', 'No sessions available yet.')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.slice(0, 3).map(w => (
                <div
                  key={w.id}
                  className="rounded-2xl bg-card border border-border p-4 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm truncate">
                      {language === 'fr' ? w.name_fr : w.name_en}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {w.duration_minutes} {t('min', 'min')} · {t(
                        w.difficulty === 'beginner' ? 'Débutant' : w.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé',
                        w.difficulty === 'beginner' ? 'Beginner' : w.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/library')}
                    className="ml-3 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-black text-sm">▶</span>
                  </button>
                </div>
              ))}
              <button
                onClick={() => navigate('/library')}
                className="w-full rounded-2xl border border-border py-3 font-body text-sm text-muted-foreground"
              >
                {t('Voir toutes les séances →', 'View all sessions →')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around px-4 py-3">
        {[
          { path: '/home',     label: t('Accueil','Home'),    active: true  },
          { path: '/library',  label: t('Vidéos','Videos'),   active: false },
          { path: '/progress', label: t('Progrès','Progress'),active: false },
          { path: '/profile',  label: t('Profil','Profile'),  active: false },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 font-body text-[10px] uppercase tracking-wide ${
              item.active ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <span className={`w-1 h-1 rounded-full ${item.active ? 'bg-yellow-500' : 'bg-transparent'}`} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
