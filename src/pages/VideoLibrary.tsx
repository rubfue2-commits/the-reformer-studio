import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Lock, Clock, ChevronRight, ChevronLeft, Star, MessageSquare, SlidersHorizontal, Search, X, RotateCcw } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

interface Category { id: string; slug: string; name_fr: string; emoji: string; color: string; order_index: number; }
interface Session { id: string; name_fr: string; description_fr: string; duration_minutes: number; difficulty: string; estimated_calories: number; is_free: boolean; video_path: string | null; category_id: string; session_number: number; equipment?: string | null; discipline?: string | null; body_zone?: string | null; }
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

  // ── Filtres ──
  const [showFilters, setShowFilters] = useState(false);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [fSearch, setFSearch] = useState("");
  const [fDur, setFDur] = useState<string[]>([]);
  const [fInt, setFInt] = useState<string[]>([]);
  const [fEquip, setFEquip] = useState<string[]>([]);
  const [fDisc, setFDisc] = useState<string[]>([]);
  const [fZone, setFZone] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const DURATIONS = [
    { key: "u15", label: "- de 15" },
    { key: "15-25", label: "15 à 25" },
    { key: "25-35", label: "25 à 35" },
    { key: "35+", label: "+ de 35" },
  ];
  const INTENSITIES = [
    { key: "beginner", label: "Faible" },
    { key: "intermediate", label: "Moyenne" },
    { key: "advanced", label: "Élevée" },
  ];
  const EQUIPMENTS = [
    { key: "reformer", label: "Reformer" },
    { key: "mat", label: "Pilates au sol" },
  ];
  const DISCIPLINES = [
    { key: "pilates", label: "Pilates" },
    { key: "renforcement", label: "Renforcement" },
    { key: "stretching", label: "Stretching" },
  ];
  const ZONES = [
    { key: "full_body", label: "Full body" },
    { key: "abs", label: "Abdos" },
    { key: "lower", label: "Bas du corps" },
    { key: "upper", label: "Haut du corps" },
  ];

  const toggle = (arr: string[], set: (v: string[]) => void, key: string) =>
    set(arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key]);

  const loadAllSessions = async () => {
    const { data } = await supabase.from("workouts").select("*").eq("is_published", true).order("order_index");
    setAllSessions((data as Session[]) || []);
  };

  const matchDuration = (s: Session) => {
    if (!fDur.length) return true;
    const d = s.duration_minutes || 0;
    return fDur.some(k => k === "u15" ? d < 15 : k === "15-25" ? d >= 15 && d <= 25 : k === "25-35" ? d > 25 && d <= 35 : d > 35);
  };

  const filtered = allSessions.filter(s =>
    matchDuration(s)
    && (!fInt.length || fInt.includes(s.difficulty))
    && (!fEquip.length || fEquip.includes(s.equipment || "reformer"))
    && (!fDisc.length || fDisc.includes(s.discipline || "pilates"))
    && (!fZone.length || fZone.includes(s.body_zone || "full_body"))
    && (!fSearch.trim() || (s.name_fr + " " + (s.description_fr || "")).toLowerCase().includes(fSearch.trim().toLowerCase()))
  );

  const activeFilterCount = fDur.length + fInt.length + fEquip.length + fDisc.length + fZone.length + (fSearch.trim() ? 1 : 0);

  const resetFilters = () => { setFDur([]); setFInt([]); setFEquip([]); setFDisc([]); setFZone([]); setFSearch(""); };

  const openFilters = () => { if (!allSessions.length) loadAllSessions(); setShowFilters(true); setShowResults(false); };

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
              <div className="mb-4">
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Connect Reformer</p>
                <h1 className="font-display text-3xl font-light text-foreground">Séances</h1>
                <p className="font-body text-sm text-muted-foreground mt-1">Choisissez un type de cours</p>
              </div>

              {/* Recherche + filtres */}
              <button onClick={openFilters}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"14px 18px", backgroundColor:"white", border:"1px solid rgba(28,27,25,0.08)", borderRadius:999, marginBottom:20, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                <Search size={17} color="#8B8578"/>
                <span style={{ flex:1, textAlign:"left", fontSize:14, color:"#8B8578" }}>Rechercher une séance</span>
                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:"#B8973E" }}>
                  <SlidersHorizontal size={14}/> Filtres
                </span>
              </button>

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
            {/* ══ PANNEAU DE FILTRES (plein écran) ══ */}
      <AnimatePresence>
        {showFilters && (
          <motion.div key="filters" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ type: "tween", duration: 0.22 }}
            style={{ position:"fixed", inset:0, zIndex:60, backgroundColor:"#F5F3EE", display:"flex", flexDirection:"column" }}>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"56px 20px 14px", backgroundColor:"white", borderBottom:"1px solid rgba(28,27,25,0.06)" }}>
              <button onClick={() => { setShowFilters(false); setShowResults(false); }}
                style={{ width:38, height:38, borderRadius:"50%", backgroundColor:"#1C1B19", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                <ChevronLeft size={18} color="white"/>
              </button>
              <h2 style={{ flex:1, fontSize:22, fontWeight:700, color:"#1C1B19", margin:0, fontFamily:"inherit" }}>
                {showResults ? `${filtered.length} séance${filtered.length > 1 ? "s" : ""}` : "Toutes les vidéos"}
              </h2>
              <button onClick={resetFilters}
                style={{ width:38, height:38, borderRadius:"50%", backgroundColor: activeFilterCount ? "#B8973E" : "rgba(28,27,25,0.07)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                <RotateCcw size={16} color={activeFilterCount ? "#1C1B19" : "#8B8578"}/>
              </button>
            </div>

            {/* Corps scrollable */}
            <div style={{ flex:1, overflowY:"auto", padding:"18px 20px 120px" }}>

              {!showResults && (<>
                {/* Recherche */}
                <div style={{ display:"flex", alignItems:"center", gap:10, backgroundColor:"white", borderRadius:999, padding:"13px 18px", marginBottom:24, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                  <Search size={17} color="#8B8578"/>
                  <input value={fSearch} onChange={e => setFSearch(e.target.value)} placeholder="Recherche"
                    style={{ flex:1, border:"none", outline:"none", fontSize:15, color:"#1C1B19", backgroundColor:"transparent", fontFamily:"inherit" }}/>
                  {fSearch && <button onClick={() => setFSearch("")} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}><X size={15} color="#8B8578"/></button>}
                </div>

                {([
                  ["Durées", "(En minutes)", DURATIONS, fDur, setFDur],
                  ["Intensités", "", INTENSITIES, fInt, setFInt],
                  ["Matériels", "", EQUIPMENTS, fEquip, setFEquip],
                  ["Disciplines", "", DISCIPLINES, fDisc, setFDisc],
                  ["Zones du corps", "", ZONES, fZone, setFZone],
                ] as const).map(([title, sub, options, selected, setter]) => (
                  <div key={title} style={{ marginBottom:26 }}>
                    <p style={{ fontSize:17, fontWeight:700, color:"#1C1B19", marginBottom:12 }}>
                      {title} {sub && <span style={{ fontWeight:400, fontSize:15 }}>{sub}</span>}
                    </p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                      {options.map(o => {
                        const on = (selected as string[]).includes(o.key);
                        return (
                          <button key={o.key} onClick={() => toggle(selected as string[], setter as any, o.key)}
                            style={{ padding:"11px 20px", borderRadius:999, fontSize:14, fontWeight:500, fontFamily:"inherit", cursor:"pointer",
                              border: on ? "1.5px solid #B8973E" : "1.5px solid rgba(28,27,25,0.18)",
                              backgroundColor: on ? "#B8973E" : "transparent",
                              color: on ? "#1C1B19" : "#1C1B19",
                              transition:"all .15s ease" }}>
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>)}

              {/* Résultats */}
              {showResults && (
                filtered.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"60px 20px" }}>
                    <p style={{ fontSize:32, marginBottom:8 }}>🔍</p>
                    <p style={{ fontSize:15, fontWeight:600, color:"#1C1B19", marginBottom:4 }}>Aucune séance</p>
                    <p style={{ fontSize:13, color:"#8B8578" }}>Essaie d'élargir tes filtres.</p>
                    <button onClick={() => setShowResults(false)} style={{ marginTop:16, padding:"11px 22px", borderRadius:999, border:"none", backgroundColor:"#1C1B19", color:"white", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Modifier les filtres</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {filtered.map((s, i) => {
                      const diff = DIFF[s.difficulty] || DIFF.intermediate;
                      const cat = categories.find(c => c.id === s.category_id);
                      const locked = !s.is_free;
                      return (
                        <motion.button key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          onClick={() => { if (cat) { setShowFilters(false); setShowResults(false); openCategory(cat); } }}
                          style={{ textAlign:"left", backgroundColor:"white", borderRadius:20, padding:16, border:"1px solid rgba(28,27,25,0.07)", boxShadow:"0 1px 8px rgba(0,0,0,0.04)", cursor:"pointer", fontFamily:"inherit" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:6 }}>
                            <p style={{ fontSize:15, fontWeight:600, color:"#1C1B19", margin:0 }}>{s.name_fr}</p>
                            <div style={{ width:32, height:32, borderRadius:"50%", backgroundColor: locked ? "rgba(28,27,25,0.06)" : (cat?.color || "#B8973E"), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              {locked ? <Lock size={12} color="#8B8578"/> : <Play size={12} color="white" fill="white"/>}
                            </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                            <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#8B8578" }}><Clock size={11}/> {s.duration_minutes} min</span>
                            <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:6, backgroundColor:diff.bg, color:diff.color }}>{diff.label}</span>
                            <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, backgroundColor:"rgba(28,27,25,0.06)", color:"#6B6560" }}>{(s.equipment || "reformer") === "reformer" ? "Reformer" : "Pilates au sol"}</span>
                            {s.body_zone && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, backgroundColor:"rgba(28,27,25,0.06)", color:"#6B6560" }}>{(ZONES.find(z => z.key === s.body_zone)?.label) || s.body_zone}</span>}
                            {cat && <span style={{ fontSize:11, color:"#B8973E" }}>{cat.emoji} {cat.name_fr}</span>}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* CTA fixe en bas */}
            {!showResults && (
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"14px 20px 34px", background:"linear-gradient(transparent, #F5F3EE 30%)" }}>
                <button onClick={() => setShowResults(true)}
                  style={{ width:"100%", padding:"17px", backgroundColor:"#1C1B19", color:"white", border:"none", borderRadius:999, fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 16px rgba(0,0,0,0.18)" }}>
                  Voir toutes les vidéos{activeFilterCount ? ` (${filtered.length})` : ""}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </MobileLayout>
  );
}
