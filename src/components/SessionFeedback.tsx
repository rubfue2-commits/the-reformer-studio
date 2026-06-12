import { useLanguage } from "@/i18n/LanguageContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Star, Flame, Clock, Heart, Zap,
  ChevronRight, CheckCircle, Pencil, Share2,
  TrendingUp, RotateCcw, X
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionResult {
  videoTitle: string;
  duration: number;        // secondes réelles
  plannedDuration: string; // ex: "45 min"
  calories: number;
  exercisesCompleted: number;
  exercisesTotal: number;
  instructor: string;
}

interface SessionFeedbackProps {
  result: SessionResult;
  onClose: () => void;
  onReplay: () => void;
}

type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
type FeelLevel = "terrible" | "moyen" | "bien" | "super" | "excellent";

const FEEL_OPTIONS: { id: FeelLevel; emoji: string; label: string; color: string }[] = [
  { id: "terrible",  emoji: "😩", label_fr: "Difficile", label_en: "Hard",  color: "#EF4444" },
  { id: "moyen",     emoji: "😕", label_fr: "Moyen", label_en: "Medium",      color: "#F97316" },
  { id: "bien",      emoji: "😊", label_fr: "Bien", label_en: "Good",       color: "#B8973E" },
  { id: "super",     emoji: "😄", label_fr: "Super", label_en: "Great",      color: "#4CAF50" },
  { id: "excellent", emoji: "🔥", label: "Excellent!", color: "#6366F1" },
];

const BODY_ZONES = [
  "Abdos", "Dos", "Fessiers", "Cuisses", "Bras",
  "Épaules", "Mollets", "Corps entier",
];

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
};

// ─── Composant principal ──────────────────────────────────────────────────────

const SessionFeedback = ({ result, onClose, onReplay }: SessionFeedbackProps) => {
  const [step, setStep] = useState<"celebration" | "feedback" | "summary">("celebration");
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [feel, setFeel] = useState<FeelLevel | null>(null);
  const [zones, setZones] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const completionRate = Math.round((result.exercisesCompleted / result.exercisesTotal) * 100);
  const isComplete = result.exercisesCompleted === result.exercisesTotal;

  const toggleZone = (zone: string) =>
    setZones(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]);

  const canSubmit = difficulty !== null && feel !== null && rating > 0;

  // ─── ÉTAPE 1 : Célébration ─────────────────────────────────────────────────
  if (step === "celebration") {
    return (
      <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
        style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

        {/* Confettis simulés */}
        {[...Array(12)].map((_, i) => (
          <motion.div key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{ backgroundColor: ["#B8973E","#4CAF50","#6366F1","#EC4899","#F97316"][i % 5] }}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], y: -200 - Math.random() * 200, x: (Math.random() - 0.5) * 300, scale: [0, 1, 0.5] }}
            transition={{ duration: 1.5, delay: i * 0.08, ease: "easeOut" }}
          />
        ))}

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-gold/20 mb-6">
          <Trophy size={48} className="text-gold" strokeWidth={1.5} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="text-center mb-8">
          <h1 className="font-display text-4xl font-light text-white mb-2">
            {isComplete ? "Bravo ! 🎉" : "Belle séance !"}
          </h1>
          <p className="font-body text-sm text-white/60">
            {isComplete
              ? "Tu as complété tous les exercices !"
              : `${result.exercisesCompleted}/${result.exercisesTotal} exercices réalisés`}
          </p>
        </motion.div>

        {/* Stats rapides */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Clock, value: formatTime(result.duration), label: "Durée" },
            { icon: Flame, value: `${result.calories} kcal`, label: "Calories" },
            { icon: CheckCircle, value: `${completionRate}%`, label: "Complétion" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl bg-white/10 p-4 text-center">
              <Icon size={16} className="text-gold mx-auto mb-1" strokeWidth={1.5} />
              <p className="font-display text-lg text-white">{value}</p>
              <p className="font-body text-[10px] text-white/50">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="w-full space-y-3">
          <button onClick={() => setStep("feedback")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-4 font-body text-sm font-medium text-white">
            Donner mon avis sur la séance
            <ChevronRight size={16} />
          </button>
          <div className="flex gap-3">
            <button onClick={onReplay}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 py-3 font-body text-sm text-white/70">
              <RotateCcw size={14} strokeWidth={1.5} />
              Refaire
            </button>
            <button onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 py-3 font-body text-sm text-white/70">
              <X size={14} strokeWidth={1.5} />
              Quitter
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ─── ÉTAPE 2 : Formulaire feedback ────────────────────────────────────────
  if (step === "feedback") {
    return (
      <motion.div className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto"
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-14 pb-4 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 className="font-display text-xl font-light text-foreground">{t("Ton avis", "Your review")}</h2>
            <p className="font-body text-xs text-muted-foreground">{result.videoTitle}</p>
          </div>
          <button onClick={() => setStep("celebration")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
            <X size={16} strokeWidth={1.5} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-6 pb-8">

          {/* 1. Niveau de difficulté */}
          <div>
            <p className="font-body text-sm font-medium text-foreground mb-1">{t("Niveau de difficulté ressenti", "Perceived difficulty level")}</p>
            <p className="font-body text-xs text-muted-foreground mb-3">{t("Comment tu as trouvé l'intensité ?", "How did you find the intensity?")}</p>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as DifficultyLevel[]).map(level => {
                const labels = ["Trop facile", "Facile", "Adapté", "Intense", "Trop dur"];
                const colors = ["#60A5FA", "#4CAF50", "#B8973E", "#F97316", "#EF4444"];
                return (
                  <button key={level} onClick={() => setDifficulty(level)}
                    className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-3 transition-all ${
                      difficulty === level ? "scale-105 shadow-sm" : "opacity-50"
                    }`}
                    style={{
                      background: difficulty === level ? colors[level - 1] + "20" : "var(--card)",
                      border: difficulty === level ? `1.5px solid ${colors[level - 1]}` : "1px solid var(--border)"
                    }}>
                    <span style={{ fontSize: 20 }}>
                      {["😴", "🙂", "💪", "🔥", "😰"][level - 1]}
                    </span>
                    <span className="font-body text-[8px] text-muted-foreground text-center leading-tight">
                      {labels[level - 1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Comment tu te sens */}
          <div>
            <p className="font-body text-sm font-medium text-foreground mb-1">{t("Comment tu te sens après ?", "How do you feel after?")}</p>
            <p className="font-body text-xs text-muted-foreground mb-3">{t("Physiquement et mentalement", "Physically and mentally")}</p>
            <div className="flex gap-2">
              {FEEL_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setFeel(opt.id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all ${
                    feel === opt.id ? "scale-105 shadow-sm" : "opacity-50"
                  }`}
                  style={{
                    background: feel === opt.id ? opt.color + "15" : "var(--card)",
                    border: feel === opt.id ? `1.5px solid ${opt.color}` : "1px solid var(--border)"
                  }}>
                  <span style={{ fontSize: 22 }}>{opt.emoji}</span>
                  <span className="font-body text-[9px] text-muted-foreground">{t(opt.label_fr, opt.label_en)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Zones travaillées */}
          <div>
            <p className="font-body text-sm font-medium text-foreground mb-1">{t("Zones travaillées", "Zones worked")}</p>
            <p className="font-body text-xs text-muted-foreground mb-3">Où tu as senti l'effort ? (optionnel)</p>
            <div className="flex flex-wrap gap-2">
              {BODY_ZONES.map(zone => {
                const active = zones.includes(zone);
                return (
                  <button key={zone} onClick={() => toggleZone(zone)}
                    className={`rounded-full px-3 py-1.5 font-body text-xs transition-all ${
                      active ? "text-white" : "bg-card border border-border text-muted-foreground"
                    }`}
                    style={active ? { backgroundColor: "#B8973E" } : {}}>
                    {zone}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Note du cours */}
          <div>
            <p className="font-body text-sm font-medium text-foreground mb-1">{t("Note le cours", "Rate the session")}</p>
            <p className="font-body text-xs text-muted-foreground mb-3">{t("Ton avis aide les autres pratiquantes", "Your review helps other practitioners")}</p>
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="flex-1 flex items-center justify-center py-2 transition-transform hover:scale-110">
                  <Star size={28} strokeWidth={1.5}
                    className="transition-all"
                    fill={(hoverRating || rating) >= star ? "#B8973E" : "none"}
                    style={{ color: (hoverRating || rating) >= star ? "#B8973E" : "hsl(27,8%,75%)" }}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center font-body text-xs text-muted-foreground">
                {["", "Décevant", "Passable", "Bien", "Très bien", "Excellent !"][rating]}
              </p>
            )}
          </div>

          {/* 5. Note libre */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pencil size={14} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="font-body text-sm font-medium text-foreground">Note personnelle</p>
              <span className="font-body text-[10px] text-muted-foreground ml-auto">Optionnel</span>
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Comment s'est passée la séance ? Des exercices difficiles ? Des progrès remarqués ?..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
            />
          </div>

          {/* CTA */}
          <motion.button whileTap={{ scale: 0.98 }}
            disabled={!canSubmit}
            onClick={() => setStep("summary")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-30">
            <CheckCircle size={16} strokeWidth={1.5} />
            Enregistrer mon feedback
          </motion.button>

          {!canSubmit && (
            <p className="text-center font-body text-[10px] text-muted-foreground -mt-3">
              Remplis la difficulté, la sensation et la note pour valider
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── ÉTAPE 3 : Résumé final ────────────────────────────────────────────────
  const feelData = FEEL_OPTIONS.find(f => f.id === feel)!;

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto"
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>

      <div className="px-6 pt-14 pb-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-3">
            <CheckCircle size={32} className="text-green-500" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl font-light text-foreground">Feedback enregistré !</h2>
          <p className="font-body text-sm text-muted-foreground mt-1">Merci pour ton retour 💛</p>
        </motion.div>

        {/* Résumé de séance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl bg-card p-5 shadow-sm mb-4">
          <h3 className="font-display text-base font-light text-foreground mb-4">{result.videoTitle}</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: Clock,  value: formatTime(result.duration), label: "Durée" },
              { icon: Flame,  value: `${result.calories} kcal`, label: "Calories" },
              { icon: Zap,    value: `${completionRate}%`, label: "Complétion" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-2xl bg-muted p-3 text-center">
                <Icon size={14} className="text-gold mx-auto mb-1" strokeWidth={1.5} />
                <p className="font-body text-sm font-medium text-foreground">{value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Feedback résumé */}
          <div className="space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-muted-foreground">Difficulté</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-2 w-5 rounded-full"
                    style={{ backgroundColor: i <= (difficulty ?? 0) ? "#B8973E" : "hsl(27,8%,90%)" }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-muted-foreground">Ressenti</span>
              <span className="font-body text-sm" style={{ color: feelData.color }}>
                {feelData.emoji} {t(feelData.label_fr, feelData.label_en)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-muted-foreground">Note du cours</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} strokeWidth={1.5}
                    fill={s <= rating ? "#B8973E" : "none"}
                    style={{ color: s <= rating ? "#B8973E" : "hsl(27,8%,75%)" }} />
                ))}
              </div>
            </div>
            {zones.length > 0 && (
              <div className="flex items-start justify-between gap-3">
                <span className="font-body text-xs text-muted-foreground shrink-0">Zones</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {zones.map(z => (
                    <span key={z} className="rounded-full bg-gold/10 px-2 py-0.5 font-body text-[10px] text-gold">{z}</span>
                  ))}
                </div>
              </div>
            )}
            {note && (
              <div className="rounded-xl bg-muted p-3 mt-1">
                <p className="font-body text-xs text-muted-foreground italic">"{note}"</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Suggestion prochaine séance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gold/20 bg-card p-4 mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 shrink-0">
            <TrendingUp size={18} className="text-gold" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs font-medium text-foreground">Prochaine séance suggérée</p>
            <p className="font-body text-[10px] text-muted-foreground">
              {(difficulty ?? 3) <= 2
                ? "Lower Body Sculpt · 35 min · Intermédiaire"
                : (difficulty ?? 3) >= 4
                ? "Relaxation Flow · 20 min · Récupération"
                : "Core Foundations · 20 min · Débutant"}
            </p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </motion.div>

        {/* Actions finales */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="space-y-3">
          <button onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium text-primary-foreground">
            Retour à l'app
          </button>
          <button onClick={onReplay}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 font-body text-sm text-muted-foreground">
            <RotateCcw size={14} strokeWidth={1.5} />
            Refaire cette séance
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SessionFeedback;
