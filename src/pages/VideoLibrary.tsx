import { useState } from 'react';
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
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px' }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✕
        </button>
        <p style={{ fontFamily: 'DM Sans', fontSize: 15, fontWeight: 500, color: '#fff', margin: 0, flex: 1, textAlign: 'center', padding: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {language === 'fr' ? workout.name_fr : workout.name_en}
        </p>
        <div style={{ width: 36 }} />
      </div>

      {/* Video area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        {loading && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--ios-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{t('Chargement...', 'Loading...')}</p>
          </div>
        )}
        {!workout.video_url && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 12 }}>🎬</span>
            <p style={{ fontFamily: 'Cormorant Garamond', fontSize: 24, color: '#fff', margin: '0 0 6px' }}>
              {t('Bientôt disponible', 'Coming soon')}
            </p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {t('La vidéo sera ajoutée prochainement', 'Video will be added soon')}
            </p>
          </div>
        )}
        {url && (
          <video src={url} controls autoPlay style={{ width: '100%', borderRadius: 16, maxHeight: 'calc(100vh - 220px)' }} />
        )}
      </div>

      {/* Done button */}
      <div style={{ padding: '16px 20px 36px' }}>
        <button onClick={handleDone} className="ios-btn-primary" style={{ background: 'var(--ios-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span>✓</span>
          {t('Séance terminée !', 'Session done!')}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function WorkoutCard({ workout, onPlay, onFav, isFav }: { workout: Workout; onPlay: () => void; onFav: () => void; isFav: boolean }) {
  const { language } = useLanguage();
  const name = language === 'fr' ? workout.name_fr : workout.name_en;
  const thumbSrc = workout.thumbnail_url ? getThumbnailUrl(workout.thumbnail_url) : null;
  const diffColor = workout.difficulty === 'beginner' ? '#30D158' : workout.difficulty === 'intermediate' ? '#FF9F0A' : '#FF453A';
  const diffLabel = workout.difficulty === 'beginner'
    ? (language === 'fr' ? 'Débutant' : 'Beginner')
    : workout.difficulty === 'intermediate'
    ? (language === 'fr' ? 'Intermédiaire' : 'Intermediate')
    : (language === 'fr' ? 'Avancé' : 'Advanced');

  return (
    <div style={{ background: 'var(--ios-card)', borderRadius: 18, overflow: 'hidden', flexShrink: 0 }}>
      {/* Thumbnail */}
      <div
        onClick={onPlay}
        className="ios-pressable"
        style={{
          height: 150,
          background: thumbSrc ? undefined : 'linear-gradient(135deg, #1A1A1A 0%, #252525 100%)',
          backgroundImage: thumbSrc ? `url(${thumbSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {!thumbSrc && <span style={{ fontSize: 36, opacity: 0.3 }}>🧘</span>}
        {/* Play button */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {workout.video_url ? (
            <div style={{ width: 48, height: 48, background: 'var(--ios-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#000', fontSize: 18, marginLeft: 3 }}>▶</span>
            </div>
          ) : (
            <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#fff' }}>{language === 'fr' ? 'Bientôt' : 'Soon'}</span>
            </div>
          )}
        </div>
        {/* Duration badge */}
        <div style={{ position: 'absolute', bottom: 8, left: 10, background: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: '3px 8px' }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 500, color: '#fff' }}>{workout.duration_minutes} min</span>
        </div>
        {/* Fav */}
        <button onClick={e => { e.stopPropagation(); onFav(); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer' }}>
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      {/* Info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <p style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 500, color: '#fff', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: diffColor, flexShrink: 0 }} />
          <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--ios-text-3)' }}>{diffLabel}</span>
          {workout.estimated_calories && (
            <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--ios-text-3)', marginLeft: 'auto' }}>
              ~{workout.estimated_calories} kcal
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoLibrary() {
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;
  const [filter, setFilter] = useState<Filter>('all');
  const [playing, setPlaying] = useState<Workout | null>(null);
  const { workouts, loading } = useWorkouts(filter !== 'all' ? { difficulty: filter } : {});
  const { isFavorite, toggle } = useFavorites();

  const filters: { id: Filter; fr: string; en: string }[] = [
    { id: 'all', fr: 'Toutes', en: 'All' },
    { id: 'beginner', fr: 'Débutant', en: 'Beginner' },
    { id: 'intermediate', fr: 'Inter.', en: 'Inter.' },
    { id: 'advanced', fr: 'Avancé', en: 'Advanced' },
  ];

  return (
    <div className="ios-page">
      {/* Nav */}
      <div className="ios-nav" style={{ top: 44 }}>
        <span className="ios-nav-title">{t('Séances', 'Sessions')}</span>
        <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--ios-text-3)' }}>
          {workouts.length}
        </span>
      </div>

      <div style={{ paddingTop: 8 }}>
        {/* Filter tabs */}
        <div className="ios-segment" style={{ marginBottom: 16, marginTop: 12 }}>
          {filters.map(f => (
            <button key={f.id} className={`ios-segment-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}>
              {language === 'fr' ? f.fr : f.en}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: 'var(--ios-card)', borderRadius: 18, height: 200, animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.5 }} />
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <div style={{ margin: '40px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎬</span>
            <p style={{ fontFamily: 'Cormorant Garamond', fontSize: 26, color: '#fff', margin: '0 0 6px' }}>
              {t('Bientôt disponible', 'Coming soon')}
            </p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--ios-text-3)' }}>
              {t('Les vidéos arrivent très bientôt', 'Videos coming very soon')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
            {workouts.map(w => (
              <WorkoutCard
                key={w.id}
                workout={w}
                onPlay={() => setPlaying(w)}
                onFav={() => toggle(w.id)}
                isFav={isFavorite(w.id)}
              />
            ))}
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      {playing && <PlayerModal workout={playing} onClose={() => setPlaying(null)} />}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  );
}
