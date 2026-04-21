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
  const greeting = hour < 12 ? t('Bonjour', 'Good morning') : hour < 18 ? t('Bon apres-midi', 'Good afternoon') : t('Bonsoir', 'Good evening');

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const done = sessions.some(s => new Date(s.completed_at).toDateString() === d.toDateString());
    return { done, isToday: i === 6, letter: ['L','M','M','J','V','S','D'][d.getDay() === 0 ? 6 : d.getDay() - 1] };
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">{greeting}</p>
          <h1 className="font-display text-4xl text-foreground capitalize">{firstName}</h1>
        </div>
        <button onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="font-display text-sm text-white">
            {(profile?.first_name ?? 'U')[0].toUpperCase()}
          </span>
        </button>
      </div>

      <div className="px-6 space-y-5">
        {/* Streak card */}
        <div className="rounded-3xl bg-card p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {t('Streak actuel', 'Current streak')}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-foreground">{stats.currentStreakDays}</span>
                <span className="font-body text-base text-muted-foreground">{t('jours', 'days')}</span>
              </div>
            </div>
            <span className="text-4xl">🔥</span>
          </div>
          <div className="flex gap-2 justify-between">
            {last7.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  day.done ? 'bg-primary text-white' : day.isToday ? 'border-2 border-primary text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {day.done ? '✓' : ''}
                </div>
                <span className={`font-body text-[10px] ${day.isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {day.letter}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('Seances', 'Sessions'), value: stats.totalSessions },
            { label: t('Cette sem.', 'This week'), value: stats.thisWeekCount },
            { label: t('Minutes', 'Minutes'), value: stats.totalMinutes },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-card border border-border p-4 text-center">
              <p className="font-display text-3xl text-foreground">{s.value}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Workouts */}
        <div>
          <h2 className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-3">
            {t('Commencer une seance', 'Start a session')}
          </h2>
          {loading ? (
            <div className="rounded-2xl bg-card border border-border p-5 text-center">
              <p className="font-body text-sm text-muted-foreground">{t('Chargement...', 'Loading...')}</p>
            </div>
          ) : workouts.slice(0, 3).map(w => (
            <div key={w.id} onClick={() => navigate('/library')}
              className="mb-2 rounded-2xl bg-card border border-border p-4 flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🧘</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-foreground text-sm truncate">
                  {language === 'fr' ? w.name_fr : w.name_en}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {w.duration_minutes} min · {w.difficulty}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm ml-0.5">▶</span>
              </div>
            </div>
          ))}
          {workouts.length === 0 && !loading && (
            <div className="rounded-2xl bg-card border border-border p-6 text-center">
              <span className="text-3xl block mb-2">🎬</span>
              <p className="font-body text-sm text-muted-foreground">{t('Videos bientot disponibles', 'Videos coming soon')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around px-4 py-3">
        {[
          { path: '/home',     label: t('Accueil','Home'),    active: true  },
          { path: '/library',  label: t('Videos','Videos'),   active: false },
          { path: '/progress', label: t('Progres','Progress'),active: false },
          { path: '/profile',  label: t('Profil','Profile'),  active: false },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 font-body text-[10px] uppercase tracking-wide ${item.active ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-1 h-1 rounded-full ${item.active ? 'bg-primary' : 'bg-transparent'}`} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
