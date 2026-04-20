import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ChevronLeft, Star, Clock, BarChart2,
  CheckCircle, Play, Pause, RotateCcw,
  SkipForward, Trophy, Timer, Flame, Target, Zap
} from "lucide-react";
import SessionFeedback, { SessionResult } from "@/components/SessionFeedback";

export type VideoSource = "youtube" | "vimeo";

export interface Exercise {
  id: string;
  name: string;
  duration: number;
  reps?: number;
  sets?: number;
  description: string;
  tip: string;
  isRest?: boolean;
}

export interface Video {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux";
  category: string;
  description: string;
  thumbnail: string;
  source: VideoSource;
  videoId: string;
  calories: number;
  equipment: string[];
  rating: number;
  reviews: number;
  featured?: boolean;
  exercises?: Exercise[];
}

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

type PlayerMode = "video" | "exercices" | "chrono";

const DEFAULT_EXERCISES: Exercise[] = [
  { id: "e1",  name: "Échauffement",        duration: 60,  description: "Respiration et activation du centre",        tip: "Inspire par le nez, expire par la bouche.",               isRest: false },
  { id: "r1",  name: "Repos",               duration: 15,  description: "Récupération active",                         tip: "Reste concentrée sur ta respiration.",                    isRest: true  },
  { id: "e2",  name: "The Hundred",         duration: 60,  reps: 100, sets: 1, description: "Pompes des bras",         tip: "Garde le menton légèrement rentré.",                      isRest: false },
  { id: "r2",  name: "Repos",               duration: 20,  description: "Récupération active",                         tip: "Relâche les épaules.",                                    isRest: true  },
  { id: "e3",  name: "Roll Up",             duration: 45,  reps: 8,   sets: 2, description: "Déroulement vertèbre par vertèbre", tip: "Expire en montant.",                           isRest: false },
  { id: "r3",  name: "Repos",               duration: 15,  description: "Récupération active",                         tip: "Relâche les hanches.",                                    isRest: true  },
  { id: "e4",  name: "Leg Circle",          duration: 50,  reps: 10,  sets: 2, description: "Cercles de jambe",        tip: "Stabilise le bassin.",                                    isRest: false },
  { id: "r4",  name: "Repos",               duration: 15,  description: "Récupération active",                         tip: "Respire profondément.",                                   isRest: true  },
  { id: "e5",  name: "Single Leg Stretch",  duration: 50,  reps: 10,  sets: 2, description: "Extension alternée",      tip: "Le coude extérieur pousse le genou.",                     isRest: false },
  { id: "r5",  name: "Repos",               duration: 20,  description: "Récupération active",                         tip: "Allonge-toi et relâche.",                                 isRest: true  },
  { id: "e6",  name: "Spine Stretch",       duration: 45,  reps: 6,   sets: 2, description: "Étirement en avant",      tip: "Grandit vers le ciel avant de te pencher.",               isRest: false },
  { id: "r6",  name: "Repos",               duration: 15,  description: "Récupération active",                         tip: "Respire et relâche.",                                     isRest: true  },
  { id: "e7",  name: "Swan",                duration: 40,  reps: 6,   sets: 1, description: "Extension dorsale",       tip: "Pousse avec les mains.",                                  isRest: false },
  { id: "r7",  name: "Repos",               duration: 15,  description: "Récupération active",                         tip: "Enfant pour étirer.",                                     isRest: true  },
  { id: "e8",  name: "Teaser",              duration: 45,  reps: 5,   sets: 2, description: "V-sit les jambes tendues", tip: "Rentre le nombril avant de lever.",                      isRest: false },
  { id: "fin", name: "Retour au calme",     duration: 90,  description: "Étirements finaux",                           tip: "Laisse ton corps intégrer le travail.",                   isRest: false },
];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const VideoPlayer = ({ video, onClose }: VideoPlayerProps) => {
  const exercises = video.exercises ?? DEFAULT_EXERCISES;

  const [mode, setMode] = useState<PlayerMode>("exercices");
  const [liked, setLiked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Session timer
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionRunning, setSessionRunning] = useState(false);
  const sessionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Exercise tracker
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(exercises[0]?.duration ?? 60);
  const [exerciseRunning, setExerciseRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const exerciseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Chrono
  const [chronoTime, setChronoTime] = useState(0);
  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoMode, setChronoMode] = useState<"up" | "down">("up");
  const [chronoTarget, setChronoTarget] = useState(60);
  const chronoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExercise = exercises[currentExerciseIndex];
  const exerciseProgress = exercises[currentExerciseIndex]
    ? ((exercises[currentExerciseIndex].duration - exerciseTimeLeft) / exercises[currentExerciseIndex].duration) * 100
    : 0;
  const globalProgress = (completedExercises.length / exercises.length) * 100;
  const isSessionComplete = completedExercises.length >= exercises.length;

  useEffect(() => {
    if (sessionRunning) {
      sessionRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    } else if (sessionRef.current) clearInterval(sessionRef.current);
    return () => { if (sessionRef.current) clearInterval(sessionRef.current); };
  }, [sessionRunning]);

  useEffect(() => {
    if (exerciseRunning) {
      exerciseRef.current = setInterval(() => {
        setExerciseTimeLeft(t => {
          if (t <= 1) {
            clearInterval(exerciseRef.current!);
            setExerciseRunning(false);
            setCompletedExercises(prev => [...prev, exercises[currentExerciseIndex].id]);
            if (currentExerciseIndex < exercises.length - 1) {
              setTimeout(() => {
                setCurrentExerciseIndex(i => i + 1);
                setExerciseTimeLeft(exercises[currentExerciseIndex + 1]?.duration ?? 60);
              }, 400);
            } else {
              setSessionRunning(false);
              setTimeout(() => setShowFeedback(true), 800);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else if (exerciseRef.current) clearInterval(exerciseRef.current);
    return () => { if (exerciseRef.current) clearInterval(exerciseRef.current); };
  }, [exerciseRunning, currentExerciseIndex]);

  useEffect(() => {
    if (chronoRunning) {
      chronoRef.current = setInterval(() => {
        setChronoTime(t => {
          if (chronoMode === "down" && t <= 1) { clearInterval(chronoRef.current!); setChronoRunning(false); return 0; }
          return chronoMode === "up" ? t + 1 : t - 1;
        });
      }, 1000);
    } else if (chronoRef.current) clearInterval(chronoRef.current);
    return () => { if (chronoRef.current) clearInterval(chronoRef.current); };
  }, [chronoRunning, chronoMode]);

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  const goToExercise = (index: number) => { setExerciseRunning(false); setCurrentExerciseIndex(index); setExerciseTimeLeft(exercises[index].duration); };
  const toggleExerciseTimer = () => { if (!sessionRunning) setSessionRunning(true); setExerciseRunning(r => !r); };
  const resetExercise = () => { setExerciseRunning(false); setExerciseTimeLeft(exercises[currentExerciseIndex].duration); };
  const skipExercise = () => { if (currentExerciseIndex < exercises.length - 1) { setCompletedExercises(prev => [...prev, currentExercise.id]); goToExercise(currentExerciseIndex + 1); } };

  const handleFinishEarly = () => { setSessionRunning(false); setExerciseRunning(false); setShowFeedback(true); };

  const sessionResult: SessionResult = {
    videoTitle: video.title,
    duration: sessionTime,
    plannedDuration: video.duration,
    calories: Math.round(video.calories * (sessionTime / (parseInt(video.duration) * 60 || 1))),
    exercisesCompleted: completedExercises.filter(id => !exercises.find(e => e.id === id)?.isRest).length,
    exercisesTotal: exercises.filter(e => !e.isRest).length,
    instructor: video.instructor,
  };

  const ringColor = currentExercise?.isRest ? "#60A5FA" : "#B8973E";
  const circumference = 2 * Math.PI * 54;
  const ringOffset = circumference - (exerciseProgress / 100) * circumference;

  // Afficher le feedback si déclenché
  if (showFeedback) {
    return (
      <AnimatePresence>
        <SessionFeedback
          result={sessionResult}
          onClose={onClose}
          onReplay={() => { setShowFeedback(false); setSessionTime(0); setCurrentExerciseIndex(0); setExerciseTimeLeft(exercises[0].duration); setCompletedExercises([]); setSessionRunning(false); }}
        />
      </AnimatePresence>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 border-b border-border bg-background">
        <button onClick={onClose} className="flex items-center gap-2 text-muted-foreground">
          <ChevronLeft size={20} strokeWidth={1.5} />
          <span className="font-body text-sm">Retour</span>
        </button>
        <div className="text-center">
          <p className="font-body text-xs font-medium text-foreground truncate max-w-40">{video.title}</p>
          <p className="font-body text-[10px] text-muted-foreground">⏱ {formatTime(sessionTime)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLiked(!liked)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card">
            <Heart size={16} strokeWidth={1.5} className={liked ? "fill-red-400 text-red-400" : "text-muted-foreground"} />
          </button>
          {sessionTime > 30 && (
            <button onClick={handleFinishEarly}
              className="rounded-full bg-gold/10 px-3 py-1 font-body text-[10px] text-gold border border-gold/30">
              Terminer
            </button>
          )}
        </div>
      </div>

      {/* Barre progression globale */}
      <div className="h-1 bg-muted">
        <motion.div className="h-full bg-gold" animate={{ width: `${globalProgress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-background">
        {([
          { id: "exercices", label: "Exercices", icon: Target },
          { id: "chrono",    label: "Chrono",    icon: Timer },
          { id: "video",     label: "Vidéo",     icon: Play },
        ] as { id: PlayerMode; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 font-body text-xs transition-all ${
              mode === id ? "border-b-2 border-gold text-foreground -mb-[1px]" : "text-muted-foreground"
            }`}>
            <Icon size={13} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">

            {/* MODE EXERCICES */}
            {mode === "exercices" && (
              <div className="px-5 py-5 flex flex-col gap-4">
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    <svg width="128" height="128" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="54" fill="none" stroke="hsl(27,8%,92%)" strokeWidth="8"/>
                      <motion.circle cx="64" cy="64" r="54" fill="none"
                        stroke={ringColor} strokeWidth="8"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset: ringOffset }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        strokeLinecap="round" transform="rotate(-90 64 64)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-3xl text-foreground">{formatTime(exerciseTimeLeft)}</span>
                      <span className="font-body text-[10px] text-muted-foreground mt-0.5">restant</span>
                    </div>
                  </div>

                  <div className="text-center mb-1">
                    {currentExercise?.isRest
                      ? <span className="inline-block rounded-full bg-blue-50 px-3 py-1 font-body text-xs text-blue-700 mb-2">Repos 💧</span>
                      : <span className="inline-block rounded-full bg-gold/10 px-3 py-1 font-body text-xs text-gold mb-2">{currentExerciseIndex + 1}/{exercises.length}</span>
                    }
                    <h2 className="font-display text-2xl font-light text-foreground">{currentExercise?.name}</h2>
                    {currentExercise?.reps && (
                      <p className="font-body text-sm text-muted-foreground mt-1">
                        {currentExercise.reps} reps × {currentExercise.sets} série{(currentExercise.sets ?? 1) > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  <div className="w-full rounded-2xl bg-card border border-border p-3 text-center mb-2">
                    <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Conseil</p>
                    <p className="font-body text-xs text-foreground leading-relaxed">{currentExercise?.tip}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={resetExercise} className="flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border">
                      <RotateCcw size={18} strokeWidth={1.5} className="text-muted-foreground" />
                    </button>
                    <button onClick={toggleExerciseTimer}
                      className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
                      style={{ backgroundColor: exerciseRunning ? "#EF4444" : "#B8973E" }}>
                      {exerciseRunning
                        ? <Pause size={24} className="text-white" fill="white" />
                        : <Play size={24} className="text-white ml-1" fill="white" />
                      }
                    </button>
                    <button onClick={skipExercise} disabled={currentExerciseIndex >= exercises.length - 1}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border disabled:opacity-30">
                      <SkipForward size={18} strokeWidth={1.5} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Liste exercices */}
                <div className="rounded-3xl bg-card shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="font-display text-base font-light text-foreground">Programme</h3>
                    <span className="font-body text-[10px] text-muted-foreground">{completedExercises.length}/{exercises.length} ✓</span>
                  </div>
                  {exercises.map((ex, i) => {
                    const isDone = completedExercises.includes(ex.id);
                    const isCurrent = i === currentExerciseIndex;
                    return (
                      <button key={ex.id} onClick={() => goToExercise(i)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all ${i < exercises.length - 1 ? "border-b border-border" : ""} ${isCurrent ? "bg-gold/5" : isDone ? "opacity-60" : ""}`}>
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isDone ? "bg-green-500" : isCurrent ? "bg-gold" : "bg-muted"}`}>
                          {isDone ? <CheckCircle size={14} className="text-white" /> :
                           ex.isRest ? <span style={{ fontSize: 10 }}>💧</span> :
                           <span className="font-body text-[10px] font-medium" style={{ color: isCurrent ? "white" : "hsl(27,8%,55%)" }}>{i + 1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-body text-sm ${isCurrent ? "font-medium text-foreground" : "text-foreground"}`}>{ex.name}</p>
                          {ex.reps && <p className="font-body text-[10px] text-muted-foreground">{ex.reps} reps × {ex.sets}s</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isCurrent && <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />}
                          <span className="font-body text-[10px] text-muted-foreground">{formatTime(ex.duration)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bouton terminer manuellement */}
                {sessionTime > 30 && !isSessionComplete && (
                  <button onClick={handleFinishEarly}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gold/30 py-3 font-body text-sm text-gold">
                    <Trophy size={14} strokeWidth={1.5} />
                    Terminer la séance maintenant
                  </button>
                )}

                {isSessionComplete && (
                  <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setShowFeedback(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 font-body text-sm font-medium text-white">
                    <Trophy size={16} strokeWidth={1.5} />
                    Voir mon bilan de séance 🎉
                  </motion.button>
                )}
              </div>
            )}

            {/* MODE CHRONO */}
            {mode === "chrono" && (
              <div className="px-5 py-8 flex flex-col items-center gap-6">
                <div className="flex rounded-full bg-card border border-border p-1 gap-1">
                  {(["up", "down"] as const).map(m => (
                    <button key={m} onClick={() => { setChronoMode(m); setChronoTime(m === "down" ? chronoTarget : 0); setChronoRunning(false); }}
                      className={`rounded-full px-5 py-2 font-body text-xs transition-all ${chronoMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                      {m === "up" ? "⬆ Chrono" : "⬇ Compte à rebours"}
                    </button>
                  ))}
                </div>
                {chronoMode === "down" && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setChronoTarget(t => Math.max(10, t - 10)); setChronoTime(t => Math.max(10, t - 10)); }}
                      className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center font-body text-lg text-muted-foreground">−</button>
                    <span className="font-body text-sm text-foreground w-20 text-center">{formatTime(chronoTarget)}</span>
                    <button onClick={() => { setChronoTarget(t => t + 10); setChronoTime(t => t + 10); }}
                      className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center font-body text-lg text-muted-foreground">+</button>
                  </div>
                )}
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="86" fill="none" stroke="hsl(27,8%,92%)" strokeWidth="10"/>
                    {chronoMode === "down" && chronoTarget > 0 && (
                      <motion.circle cx="100" cy="100" r="86" fill="none" stroke="#B8973E" strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 86}
                        animate={{ strokeDashoffset: (2 * Math.PI * 86) * (1 - chronoTime / chronoTarget) }}
                        transition={{ duration: 0.5 }} strokeLinecap="round" transform="rotate(-90 100 100)" />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-5xl font-light text-foreground">{formatTime(chronoTime)}</span>
                    <span className="font-body text-xs text-muted-foreground mt-1">{chronoMode === "up" ? "en cours" : "restant"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={() => { setChronoTime(chronoMode === "down" ? chronoTarget : 0); setChronoRunning(false); }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border">
                    <RotateCcw size={18} strokeWidth={1.5} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => setChronoRunning(r => !r)}
                    className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
                    style={{ backgroundColor: chronoRunning ? "#EF4444" : "#B8973E" }}>
                    {chronoRunning ? <Pause size={28} className="text-white" fill="white" /> : <Play size={28} className="text-white ml-1" fill="white" />}
                  </button>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border">
                    <Timer size={18} strokeWidth={1.5} className="text-muted-foreground" />
                  </div>
                </div>
                <div className="w-full rounded-2xl bg-card border border-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gold" strokeWidth={1.5} />
                    <span className="font-body text-sm text-foreground">Séance en cours</span>
                  </div>
                  <span className="font-display text-lg text-foreground">{formatTime(sessionTime)}</span>
                </div>
                <div className="w-full">
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2 text-center">Durées rapides</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[30, 45, 60, 90, 120, 180].map(s => (
                      <button key={s} onClick={() => { setChronoMode("down"); setChronoTarget(s); setChronoTime(s); setChronoRunning(false); }}
                        className={`rounded-full px-4 py-2 font-body text-xs transition-all ${chronoMode === "down" && chronoTarget === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
                        {formatTime(s)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODE VIDÉO */}
            {mode === "video" && (
              <div>
                <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title={video.title} />
                </div>
                <div className="px-5 py-4">
                  <h2 className="font-display text-xl font-light text-foreground mb-1">{video.title}</h2>
                  <p className="font-body text-sm text-muted-foreground mb-3">avec {video.instructor}</p>
                  <div className="flex gap-3 mb-4">
                    {[
                      { icon: Clock,  v: video.duration, l: "Durée" },
                      { icon: BarChart2, v: video.level, l: "Niveau" },
                      { icon: Flame,  v: `${video.calories} kcal`, l: "Calories" },
                    ].map(({ icon: Icon, v, l }) => (
                      <div key={l} className="flex-1 rounded-2xl bg-card p-3 text-center shadow-sm">
                        <Icon size={14} className="text-gold mx-auto mb-1" strokeWidth={1.5} />
                        <p className="font-body text-xs font-medium text-foreground">{v}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{l}</p>
                      </div>
                    ))}
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">{video.description}</p>
                  <button onClick={() => setMode("exercices")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium text-primary-foreground">
                    <Target size={16} strokeWidth={1.5} />
                    Suivre les exercices
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
