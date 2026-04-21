import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts, useFavorites } from '@/hooks/useWorkouts';
import { useVideoUrl, getThumbnailUrl } from '@/hooks/useVideo';
import { useSessions } from '@/hooks/useSessions';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Workout } from '@/lib/database.types';

type Filter = 'all' | 'beginner' | 'intermediate' | 'advanced';

function PlayerModal({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const { url, loading, load } = useVideoUrl(workout.video_url);
  const { logSession } = useSessions();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  if (!url && !loading && workout.video_url) load();

  const handleDone = async () => {
    await logSession({
      workout_id: workout.id,
      completed_at: new Date().toISOString(),
      duration_minutes: workout.duration_minutes,
      calories_burned: workout.estimated_calories ?? undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onClose} className="text-white text-2xl w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
          x
        </button>
        <p className="font-body text-sm text-white flex-1 text-center px-4 truncate">
          {language === 'fr' ? workout.name_fr : workout.name_en}
        </p>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        {loading && <p className="font-body text-sm text-white/50">{t('Chargement...', 'Loading...')}</p>}
        {!workout.video_url && (
          <div className="text-center">
            <span className="text-5xl block mb-3">🎬</span>
            <p className="font-body text-white/60">{t('Video bientot disponible', 'Video coming soon')}</p>
          </div>
        )}
        {url && <video src={url} controls autoPlay className="w-full rounded-2xl" style={{ maxHeight: 'calc(100vh - 220px)' }} />}
      </div>

      <div className="px-6 pb-10 pt-4">
        <button onClick={handleDone}
          className="w-full rounded-xl bg-primary text-white font-body font-semibold py-4">
          {t('Seance terminee !', 'Session done!')}
        </button>
      </div>
    </div>
  );
}

function WorkoutCard({ workout, onPlay, onFav, isFav }: { workout: Workout; onPlay: () => void; onFav: () => void; isFav: boolean }) {
  const { language } = useLanguage();
  const name = language === 'fr' ? workout.name_fr : workout.name_en;
  const thumbSrc = workout.thumbnail_url ? getThumbnailUrl(workout.thumbnail_url) : null;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="relative h-40 bg-muted flex items-center justify-center cursor-pointer"
        style={thumbSrc ? { backgroundImage: `url(${thumbSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        onClick={onPlay}>
        {!thumbSrc && <span className="text-4xl opacity-30">🎬</span>}
        <div className="absolute inset-0 flex items-center justify-center">
          {workout.video_url ? (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-white text-lg ml-1">▶</span>
            </div>
          ) : (
            <div className="rounded-full bg-black/60 px-3 py-1">
              <span className="font-body text-xs text-white">{language === 'fr' ? 'Bientot' : 'Soon'}</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 rounded px-2 py-0.5">
          <span className="font-body text-[10px] text-white">{workout.duration_minutes} min</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onFav(); }}
          className="absolute top-2 right-2 bg-black/40 rounded-full w-8 h-8 flex items-center justify-center text-base">
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="p-3">
        <p className="font-body font-medium text-foreground text-sm truncate">{name}</p>
        <p className="font-body text-xs text-muted-foreground mt-0.5">{workout.duration_minutes} min · {workout.difficulty}</p>
      </div>
    </div>
  );
}

export default function VideoLibrary() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;
  const [filter, setFilter] = useState<Filter>('all');
  const [playing, setPlaying] = useState<Workout | null>(null);
  const { workouts, loading } = useWorkouts(filter !== 'all' ? { difficulty: filter } : {});
  const { isFavorite, toggle } = useFavorites();

  const filters: { id: Filter; fr: string; en: string }[] = [
    { id: 'all',          fr: 'Toutes',        en: 'All'          },
    { id: 'beginner',     fr: 'Debutant',       en: 'Beginner'     },
    { id: 'intermediate', fr: 'Intermediaire',  en: 'Intermediate' },
    { id: 'advanced',     fr: 'Avance',         en: 'Advanced'     },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-display text-3xl text-foreground mb-1">{t('Seances', 'Sessions')}</h1>
        <p className="font-body text-sm text-muted-foreground">{workouts.length} {t('seance(s)', 'session(s)')}</p>
      </div>

      <div className="px-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs border flex-shrink-0 transition-all ${
                filter === f.id ? 'bg-foreground text-background border-foreground' : 'bg-card text-muted-foreground border-border'
              }`}>
              {language === 'fr' ? f.fr : f.en}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="rounded-2xl bg-card border border-border h-52 animate-pulse" />)}
          </div>
        ) : workouts.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border p-8 text-center">
            <span className="text-4xl block mb-3">🎬</span>
            <p className="font-display text-xl text-foreground mb-1">{t('Bientot disponible', 'Coming soon')}</p>
            <p className="font-body text-sm text-muted-foreground">{t('Les videos arrivent bientot !', 'Videos are coming soon!')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {workouts.map(w => (
              <WorkoutCard key={w.id} workout={w}
                onPlay={() => setPlaying(w)}
                onFav={() => toggle(w.id)}
                isFav={isFavorite(w.id)} />
            ))}
          </div>
        )}
      </div>

      {playing && <PlayerModal workout={playing} onClose={() => setPlaying(null)} />}

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around px-4 py-3">
        {[
          { path: '/home',     label: t('Accueil','Home'),    active: false },
          { path: '/library',  label: t('Videos','Videos'),   active: true  },
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
