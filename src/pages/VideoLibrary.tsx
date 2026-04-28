import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Lock, Clock, ChevronRight, ChevronLeft, Star, MessageSquare } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

interface Category { id: string; slug: string; name_fr: string; emoji: string; color: string; order_index: number; }
interface Session { id: string; name_fr: string; description_fr: string; duration_minutes: number; difficulty: string; estimated_calories: number; is_free: boolean; video_path: string | null; category_id: string; session_number: number; }
interface Review { rating: number; comment: string | null; }

const DIFF: Record<string, { label: string; color: string; bg: string }> = {
  beginner:     { label: "Débutant",      color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  intermediate: { label: "Intermédiaire", color: "#B8973E", bg: "rgba(184,151,62,0.1)" },
  advanced:     { label: "Avancé",        color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={() => !readonly && setHovered(i)} onMouseLeave={() => !readonly && setHovered(0)}
          style={{ cursor: readonly ? "default" : "pointer", fontSize: 16, color: i <= (hovered || value) ? "#B8973E" : "#D1CCC5", transition: "color 0.15s" }}>★</span>
      ))}
    </div>
  );
}

export default function VideoLibrary() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState(0);
  const [tempComment, setTempComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("workout_categories").select("*").order("order_index");
    setCategories(data || []);
    setLoading(false);
  };

  const openCategory = async (cat: Category) => {
    setSelectedCat(cat);
    const { data } = await supabase.from("workouts").select("*").eq("category_id", cat.id).order("session_number");
    setSessions(data || []);
    if (user) {
      const { data: r } = await supabase.from("program_reviews").select("*").eq("user_id", user.id).in("program_id", (data || []).map(s => s.id));
      if (r) { const map: Record<string, Review> = {}; r.forEach(x => { map[x.program_id] = x; }); setReviews(map); }
    }
  };

  const submitReview = async (sessionId: string) => {
    if (!user || !tempRating) return;
    await supabase.from("program_reviews").upsert({ user_id: user.id, program_id: sessionId, rating: tempRating, comment: tempComment || null, updated_at: new Date().toISOString() }, { onConflict: "user_id,program_id" });
    setReviews(prev => ({ ...prev, [sessionId]: { rating: tempRating, comment: tempComment } }));
    setReviewingId(null); setTempRating(0); setTempComment("");
  };

  return (
    <MobileLayout>
      <div className="pt-12 pb-28">
        <AnimatePresence mode="wait">

          {/* ── Vue catégories ── */}
          {!selectedCat && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5">
              <div className="mb-6">
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Connect Reformer</p>
                <h1 className="font-display text-3xl font-light text-foreground">Séances</h1>
                <p className="font-body text-sm text-muted-foreground mt-1">Choisissez un type de cours</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat, i) => (
                    <motion.button key={cat.id} onClick={() => openCategory(cat)}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <div style={{ backgroundColor: "white", borderRadius: 20, padding: "16px 12px", border: "1px solid rgba(28,27,25,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", textAlign: "center" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: cat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 8px" }}>
                          {cat.emoji}
                        </div>
                        <div style={{ height: 2, width: 24, backgroundColor: cat.color, borderRadius: 2, margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#1C1B19", letterSpacing: "0.04em", fontFamily: "inherit" }}>{cat.name_fr}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Vue séances d'une catégorie ── */}
          {selectedCat && (
            <motion.div key="sessions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5">
              {/* Header avec retour */}
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setSelectedCat(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
                  <ChevronLeft size={18} className="text-muted-foreground" />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: selectedCat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {selectedCat.emoji}
                  </div>
                  <div>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Séances</p>
                    <h2 className="font-display text-xl font-light text-foreground">{selectedCat.name_fr}</h2>
                  </div>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>🎬</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1B19", marginBottom: 4 }}>Séances à venir</p>
                  <p style={{ fontSize: 13, color: "#8B8578", lineHeight: 1.5 }}>Les vidéos de ce programme sont en cours de production.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sessions.map((session, i) => {
                    const locked = !session.is_free;
                    const diff = DIFF[session.difficulty] || DIFF.intermediate;
                    const myReview = reviews[session.id];
                    const isReviewing = reviewingId === session.id;

                    return (
                      <motion.div key={session.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm">
                        <div style={{ height: 3, backgroundColor: locked ? "rgba(28,27,25,0.08)" : selectedCat.color }} />
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: selectedCat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: selectedCat.color, flexShrink: 0 }}>
                              {String(i + 1).padStart(2, "0")}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                                <h3 className="font-display text-base font-light text-foreground">{session.name_fr}</h3>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: locked ? "rgba(28,27,25,0.06)" : selectedCat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  {locked ? <Lock size={13} className="text-muted-foreground" /> : <Play size={13} color="white" fill="white" />}
                                </div>
                              </div>
                              {session.description_fr && (
                                <p className="font-body text-xs text-muted-foreground leading-relaxed mb-2"
                                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {session.description_fr}
                                </p>
                              )}
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#8B8578" }}>
                                  <Clock size={11} /> {session.duration_minutes} min
                                </span>
                                {session.estimated_calories && <span style={{ fontSize: 11, color: "#8B8578" }}>~{session.estimated_calories} kcal</span>}
                                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, backgroundColor: diff.bg, color: diff.color }}>{diff.label}</span>
                              </div>
                            </div>
                          </div>

                          {/* Zone avis */}
                          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(28,27,25,0.06)" }}>
                            {myReview && !isReviewing ? (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <StarRating value={myReview.rating} readonly />
                                <button onClick={() => { setReviewingId(session.id); setTempRating(myReview.rating); setTempComment(myReview.comment || ""); }}
                                  style={{ fontSize: 11, color: "#B8973E", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Modifier</button>
                              </div>
                            ) : !isReviewing ? (
                              <button onClick={() => { setReviewingId(session.id); setTempRating(0); setTempComment(""); }}
                                style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                                <MessageSquare size={12} color="#B8973E" />
                                <span style={{ fontSize: 12, color: "#B8973E", fontWeight: 600 }}>Mon avis</span>
                              </button>
                            ) : null}
                            <AnimatePresence>
                              {isReviewing && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                                  <div style={{ paddingTop: 8 }}>
                                    <p style={{ fontSize: 12, color: "#6B6560", marginBottom: 6 }}>Comment tu as trouvé cette séance ?</p>
                                    <StarRating value={tempRating} onChange={setTempRating} />
                                    <textarea value={tempComment} onChange={e => setTempComment(e.target.value)} placeholder="Un commentaire ? (optionnel)" rows={2}
                                      style={{ width: "100%", marginTop: 8, padding: "8px 10px", border: "1px solid rgba(28,27,25,0.12)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", resize: "none", outline: "none", backgroundColor: "#FAFAF8", boxSizing: "border-box" as const }} />
                                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                      <button onClick={() => setReviewingId(null)} style={{ flex: 1, padding: "8px", border: "1px solid rgba(28,27,25,0.1)", borderRadius: 8, backgroundColor: "transparent", fontSize: 12, color: "#6B6560", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                                      <button onClick={() => submitReview(session.id)} disabled={!tempRating}
                                        style={{ flex: 2, padding: "8px", border: "none", borderRadius: 8, backgroundColor: tempRating ? "#B8973E" : "#D1CCC5", color: "#1C1B19", fontSize: 12, fontWeight: 600, cursor: tempRating ? "pointer" : "default", fontFamily: "inherit" }}>
                                        Publier
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </MobileLayout>
  );
}
