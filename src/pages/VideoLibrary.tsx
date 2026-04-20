import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useVideoUrl, getThumbnailUrl } from '@/hooks/useVideo';
import { useSessions } from '@/hooks/useSessions';
import { useFavorites } from '@/hooks/useWorkouts';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Workout } from '@/lib/database.types';

type FilterDiff = 'all' | 'beginner' | 'intermediate' | 'advanced';

function VideoCard({
  workout,
  onPlay,
  onFavorite,
  isFavorite,
}: {
  workout: Workout;
  onPlay: (w: Workout) => void;
  onFavorite: (id: string) => void;
  isFavorite: boolean;
}) {
  const { language } = useLanguage();
  const name = language === 'fr' ? workout.name_fr : workout.name_en;
  const thumbSrc = workout.thumbnail_url ? getThumbnailUrl(workout.thumbnail_url) : null;
  const diffLabel =
    workout.difficulty === 'beginner' ? (language === 'fr' ? 'Débutant' : 'Beginner') :
    workout.difficulty === 'intermediate' ? (language === 'fr' ? 'Intermédiaire' : 'Intermediate') :
    (language === 'fr' ? 'Avancé' : 'Advanced');

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Thumbnail */}
      <div
        className="relative h-40 bg-border flex items-center justify-center cursor-pointer"
        onClick={() => onPlay(workout)}
        style={thumbSrc ? { backgroundImage: 'url(' + thumbSrc + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!thumbSrc && (
          <span className="text-4xl opacity-30">🎬</span>
        )}
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {workout.video_url ? (
            <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
              <span className="text-black text-xl ml-1">▶</span>
            </div>
          ) : (
            <div className="rounded-full bg-black/60 px-3 py-1">
              <span className="font-body text-xs text-white">
                {language === 'fr' ? 'Bientôt' : 'Coming soon'}
              </span>
            </div>
          )}
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 rounded-full px-2 py-0.5">
          <span className="font-body text-[10px] text-white">{workout.duration_minutes} min</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-body font-semibold text-foreground text-sm truncate">{name}</p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">{diffLabel}</p>
        </div>
        <button
          onClick={() => onFavorite(workout.id)}
          className="text-lg flex-shrink-0 mt-0.5"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}

function VideoPlayer({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const { url, loading, error, load } = useVideoUrl(workout.video_url);
  const { logSession } = useSessions();
  const { language } = useLanguage();

  // Load signed URL when component mounts
  if (!url && !loading && !error && workout.video_url) load();

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
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onClose} className="text-white text-2xl">✕</button>
        <p className="font-body text-sm text-white">
          {language === 'fr' ? workout.name_fr : workout.name_en}
        </p>
        <div className="w-8" />
      </div>

      {/* Video */}
      <div className="flex-1 flex items-center justify-center px-4">
        {loading && (
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="font-body text-sm text-white/60">
              {language === 'fr' ? 'Chargement...' : 'Loading...'}
            </p>
          </div>
        )}
        {error && (
          <p className="font-body text-sm text-red-400 text-center">{error}</p>
        )}
        {!workout.video_url && (
          <div className="text-center">
            <span className="text-6xl block mb-4">🎬</span>
            <p className="font-body text-white/60 text-sm">
              {language === 'fr' ? 'Vidéo bientôt disponible' : 'Video coming soon'}
            </p>
          </div>
        )}
        {url && (
          <video
            src={url}
            controls
            autoPlay
            className="w-full max-h-full rounded-2xl"
            style={{ maxHeight: 'calc(100vh - 250px)' }}
          />
        )}
      </div>

      {/* Done button */}
      <div className="px-6 pb-10 pt-4">
        <button
          onClick={handleDone}
          className="w-full rounded-xl bg-yellow-500 text-black font-body font-semibold py-4"
        >
          ✓ {language === 'fr' ? 'Séance terminée !' : 'Session done!'}
        </button>
      </div>
    </div>
  );
}

export default function VideoLibrary() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const [filter, setFilter] = useState<FilterDiff>('all');
  const [playing, setPlaying] = useState<Workout | null>(null);

  const { workouts, loading } = useWorkouts(
    filter !== 'all' ? { difficulty: filter } : {}
  );
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  const filters: { id: FilterDiff; fr: string; en: string }[] = [
    { id: 'all',          fr: 'Toutes',        en: 'All'          },
    { id: 'beginner',     fr: 'Débutant',      en: 'Beginner'     },
    { id: 'intermediate', fr: 'Intermédiaire', en: 'Intermediate' },
    { id: 'advanced',     fr: 'Avancé',        en: 'Advanced'     },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-display text-3xl text-foreground mb-1">
          {t('Bibliothèque', 'Library')}
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          {workouts.length} {t('séance(s)', 'session(s)')}
        </p>
      </div>

      <div className="px-6 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs transition-all border flex-shrink-0 ${
                filter === f.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border'
              }`}
            >
              {language === 'fr' ? f.fr : f.en}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl bg-card border border-border h-48 animate-pulse" />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border p-8 text-center">
            <span className="text-4xl block mb-3">🎬</span>
            <p className="font-display text-xl text-foreground mb-1">
              {t('Bientôt disponible', 'Coming soon')}
            </p>
            <p className="font-body text-sm text-muted-foreground">
              {t('Les vidéos arrivent très bientôt !', 'Videos are coming very soon!')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {workouts.map(w => (
              <VideoCard
                key={w.id}
                workout={w}
                onPlay={setPlaying}
                onFavorite={toggleFavorite}
                isFavorite={isFavorite(w.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video player modal */}
      {playing && (
        <VideoPlayer workout={playing} onClose={() => setPlaying(null)} />
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around px-4 py-3">
        {[
          { path: '/home',     label: t('Accueil','Home'),    active: false },
          { path: '/library',  label: t('Vidéos','Videos'),   active: true  },
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
