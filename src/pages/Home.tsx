import WelcomeModal from "@/components/WelcomeModal";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Flame, ChevronRight, CheckCircle, Clock, Clapperboard as ClapperboardIcon, Layers } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import AppIcon, { type IconName } from "@/components/AppIcon";

const QUOTES = [
  { text: "Le corps s'adapte à tout ce que tu lui demandes régulièrement.", author: "Joseph Pilates" },
  { text: "Chaque séance est une promesse tenue envers toi-même.", author: "Connect Reformer" },
  { text: "La régularité bat toujours l'intensité.", author: "Anonyme" },
  { text: "Tu n'as pas à être parfaite, tu dois juste commencer.", author: "Connect Reformer" },
  { text: "Le mouvement est la meilleure médecine.", author: "Hippocrate" },
  { text: "Prends soin de ton corps, c'est le seul endroit où tu dois vivre.", author: "Jim Rohn" },
  { text: "La force ne vient pas de ce que tu peux faire. Elle vient du fait de surmonter ce que tu pensais ne pas pouvoir faire.", author: "Rikki Rogers" },
];

const DIFF: Record<string, { label: string; labelEn: string; color: string; bg: string }> = {
  beginner:     { label: "Débutante",    labelEn: "Beginner",     color: "#16A34A", bg: "rgba(22,163,74,0.1)"  },
  intermediate: { label: "Intermédiaire",labelEn: "Intermediate", color: "#B8973E", bg: "rgba(184,151,62,0.1)" },
  advanced:     { label: "Avancée",      labelEn: "Advanced",     color: "#EF4444", bg: "rgba(239,68,68,0.1)"  },
};

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const [streak, setStreak]               = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);
  const [showWelcome, setShowWelcome]     = useState(false);
  const [loading, setLoading]             = useState(true);

  const [recommended, setRecommended]     = useState<any>(null);
  const [currentProg, setCurrentProg]     = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfWeek  = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

      const [mRes, allRes, worRes, catRes, progRes, progSessRes] = await Promise.all([
        supabase.from("sessions").select("id,duration_minutes,completed_at").eq("user_id", user.id).gte("completed_at", startOfMonth).order("completed_at", { ascending: false }),
        supabase.from("sessions").select("completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(90),
        supabase.from("workouts").select("*").eq("is_published", true),
        supabase.from("workout_categories").select("*"),
        supabase.from("programs").select("*").eq("is_published", true).order("order_index").limit(6),
        supabase.from("program_sessions").select("*"),
      ]);

      const mData  = mRes.data  || [];
      const allData = allRes.data || [];
      const workouts = worRes.data || [];
      const categories = catRes.data || [];
      const programs = progRes.data || [];
      const progSessions = progSessRes.data || [];

      // ── Streak ──
      const dates = [...new Set(allData.map(s => new Date(s.completed_at).toDateString()))];
      let s = 0;
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const diff = Math.round((today.getTime() - new Date(dates[i]).getTime()) / 86400000);
        if (diff === i || diff === i + 1) s++; else break;
      }
      setStreak(s);
      setMonthSessions(mData.length);

      // ── Séances récentes (3 dernières avec nom catégorie) ──
      const recent3 = mData.slice(0, 3).map(sess => {
        const wo = workouts.find((w: any) => (w as any).id === (sess as any).workout_id);
        const cat = wo ? categories.find((c: any) => c.id === (wo as any).category_id) : null;
        return {
          ...sess,
          name: (wo as any)?.name_fr || (cat as any)?.name_fr || t("Séance", "Session"),
          icon: ((cat as any)?.icon || "activity") as IconName,
          dur: (sess as any).duration_minutes,
        };
      });
      setRecentSessions(recent3);

      // ── Programme en cours (dernier avec des séances effectuées) ──
      if (programs.length) {
        const userWorkoutIds = new Set(allData.map((s: any) => s.workout_id));
        let best: any = null;
        for (const prog of programs) {
          const sessions = progSessions.filter((ps: any) => ps.program_id === (prog as any).id);
          const total = sessions.length;
          const done = sessions.filter((ps: any) => userWorkoutIds.has(ps.workout_id)).length;
          if (done > 0 && done < total) { best = { prog, done, total }; break; }
        }
        if (!best && programs[0]) {
          const sessions = progSessions.filter((ps: any) => ps.program_id === (programs[0] as any).id);
          best = { prog: programs[0], done: 0, total: sessions.length };
        }
        if (best) {
          const pct = best.total ? Math.round((best.done / best.total) * 100) : 0;
          const nextSess = progSessions.find((ps: any) =>
            ps.program_id === (best.prog as any).id &&
            !userWorkoutIds.has(ps.workout_id)
          );
          const nextWo = nextSess ? workouts.find((w: any) => w.id === nextSess.workout_id) : null;
          setCurrentProg({ ...best, pct, nextName: (nextWo as any)?.name_fr });
        }
      }

      // ── Séance recommandée ──
      const goals: string[] = (profile as any)?.goals || [];
      const lastWoId = allData[0] ? (allData[0] as any).workout_id : null;
      const scored = workouts
        .filter((w: any) => w.id !== lastWoId)
        .map((w: any) => {
          let score = 0;
          if (goals.includes("perte_gras")   && w.difficulty === "advanced")      score += 3;
          if (goals.includes("souplesse")    && w.discipline === "stretching")    score += 3;
          if (goals.includes("force")        && w.discipline === "renforcement")  score += 3;
          if (goals.includes("tonification") && w.difficulty === "intermediate")  score += 2;
          if (goals.includes("detente")      && w.discipline === "stretching")    score += 2;
          if (goals.includes("endurance")    && w.difficulty !== "beginner")      score += 1;
          if (w.is_free) score += 1;
          score += Math.random() * 0.5; // légère variation quotidienne
          return { ...w, score };
        })
        .sort((a: any, b: any) => b.score - a.score);

      const rec = scored[0];
      if (rec) {
        const cat = categories.find((c: any) => c.id === rec.category_id);
        setRecommended({ ...rec, catName: (cat as any)?.name_fr });
      } else if (workouts[0]) {
        const cat = categories.find((c: any) => c.id === (workouts[0] as any).category_id);
        setRecommended({ ...workouts[0], catName: (cat as any)?.name_fr });
      }

    } catch (e) {
      console.error("loadAll error:", e);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (user) {
      loadAll();
      const key = `welcome_shown_${user.id}`;
      if (!localStorage.getItem(key)) {
        setTimeout(() => setShowWelcome(true), 800);
        localStorage.setItem(key, "true");
      }
    }
  }, [user, loadAll]);

  const diff = recommended ? (DIFF[recommended.difficulty] || DIFF.intermediate) : DIFF.intermediate;

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-32">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mb-6">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            {profile?.first_name ? `${t("Bonjour", "Hello")}, ${profile.first_name}` : `${t("Bonjour", "Hello")}`}
          </p>
          <h1 className="font-display text-3xl font-light text-foreground">{t("Prête à bouger ?", "Ready to move?")}</h1>
        </motion.div>

        {/* ── 1. SÉANCE RECOMMANDÉE ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }} className="mb-4">
          {recommended ? (
            <div style={{ background:"rgba(184,151,62,0.06)", border:"0.5px solid rgba(184,151,62,0.2)", borderRadius:16, padding:"16px 18px" }}>
              <p style={{ fontSize:10, color:"#B8973E", letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 10px" }}>
                {t("Votre séance du jour", "Your session today")}
              </p>
              <p className="font-display" style={{ fontSize:17, fontWeight:400, color:"var(--color-text-primary)", margin:"0 0 8px", lineHeight:1.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {recommended.name_fr}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:"var(--color-text-secondary)", display:"flex", alignItems:"center", gap:4 }}>
                  <Clock size={12}/>{recommended.duration_minutes || "—"} min
                </span>
                {recommended.catName && (
                  <span style={{ fontSize:11, color:"var(--color-text-tertiary)" }}>{recommended.catName}</span>
                )}
                <button
                  onClick={() => navigate("/library")}
                  style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#B8973E", display:"flex", alignItems:"center", gap:5, padding:0, fontFamily:"inherit" }}>
                  {t("Commencer", "Start")}<ChevronRight size={14}/>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ borderRadius:16, background:"rgba(184,151,62,0.06)", border:"0.5px solid rgba(184,151,62,0.2)", padding:"20px 18px", textAlign:"center" }}>
              <p style={{ fontSize:13, color:"var(--color-text-secondary)", margin:0 }}>{t("Aucune séance disponible", "No session available")}</p>
            </div>
          )}
        </motion.div>

        {/* ── 2. STATS ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="grid grid-cols-2 gap-3 mb-4">
          <div style={{ background:"rgba(184,151,62,0.04)", borderRadius:16, padding:"16px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
              <Flame size={15} style={{ color:"#B8973E" }}/>
              <span style={{ fontSize:11, color:"var(--color-text-secondary)" }}>Streak</span>
            </div>
            <p className="font-display" style={{ fontSize:24, fontWeight:400, color:"var(--color-text-primary)", margin:0 }}>{streak} {t("jours", "days")}</p>
          </div>
          <div style={{ background:"rgba(184,151,62,0.04)", borderRadius:16, padding:"16px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
              <CheckCircle size={15} style={{ color:"#B8973E" }}/>
              <span style={{ fontSize:11, color:"var(--color-text-secondary)" }}>{t("Ce mois", "This month")}</span>
            </div>
            <p className="font-display" style={{ fontSize:24, fontWeight:400, color:"var(--color-text-primary)", margin:0 }}>{monthSessions}</p>
          </div>
        </motion.div>

        {/* ── 3. PROGRAMME EN COURS ── */}
        {currentProg && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            style={{ background:"rgba(184,151,62,0.04)", borderRadius:16, padding:"16px", marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <p className="font-body text-sm font-semibold text-foreground">{t("Mon programme", "My program")}</p>
              <button onClick={() => navigate("/programs")} style={{ display:"flex", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                <span style={{ fontSize:11, color:"#B8973E" }}>{t("Voir", "View")}</span>
                <ChevronRight size={12} color="#B8973E"/>
              </button>
            </div>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", margin:"0 0 10px", lineHeight:1.4 }}>
              {(currentProg.prog as any).name_fr}
              {currentProg.nextName && (
                <span style={{ color:"var(--color-text-tertiary)" }}> · {t("Prochaine", "Next")} : {currentProg.nextName}</span>
              )}
            </p>
            {/* Barre */}
            <div style={{ height:5, backgroundColor:"rgba(28,27,25,0.07)", borderRadius:999, overflow:"hidden", marginBottom:6 }}>
              <div style={{ height:"100%", width:`${currentProg.pct}%`, backgroundColor:"#B8973E", borderRadius:999, transition:"width 0.8s ease" }}/>
            </div>
            <p style={{ fontSize:10, color:"var(--color-text-tertiary)", margin:0 }}>
              {currentProg.done}/{currentProg.total} {t("séances · ", "sessions · ")}{currentProg.pct}% {t("complété", "completed")}
            </p>
          </motion.div>
        )}

        {/* ── 4. SÉANCES RÉCENTES ── */}
        {recentSessions.length > 0 && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            style={{ background:"rgba(184,151,62,0.04)", borderRadius:16, padding:"16px", marginBottom:16 }}>
            <p className="font-body text-sm font-semibold text-foreground mb-3">{t("Séances récentes", "Recent sessions")}</p>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {recentSessions.map((sess, i) => {
                const d = new Date(sess.completed_at);
                const today = new Date();
                const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
                const when = diff === 0 ? t("Aujourd'hui", "Today") : diff === 1 ? t("Hier", "Yesterday") : `${diff} ${t("jours", "days")}`;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: i > 0 ? "10px 0 0" : "0 0 10px", borderTop: i > 0 ? "0.5px solid rgba(28,27,25,0.07)" : "none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", backgroundColor:"rgba(22,163,74,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <CheckCircle size={15} color="#16A34A"/>
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:500, color:"var(--color-text-primary)", margin:0 }}>{sess.name}</p>
                        <p style={{ fontSize:10, color:"var(--color-text-tertiary)", margin:0 }}>{when}{sess.dur ? ` · ${sess.dur} min` : ""}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── 5. CITATION DU JOUR ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          style={{ backgroundColor:"rgba(184,151,62,0.06)", border:"0.5px solid rgba(184,151,62,0.2)", borderRadius:20, padding:"14px 16px", marginBottom:16 }}>
          <p style={{ fontSize:10, color:"#B8973E", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 6px" }}>
            {t("Citation du jour", "Quote of the day")}
          </p>
          <p style={{ fontSize:13, fontStyle:"italic", color:"var(--color-text-primary)", margin:"0 0 4px", lineHeight:1.6 }}>
            "{quote.text}"
          </p>
          <p style={{ fontSize:10, color:"var(--color-text-tertiary)", margin:0 }}>— {quote.author}</p>
        </motion.div>

        {/* ── 6. ACTIONS RAPIDES ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/library")} style={{ background:"rgba(184,151,62,0.04)", border:"none", borderRadius:16, padding:"16px", textAlign:"left", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <ClapperboardIcon size={16} style={{ color:"#B8973E" }}/>
              <ChevronRight size={14} style={{ color:"var(--color-text-tertiary)" }}/>
            </div>
            <p className="font-display" style={{ fontSize:15, fontWeight:400, color:"var(--color-text-primary)", margin:"0 0 2px" }}>{t("Séances", "Sessions")}</p>
            <p style={{ fontSize:11, color:"var(--color-text-secondary)", margin:0 }}>{t("Bibliothèque complète", "Full library")}</p>
          </button>
          <button onClick={() => navigate("/programs")} style={{ background:"rgba(184,151,62,0.04)", border:"none", borderRadius:16, padding:"16px", textAlign:"left", cursor:"pointer" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <Layers size={16} style={{ color:"#B8973E" }}/>
              <ChevronRight size={14} style={{ color:"var(--color-text-tertiary)" }}/>
            </div>
            <p className="font-display" style={{ fontSize:15, fontWeight:400, color:"var(--color-text-primary)", margin:"0 0 2px" }}>{t("Programmes", "Programs")}</p>
            <p style={{ fontSize:11, color:"var(--color-text-secondary)", margin:0 }}>{t("Suivre un plan", "Follow a plan")}</p>
          </button>
        </motion.div>

      </div>
      <BottomNav/>
      {showWelcome && <WelcomeModal firstName={profile?.first_name} onClose={() => setShowWelcome(false)}/>}
    </MobileLayout>
  );
}
