import { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Maximize2, Volume2, VolumeX, RotateCcw, Airplay, Cast, RotateCw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export interface Chapter {
  label: string;
  start: number;
}

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
  chapters?: Chapter[];
}

const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function VideoPlayer({ url, title, onClose, chapters }: VideoPlayerProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [now, setNow] = useState(0);
  const hideControlsTimer = useRef<NodeJS.Timeout>();

  // ── Diffusion TV (AirPlay iOS / Cast Android) ────
  const [airplayAvailable, setAirplayAvailable] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  // ── Détecter la rotation ──────────────────────────
  useEffect(() => {
    const handleOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
      // Masquer la status bar en paysage
      if (landscape) {
        document.documentElement.style.setProperty('--landscape', '1');
      } else {
        document.documentElement.style.removeProperty('--landscape');
      }
    };

    handleOrientation();
    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);

    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
      document.documentElement.style.removeProperty('--landscape');
    };
  }, []);

  // ── Détecter la plateforme + disponibilité AirPlay ──
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Mac/.test(ua) && "ontouchend" in document);
    const isAndroid = /Android/.test(ua);
    setPlatform(isIOS ? 'ios' : isAndroid ? 'android' : 'other');

    const video = videoRef.current as any;
    if (!video) return;

    // API AirPlay d'Apple : écouter la disponibilité d'un appareil (Apple TV, etc.)
    const onAvailability = (e: any) => {
      // e.availability === 'available' quand une TV AirPlay est détectée sur le réseau
      setAirplayAvailable(e.availability === 'available');
    };

    if (typeof video.webkitShowPlaybackTargetPicker === 'function') {
      video.addEventListener('webkitplaybacktargetavailabilitychanged', onAvailability);
      // Sur iOS, on affiche le bouton par défaut (l'utilisateur verra "aucun appareil" sinon)
      if (isIOS) setAirplayAvailable(true);
    }

    return () => {
      if (video && typeof video.removeEventListener === 'function') {
        video.removeEventListener('webkitplaybacktargetavailabilitychanged', onAvailability);
      }
    };
  }, []);

  // ── Lancer la diffusion sur TV ───────────────────
  const startCasting = () => {
    const video = videoRef.current as any;
    if (!video) return;
    resetControlsTimer();

    // iOS : ouvrir le sélecteur AirPlay natif d'Apple
    if (typeof video.webkitShowPlaybackTargetPicker === 'function') {
      video.webkitShowPlaybackTargetPicker();
      return;
    }

    // Android / autres : Chromecast nécessite un plugin natif (à venir)
    // Pour l'instant, on guide l'utilisateur vers la recopie d'écran système
    alert(t(
      "Pour diffuser sur votre télévision, utilisez la recopie d'écran depuis les réglages rapides de votre téléphone.",
      "To cast to your TV, use screen mirroring from your phone's quick settings."
    ));
  };

  // ── Contrôles vidéo ──────────────────────────────
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
    resetControlsTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    const d = videoRef.current.duration || 0;
    let target = videoRef.current.currentTime + seconds;
    if (target < 0) target = 0;
    if (target > d) target = d;
    videoRef.current.currentTime = target;
    resetControlsTimer();
  };

  const cycleSpeed = () => {
    if (!videoRef.current) return;
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    videoRef.current.playbackRate = next;
    setSpeed(next);
    resetControlsTimer();
  };

  const jumpToChapter = (start: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = start;
    if (!playing) { videoRef.current.play(); setPlaying(true); }
    resetControlsTimer();
  };

  // Chapitre courant (dernier dont le start est <= temps actuel)
  const activeChapterIndex = chapters && chapters.length
    ? chapters.reduce((acc, ch, i) => (now >= ch.start ? i : acc), 0)
    : -1;

  const handleProgress = () => {
    if (!videoRef.current) return;
    setNow(videoRef.current.currentTime);
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isNaN(p) ? 0 : p);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.currentTime = (val / 100) * videoRef.current.duration;
    setProgress(val);
  };

  const handleLoaded = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const restart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setPlaying(true);
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const formatTime = (s: number) => {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  };

  const currentTime = now;

  // ── Styles dynamiques ────────────────────────────
  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
  };

  const videoStyle: React.CSSProperties = {
    width: '100%',
    flex: 1,
    objectFit: isLandscape ? 'contain' : 'cover',
    maxHeight: isLandscape ? '100vh' : undefined,
    cursor: 'pointer',
  };

  const controlsStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: isLandscape ? '12px 24px 20px' : '12px 16px 32px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
    transition: 'opacity 0.3s',
    opacity: showControls ? 1 : 0,
    paddingBottom: isLandscape
      ? '12px'
      : 'calc(20px + env(safe-area-inset-bottom, 0px))',
  };

  return (
    <div style={overlay} onClick={resetControlsTimer}>

      {/* Header — toujours visible */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        padding: isLandscape
          ? '12px 20px'
          : 'calc(env(safe-area-inset-top, 12px) + 12px) 16px 12px',
        background: 'linear-gradient(rgba(0,0,0,0.7), transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s',
      }}>
        <p style={{ color: 'white', fontSize: 13, fontWeight: 500, margin: 0, maxWidth: '70%' }}>
          {title}
        </p>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={18} color="white" />
        </button>
      </div>

      {/* Vidéo */}
      <video
        ref={videoRef}
        src={url}
        style={videoStyle}
        onTimeUpdate={handleProgress}
        onLoadedMetadata={handleLoaded}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
      />

      {/* Bouton play central */}
      {!playing && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 72, height: 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }} onClick={togglePlay}>
          <Play size={32} color="white" fill="white" />
        </div>
      )}

      {/* Contrôles bas */}
      <div style={controlsStyle}>

        {/* Badge chapitre actif */}
        {chapters && chapters.length > 0 && activeChapterIndex >= 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{
              backgroundColor: 'rgba(184,151,62,0.9)', color: '#1C1B19',
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            }}>
              {chapters[activeChapterIndex].label}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              {activeChapterIndex + 1}/{chapters.length}
            </span>
          </div>
        )}

        {/* Barre de chapitres (segments cliquables) */}
        {chapters && chapters.length > 0 && duration > 0 ? (
          <div style={{ display: 'flex', gap: 3, marginBottom: 12, cursor: 'pointer' }}>
            {chapters.map((ch, i) => {
              const start = ch.start;
              const end = i < chapters.length - 1 ? chapters[i + 1].start : duration;
              const flexBasis = Math.max(0.5, end - start);
              const isPast = now >= end;
              const isCurrent = i === activeChapterIndex;
              const fillPct = isCurrent ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100)) : (isPast ? 100 : 0);
              return (
                <div key={i} onClick={() => jumpToChapter(start)}
                  style={{ flexGrow: flexBasis, flexBasis: 0, height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                  <div style={{ width: fillPct + '%', height: '100%', backgroundColor: '#B8973E', borderRadius: 4, transition: 'width 0.2s' }} />
                </div>
              );
            })}
          </div>
        ) : (
          <input
            type="range"
            min="0" max="100"
            value={progress}
            onChange={handleSeek}
            style={{ width: '100%', height: 3, accentColor: '#B8973E', marginBottom: 12, cursor: 'pointer' }}
          />
        )}

        {/* Boutons + temps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => skip(-10)} aria-label={t("Reculer de 10 secondes", "Back 10 seconds")} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', position: 'relative' }}>
            <RotateCcw size={20} color="rgba(255,255,255,0.85)" />
            <span style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>10</span>
          </button>

          <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {playing
              ? <Pause size={24} color="white" fill="white" />
              : <Play size={24} color="white" fill="white" />
            }
          </button>

          <button onClick={() => skip(10)} aria-label={t("Avancer de 10 secondes", "Forward 10 seconds")} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', position: 'relative' }}>
            <RotateCw size={20} color="rgba(255,255,255,0.85)" />
            <span style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>10</span>
          </button>

          <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {muted
              ? <VolumeX size={18} color="rgba(255,255,255,0.7)" />
              : <Volume2 size={18} color="rgba(255,255,255,0.7)" />
            }
          </button>

          {/* Vitesse de lecture */}
          <button onClick={cycleSpeed} aria-label={t("Vitesse de lecture", "Playback speed")} style={{ background: 'none', border: '0.5px solid rgba(255,255,255,0.3)', borderRadius: 12, cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 600 }}>
              {speed}×
            </span>
          </button>

          {/* Diffusion TV — AirPlay (iOS) / Cast (Android) */}
          {(platform === 'ios' ? airplayAvailable : platform === 'android') && (
            <button
              onClick={startCasting}
              aria-label={t("Diffuser sur la télévision", "Cast to TV")}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              {platform === 'ios'
                ? <Airplay size={19} color="#B8973E" />
                : <Cast size={19} color="#B8973E" />
              }
            </button>
          )}

          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginLeft: 'auto' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Hint rotation */}
          {!isLandscape && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Maximize2 size={14} color="rgba(255,255,255,0.5)" />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                {t("Tournez pour plein écran", "Rotate for fullscreen")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
