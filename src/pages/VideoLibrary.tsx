import { useState, useEffect } from "react";
import { Play, Lock, Clock, Star, MessageSquare, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import SessionReview from "@/components/SessionReview";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

interface Program {
  id: string;
  slug: string;
  name_fr: string;
  description_fr: string;
  duration_minutes: number;
  difficulty: string;
  category: string;
  estimated_calories: number;
  is_free: boolean;
  is_premium: boolean;
  video_path: string | null;
  order_index: number;
}

interface ProgramRating {
  program_id: string;
  rating: number;
  comment: string | null;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     "Debutant",
  intermediate: "Intermediaire",
  advanced:     "Avance",
};

const CATEGORY_FILTERS = ["Tous", "Mobilite", "Full Body", "Force", "Cardio", "Tonification", "Etirements", "Abdos", "Bas du corps", "Haut du corps"];

const PROGRAM_CONFIG: Record<string, { emoji: string; color: string }> = {
  "mobility":  { emoji: "wave", color: "#4A9B8E" },
  "full-body": { emoji: "bolt", color: "#B8973E" },
  "strong":    { emoji: "flex", color: "#8B6914" },
  "fire":      { emoji: "fire", color: "#C4472A" },
  "pulse":     { emoji: "star", color: "#7B5EA7" },
  "stretch":   { emoji: "yoga", color: "#4A9B8E" },
  "abs":       { emoji: "target", color: "#C4472A" },
  "booty":     { emoji: "spark", color: "#B8973E" },
  "arms":      { emoji: "lift",  color: "#8B6914" },
};

const PROGRAM_EMOJIS: Record<string, string> = {
  "mobility":  "🌊",
  "full-body": "⚡",
  "strong":    "💪",
  "fire":      "🔥",
  "pulse":     "💫",
  "stretch":   "🧘",
  "abs":       "🎯",
  "booty":     "✨",
  "arms":      "🏋️",
};

// Composant étoiles de notation
function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i}
          onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={() => !readonly && setHovered(i)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ cursor: readonly ? "default" : "pointer", fontSize: 18, color: i <= (hovered || value) ? "#B8973E" : "#D1CCC5", transition: "color 0.15s" }}>
          ★
        </div>
      ))}
    </div>
  );
}

export default function VideoLibrary() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [ratings, setRatings] = useState<Record<string, ProgramRating>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState(0);
  const [tempComment, setTempComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("workouts")
      .select("*")
      .order("order_index", { ascending: true });
    setPrograms(data || []);

    // Charger les avis de l'utilisateur
    if (user) {
      const { data: reviews } = await supabase
        .from("program_reviews")
        .select("*")
        .eq("user_id", user.id);
      if (reviews) {
        const map: Record<string, ProgramRating> = {};
        reviews.forEach(r => { map[r.program_id] = r; });
        setRatings(map);
      }
    }
    setLoading(false);
  };

  const submitReview = async (programId: string) => {
    if (!user || tempRating === 0) return;
    setSubmitting(true);
    await supabase.from("program_reviews").upsert({
      user_id: user.id,
      program_id: programId,
      rating: tempRating,
      comment: tempComment || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,program_id" });

    setRatings(prev => ({ ...prev, [programId]: { program_id: programId, rating: tempRating, comment: tempComment } }));
    setSubmitting(false);
    setReviewingId(null);
    setSubmitted(programId);
    setTimeout(() => setSubmitted(null), 2500);
    setTempRating(0);
    setTempComment("");
  };

  const filtered = activeFilter === "Tous"
    ? programs
    : programs.filter(p => p.category === activeFilter);

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-28">

        {/* Header */}
        <div className="mb-6">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Connect Reformer</p>
          <h1 className="font-display text-3xl font-light text-foreground leading-tight">Programmes</h1>
        </div>

        {/* Filtres */}
        <div className="mb-5 -mx-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 px-5" style={{ width: "max-content" }}>
            {CATEGORY_FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className="font-body text-xs font-medium px-4 py-1.5 rounded-full transition-all whitespace-nowrap"
                style={{
                  backgroundColor: activeFilter === f ? "#1C1B19" : "rgba(28,27,25,0.07)",
                  color: activeFilter === f ? "#FDFAF7" : "#6B6560",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(program => {
              const config = PROGRAM_CONFIG[program.slug] || { color: "#B8973E" };
              const emoji = PROGRAM_EMOJIS[program.slug] || "▶";
              const locked = !program.is_free;
              const diff = DIFFICULTY_LABEL[program.difficulty] || program.difficulty;
              const myRating = ratings[program.id];
              const isReviewing = reviewingId === program.id;
              const justSubmitted = submitted === program.id;

              return (
                <motion.div key={program.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm">

                  {/* Bande couleur top */}
                  <div style={{ height: 3, backgroundColor: locked ? "rgba(28,27,25,0.08)" : config.color }} />

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Emoji */}
                      <div className="flex items-center justify-center rounded-2xl flex-shrink-0"
                        style={{ width: 52, height: 52, backgroundColor: config.color + "18", fontSize: 24 }}>
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h3 className="font-display text-lg font-light text-foreground tracking-tight leading-none">
                            {program.name_fr}
                          </h3>
                          {/* Bouton play / lock */}
                          <div className="flex items-center justify-center rounded-full flex-shrink-0"
                            style={{ width: 36, height: 36, backgroundColor: locked ? "rgba(28,27,25,0.06)" : config.color }}>
                            {locked
                              ? <Lock size={14} className="text-muted-foreground" />
                              : <Play size={14} color="white" fill="white" />
                            }
                          </div>
                        </div>

                        {/* Description */}
                        <p className="font-body text-xs text-muted-foreground leading-relaxed mb-2"
                          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {program.description_fr}
                        </p>

                        {/* Méta */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-muted-foreground" />
                            <span className="font-body text-[11px] text-muted-foreground">{program.duration_minutes} min</span>
                          </div>
                          {program.estimated_calories && (
                            <span className="font-body text-[11px] text-muted-foreground">~{program.estimated_calories} kcal</span>
                          )}
                          <span className="font-body text-[11px] px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: program.difficulty === "beginner" ? "rgba(22,163,74,0.1)" : program.difficulty === "advanced" ? "rgba(239,68,68,0.1)" : "rgba(184,151,62,0.1)",
                              color: program.difficulty === "beginner" ? "#16A34A" : program.difficulty === "advanced" ? "#EF4444" : "#B8973E",
                              fontWeight: 600,
                            }}>
                            {diff}
                          </span>
                          {program.is_free && (
                            <span className="font-body text-[11px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: "rgba(184,151,62,0.12)", color: "#B8973E" }}>
                              Gratuit
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Zone avis ─────────────────────────────── */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(28,27,25,0.06)" }}>

                      {/* Avis existant */}
                      {myRating && !isReviewing && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <StarRating value={myRating.rating} readonly />
                            {myRating.comment && (
                              <span style={{ fontSize: 11, color: "#8B8578", fontStyle: "italic" }}>
                                "{myRating.comment.substring(0, 30)}{myRating.comment.length > 30 ? '...' : ''}"
                              </span>
                            )}
                          </div>
                          <button onClick={() => { setReviewingId(program.id); setTempRating(myRating.rating); setTempComment(myRating.comment || ""); }}
                            style={{ fontSize: 11, color: "#B8973E", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                            Modifier
                          </button>
                        </div>
                      )}

                      {/* Pas encore d'avis */}
                      {!myRating && !isReviewing && (
                        <button onClick={() => { setReviewingId(program.id); setTempRating(0); setTempComment(""); }}
                          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                          <MessageSquare size={13} color="#B8973E" />
                          <span style={{ fontSize: 12, color: "#B8973E", fontWeight: 600 }}>
                            {justSubmitted ? "✓ Avis enregistré !" : "Donner mon avis"}
                          </span>
                        </button>
                      )}

                      {/* Formulaire d'avis */}
                      <AnimatePresence>
                        {isReviewing && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: "hidden" }}>
                            <div style={{ paddingTop: 8 }}>
                              <p style={{ fontSize: 12, color: "#6B6560", marginBottom: 8 }}>Comment tu as trouvé cette séance ?</p>
                              <StarRating value={tempRating} onChange={setTempRating} />
                              <textarea
                                value={tempComment}
                                onChange={e => setTempComment(e.target.value)}
                                placeholder="Un commentaire ? (optionnel)"
                                rows={2}
                                style={{ width: "100%", marginTop: 10, padding: "10px 12px", border: "1px solid rgba(28,27,25,0.12)", borderRadius: 10, fontSize: 13, color: "#1C1B19", fontFamily: "inherit", resize: "none", outline: "none", backgroundColor: "#FAFAF8", boxSizing: "border-box" }}
                              />
                              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button onClick={() => setReviewingId(null)}
                                  style={{ flex: 1, padding: "9px", border: "1px solid rgba(28,27,25,0.1)", borderRadius: 10, backgroundColor: "transparent", fontSize: 13, color: "#6B6560", cursor: "pointer", fontFamily: "inherit" }}>
                                  Annuler
                                </button>
                                <button onClick={() => submitReview(program.id)}
                                  disabled={tempRating === 0 || submitting}
                                  style={{ flex: 2, padding: "9px", border: "none", borderRadius: 10, backgroundColor: tempRating > 0 ? "#B8973E" : "#D1CCC5", color: "#1C1B19", fontSize: 13, fontWeight: 600, cursor: tempRating > 0 ? "pointer" : "default", fontFamily: "inherit" }}>
                                  {submitting ? "..." : "Publier mon avis"}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
      <BottomNav />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </MobileLayout>
  );
}
