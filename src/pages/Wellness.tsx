import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, TrendingUp, Flame, Moon, Heart, Wind, CheckCircle } from "lucide-react";
import AppIcon, { type IconName } from "@/components/AppIcon";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/i18n/LanguageContext";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

// ── Types ─────────────────────────────────────────────────────
// Structure DB exacte wellness_entries
interface WellnessEntry {
  id: string;
  user_id: string;
  entry_date: string;   // date (YYYY-MM-DD)
  mood: number;         // smallint 1-5
  energy: number;       // smallint 1-5
  sleep: number;        // smallint 1-5
  stress: number;       // smallint 1-5
  body?: number;        // smallint 1-5 (optionnel)
  note?: string;        // text
  tags?: string[];      // array
  score?: number;       // integer calculé
  created_at?: string;
}

interface WeekStats {
  avgMood: number; avgEnergy: number;
  avgSleep: number; avgStress: number;
  totalEntries: number; streak: number;
}

// ── Helpers ───────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

const MOOD_LABELS: Record<number, string> = { 1:"Difficile", 2:"Fatiguée", 3:"Neutre", 4:"Bien", 5:"Excellente" };
const SLEEP_LABELS: Record<number, string> = { 1:"Mauvais", 2:"Agité", 3:"Acceptable", 4:"Bon", 5:"Excellent" };
const STRESS_LABELS: Record<number, string> = { 1:"Très stressée", 2:"Stressée", 3:"Modérée", 4:"Calme", 5:"Sereine" };
const ENERGY_LABELS: Record<number, string> = { 1:"Épuisée", 2:"Fatiguée", 3:"Normale", 4:"Énergique", 5:"Pleine d'énergie" };

const FEELINGS = ["Courbatures","Digestion","Stress","Manque de sommeil","Bonne forme","Motivée","Hydratée","Relâchée","Légère","Forte"];

const sliderColors = ["#C77B62","#D19B70","#C9A96E","#A8A870","#7A9578"];

// ── Composant slider ──────────────────────────────────────────
function ScoreSlider({ label, sub, value, onChange, labels }: {
  label: string; sub: string; value: number;
  onChange: (v: number) => void; labels: Record<number, string>;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-body text-sm font-semibold text-foreground">{label}</p>
          <p className="font-body text-xs text-muted-foreground">{sub}</p>
        </div>
        <span className="font-body text-xs font-semibold px-2 py-1 rounded-full"
          style={{ backgroundColor: sliderColors[value-1] + "20", color: sliderColors[value-1] }}>
          {labels[value]}
        </span>
      </div>
      <div className="flex gap-2">
        {[1,2,3,4,5].map(i => (
          <button key={i} onClick={() => onChange(i)}
            style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i <= value ? sliderColors[value-1] : "rgba(28,27,25,0.08)", border: "none", cursor: "pointer", transition: "all 0.2s" }} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-body text-[10px] text-muted-foreground">1</span>
        <span className="font-body text-[10px] text-muted-foreground">5</span>
      </div>
    </div>
  );
}

// ── Composant carte stat semaine ──────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col gap-2">
      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className="font-body text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-light text-foreground">{value}</p>
      {sub && <p className="font-body text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Composant conseil santé ───────────────────────────────────
function HealthInsight({ icon, title, text, color }: { icon: IconName; title: string; text: string; color: string }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ backgroundColor: color + "08", borderColor: color + "25" }}>
      <div className="flex items-start gap-3">
        <span style={{ flexShrink: 0, display:"flex" }}><AppIcon name={icon} size={22} color={color} /></span>
        <div>
          <p className="font-body text-sm font-semibold text-foreground mb-1">{title}</p>
          <p className="font-body text-xs text-muted-foreground leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function Wellness() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [todayEntry, setTodayEntry] = useState<WellnessEntry | null>(null);
  const [weekStats, setWeekStats] = useState<WeekStats | null>(null);
  const [history, setHistory] = useState<WellnessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Formulaire
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [savingGoals, setSavingGoals] = useState(false);

  const GOALS = [
    { key: "perte_gras",  label: "Perte de gras",  icon: "perte_gras" as IconName },
    { key: "prise_masse", label: "Prise de masse", icon: "prise_masse" as IconName },
    { key: "souplesse",   label: "Souplesse",      icon: "souplesse" as IconName },
    { key: "force",       label: "Force",          icon: "force" as IconName },
    { key: "endurance",   label: "Endurance",      icon: "endurance" as IconName },
    { key: "posture",     label: "Posture",        icon: "posture" as IconName },
    { key: "tonification",label: "Tonification",   icon: "tonification" as IconName },
    { key: "detente",     label: "Détente",        icon: "detente" as IconName },
  ];

  const toggleGoal = async (key: string) => {
    const next = goals.includes(key) ? goals.filter(g => g !== key) : [...goals, key];
    setGoals(next);
    setSavingGoals(true);
    await supabase.from("profiles").update({ goals: next }).eq("id", user!.id);
    setSavingGoals(false);
  };

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("goals").eq("id", user.id).single()
      .then(({ data }) => { if (data?.goals) setGoals(data.goals); });
  }, [user]);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    const todayStr = today();

    const [todayRes, historyRes] = await Promise.all([
      supabase.from("wellness_entries")
      .select("id, user_id, entry_date, mood, energy, sleep, stress, body, note, tags, score, created_at")
      .eq("user_id", user!.id)
      .eq("entry_date", todayStr)
      .maybeSingle(),
      supabase.from("wellness_entries")
      .select("id, user_id, entry_date, mood, energy, sleep, stress, body, note, tags, score, created_at")
      .eq("user_id", user!.id)
      .order("entry_date", { ascending: false })
      .limit(30),
    ]);

    setTodayEntry(todayRes.data);
    const entries = historyRes.data || [];
    setHistory(entries);

    // Calculer les stats sur les 7 derniers jours
    const last7 = entries.slice(0, 7);
    if (last7.length > 0) {
      const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10;
      
      // Calcul série
      let streak = 0;
      const now = new Date();
      for (let i = 0; i < entries.length; i++) {
        const d = new Date(entries[i].entry_date);
        const diff = Math.round((now.getTime() - d.getTime()) / 86400000);
        if (diff === i || diff === i + 1) streak++;
        else break;
      }

      setWeekStats({
        avgMood:   avg(last7.map(e => e.mood)),
        avgEnergy: avg(last7.map(e => e.energy)),
        avgSleep:  avg(last7.map(e => e.sleep)),
        avgStress: avg(last7.map(e => e.stress)),
        totalEntries: entries.length,
        streak,
      });
    }
    setLoading(false);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const globalScore = Math.round(((mood + energy + sleep + stress) / 20) * 100);

    // Upsert avec les vrais noms de colonnes DB
    const { error: upsertError } = await supabase.from("wellness_entries").upsert({
      user_id: user.id,
      entry_date: today(),   // date YYYY-MM-DD
      mood,                  // smallint 1-5
      energy,                // smallint 1-5
      sleep,                 // smallint 1-5
      stress,                // smallint 1-5
      tags: feelings,        // array text[]
      note: notes,           // text
      score: globalScore,    // integer
    }, { onConflict: "user_id,entry_date" });
    if (upsertError) { console.error("Wellness upsert error:", upsertError); setSaving(false); return; }

    await loadData();
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  // ── Insights santé personnalisés ────────────────────────────
  const getInsights = () => {
    const insights = [];
    if (!weekStats) return insights;
    
    if (weekStats.avgSleep >= 4) insights.push({ icon: "moon" as IconName, color: "#B8973E",
      title: "Sommeil récupérateur",
      text: "Ton sommeil de qualité booste tes performances Pilates de 30%. Un corps reposé progresse 2x plus vite." });
    if (weekStats.avgSleep < 3) insights.push({ icon: "moon" as IconName, color: "#B8973E",
      title: "Privilégie le sommeil",
      text: "Le Pilates améliore naturellement la qualité du sommeil. 8h de récupération permettent à tes muscles de se reconstruire." });
    if (weekStats.avgStress >= 4) insights.push({ icon: "posture" as IconName, color: "#B8973E",
      title: "Tu gères le stress",
      text: "Le Pilates active le système nerveux parasympathique, réduisant le cortisol jusqu'à 25%. Continue !" });
    if (weekStats.avgStress < 3) insights.push({ icon: "detente" as IconName, color: "#B8973E",
      title: "Le Pilates anti-stress",
      text: "3 séances par semaine réduisent l'anxiété de 40% en 8 semaines. Chaque respiration compte." });
    if (weekStats.avgEnergy >= 4) insights.push({ icon: "bolt" as IconName, color: "#B8973E",
      title: "Énergie au top",
      text: "Ton niveau d'énergie élevé est idéal pour progresser. C'est le moment de pousser tes limites !" });
    if (weekStats.avgMood >= 4) insights.push({ icon: "sparkles" as IconName, color: "#B8973E",
      title: "Bonne humeur = meilleurs résultats",
      text: "La bonne humeur libère des endorphines qui amplifient les bénéfices du Pilates. Garde cette énergie !" });
    if (weekStats.streak >= 5) insights.push({ icon: "flame" as IconName, color: "#B8973E",
      title: weekStats.streak + " jours d'affilée !",
      text: "La régularité est la clé. Après 21 jours de pratique continue, le Pilates devient un besoin naturel." });
    if (weekStats.totalEntries >= 10) insights.push({ icon: "diamond" as IconName, color: "#B8973E",
      title: "Tu te connais mieux",
      text: weekStats.totalEntries + " journaux complétés ! La connaissance de ton corps est le premier secret de la progression." });

    // Toujours au moins 2 insights
    if (insights.length === 0) insights.push(
      { icon: "sprout" as IconName, color: "#B8973E", title: "Commence ton suivi", text: "Le journal bien-être t'aide à comprendre comment ton corps réagit au Pilates et à optimiser ta pratique." },
      { icon: "strength" as IconName, color: "#B8973E", title: "Le Pilates transforme", text: "4 à 6 semaines de pratique régulière suffisent pour voir des changements visibles sur la posture et la silhouette." }
    );

    return insights.slice(0, 3);
  };

  const insights = getInsights();

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">

        {/* Header */}
        <div className="mb-5">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Connect Reformer</p>
          <h1 className="font-display text-3xl font-light text-foreground">{t("Bien-être", "Wellness")}</h1>
        </div>

        {/* Mes objectifs */}
        <div className="mb-5">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest" style={{ margin:0 }}>{t("Mes objectifs", "My goals")}</p>
            {savingGoals && <span style={{ fontSize:10, color:"#B8973E" }}>{t("Enregistrement…", "Saving…")}</span>}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {GOALS.map(g => {
              const on = goals.includes(g.key);
              return (
                <button key={g.key} onClick={() => toggleGoal(g.key)}
                  style={{ padding:"9px 14px", borderRadius:999, fontSize:13, fontWeight:600, fontFamily:"inherit", cursor:"pointer",
                    border: on ? "1.5px solid #B8973E" : "1.5px solid rgba(28,27,25,0.12)",
                    backgroundColor: on ? "#B8973E" : "white",
                    color: on ? "#1C1B19" : "#6B6560",
                    boxShadow: on ? "0 2px 8px rgba(184,151,62,0.25)" : "none",
                    transition: "all .15s ease" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}><AppIcon name={g.icon} size={15} color={on ? "#1C1B19" : "#B8973E"} />{g.label}</span>
                </button>
              );
            })}
          </div>
          {goals.length > 0 && (
            <p style={{ fontSize:11, color:"#8B8578", marginTop:8 }}>
              {goals.length} objectif{goals.length > 1 ? "s" : ""} sélectionné{goals.length > 1 ? "s" : ""} — tes séances recommandées s'adapteront.
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Formulaire — visible uniquement si pas encore rempli aujourd'hui ── */}
          {!todayEntry && !loading && (
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>

              <div className="rounded-3xl p-4 mb-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
                <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t("Aujourd'hui", "Today")}</p>
                <p className="font-display text-lg font-light text-white">{t("Comment se porte votre corps ?", "How is your body feeling?")}</p>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <ScoreSlider label="Humeur" sub="Comment vous sentez-vous ?" value={mood} onChange={setMood} labels={MOOD_LABELS} />
                <ScoreSlider label="Énergie" sub="Quel est votre niveau d'énergie ?" value={energy} onChange={setEnergy} labels={ENERGY_LABELS} />
                <ScoreSlider label="Qualité du sommeil" sub="Comment avez-vous dormi ?" value={sleep} onChange={setSleep} labels={SLEEP_LABELS} />
                <ScoreSlider label="Stress" sub="1 = très stressée, 5 = sereine" value={stress} onChange={setStress} labels={STRESS_LABELS} />
              </div>

              {/* Ressentis */}
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <p className="font-body text-sm font-semibold text-foreground mb-3">{t("Ce que je ressens", "How I feel")}</p>
                <div className="flex flex-wrap gap-2">
                  {FEELINGS.map(f => (
                    <button key={f} onClick={() => setFeelings(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                      className="font-body text-xs px-3 py-1.5 rounded-full transition-all"
                      style={{ backgroundColor: feelings.includes(f) ? "#B8973E" : "rgba(28,27,25,0.07)", color: feelings.includes(f) ? "#1C1B19" : "#6B6560", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: feelings.includes(f) ? 600 : 400 }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <p className="font-body text-sm font-semibold text-foreground mb-2">{t("Note personnelle", "Personal note")}</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Je me sens..."
                  rows={3} style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 14, color: "#1C1B19", fontFamily: "inherit", backgroundColor: "transparent", lineHeight: 1.6 }} />
              </div>

              <button onClick={save} disabled={saving}
                style={{ width: "100%", padding: "16px", backgroundColor: "#1C1B19", color: "#FDFAF7", border: "none", borderRadius: 16, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Enregistrement..." : "Enregistrer ma journée"}
              </button>
            </motion.div>
          )}

          {/* ── Journal rempli aujourd'hui ── */}
          {todayEntry && (
            <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

              {/* Confirmation */}
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                className="rounded-3xl p-5 mb-5 overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "rgba(184,151,62,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle size={26} color="#B8973E" />
                  </div>
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{t("Journal du jour", "Today's journal")}</p>
                    <p className="font-display text-lg font-light text-white">Journée enregistrée ✓</p>
                    <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Score {todayEntry.score || Math.round(((todayEntry.mood + todayEntry.energy + todayEntry.sleep + todayEntry.stress) / 20) * 100)}/100 · Reviens demain !
                    </p>
                  </div>
                </div>
                {/* Mini scores */}
                <div className="flex gap-3 mt-4">
                  {[
                    { label: t("Humeur", "Mood"), value: todayEntry.mood, color: "#B8973E" },
                    { label: t("Énergie", "Energy"), value: todayEntry.energy, color: "#B8973E" },
                    { label: t("Sommeil", "Sleep"), value: todayEntry.sleep, color: "#B8973E" },
                    { label: "Stress", value: todayEntry.stress, color: "#B8973E" },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}/5</p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Stats 7 jours */}
              {weekStats && weekStats.totalEntries >= 2 && (
                <>
                  <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Tendances — 7 derniers jours</p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <StatCard icon={Heart}     label="Humeur moyenne"  value={weekStats.avgMood + "/5"}   color="#B8973E" sub={weekStats.avgMood >= 4 ? "Excellente forme !" : "En progression"} />
                    <StatCard icon={Flame}      label="Énergie moyenne" value={weekStats.avgEnergy + "/5"} color="#B8973E" sub={weekStats.avgEnergy >= 4 ? "Tu es en feu !" : "Garde le rythme"} />
                    <StatCard icon={Moon}       label="Qualité sommeil" value={weekStats.avgSleep + "/5"}  color="#B8973E" sub={weekStats.avgSleep >= 4 ? "Récupération top" : "Essaie de dormir plus"} />
                    <StatCard icon={Wind}       label="Niveau de stress" value={weekStats.avgStress + "/5"} color="#B8973E" sub={weekStats.avgStress >= 4 ? "Très sereine" : "Le Pilates aide !"} />
                  </div>
                </>
              )}

              {/* Graphique courbe SVG bien-être */}
              {history.length >= 2 && (() => {
                const data = history.slice(0, 21).reverse();
                const scores = data.map(e => e.score || Math.round(((e.mood + e.energy + e.sleep + e.stress) / 20) * 100));
                const W = 320, H = 120, PAD = 16;
                const minS = Math.max(0, Math.min(...scores) - 10);
                const maxS = Math.min(100, Math.max(...scores) + 10);
                const xStep = (W - PAD * 2) / Math.max(scores.length - 1, 1);
                const yScale = (s: number) => H - PAD - ((s - minS) / (maxS - minS)) * (H - PAD * 2);
                const pts = scores.map((s, i) => [PAD + i * xStep, yScale(s)] as [number,number]);
                // Courbe smooth via cubic bezier
                const path = pts.reduce((acc, [x, y], i) => {
                  if (i === 0) return `M ${x} ${y}`;
                  const [px, py] = pts[i - 1];
                  const cx = (px + x) / 2;
                  return acc + ` C ${cx} ${py} ${cx} ${y} ${x} ${y}`;
                }, "");
                const areaPath = path + ` L ${pts[pts.length-1][0]} ${H - PAD} L ${PAD} ${H - PAD} Z`;
                const todayScore = scores[scores.length - 1];
                const scoreColor = todayScore >= 75 ? "#7A9578" : todayScore >= 50 ? "#B8973E" : "#C77B62";
                return (
                  <div className="bg-card rounded-3xl p-4 border border-border shadow-sm mb-5">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <div>
                        <p className="font-body text-xs font-semibold text-foreground">{t("Évolution du bien-être", "Wellness trends")}</p>
                        <p className="font-body text-[11px] text-muted-foreground">Score global — {data.length} derniers jours</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{todayScore}</p>
                        <p style={{ fontSize: 10, color: "#8B8578" }}>/ 100</p>
                      </div>
                    </div>
                    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", marginTop: 8 }}>
                      <defs>
                        <linearGradient id="wellGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={scoreColor} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={scoreColor} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Lignes grille */}
                      {[25,50,75,100].map(v => {
                        const y = yScale(Math.min(v, maxS));
                        if (y < PAD || y > H - PAD) return null;
                        return <g key={v}>
                          <line x1={PAD} y1={y} x2={W-PAD} y2={y} stroke="rgba(28,27,25,0.05)" strokeWidth="1" />
                          <text x={PAD - 2} y={y + 3} textAnchor="end" fontSize="8" fill="#C4BDB5">{v}</text>
                        </g>;
                      })}
                      {/* Aire */}
                      <path d={areaPath} fill="url(#wellGrad)" />
                      {/* Courbe */}
                      <path d={path} fill="none" stroke={scoreColor} strokeWidth="2.5" strokeLinecap="round" />
                      {/* Points */}
                      {pts.map(([x, y], i) => {
                        const isLast = i === pts.length - 1;
                        return <g key={i}>
                          <circle cx={x} cy={y} r={isLast ? 5 : 3} fill={isLast ? scoreColor : "white"} stroke={scoreColor} strokeWidth={isLast ? 0 : 2} />
                          {isLast && <circle cx={x} cy={y} r={9} fill={scoreColor} fillOpacity="0.2" />}
                        </g>;
                      })}
                      {/* Labels jours */}
                      {data.map((e, i) => {
                        if (data.length > 10 && i % 2 !== 0) return null;
                        const [x] = pts[i];
                        return <text key={i} x={x} y={H} textAnchor="middle" fontSize="8" fill="#C4BDB5">
                          {new Date(e.entry_date).toLocaleDateString("fr-FR", { weekday: "narrow" })}
                        </text>;
                      })}
                    </svg>
                    {/* Légende métriques */}
                    <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                      {[
                        { label: t("Humeur", "Mood"), value: data[data.length-1]?.mood, color: "#B8973E" },
                        { label: t("Énergie", "Energy"), value: data[data.length-1]?.energy, color: "#B8973E" },
                        { label: t("Sommeil", "Sleep"), value: data[data.length-1]?.sleep, color: "#B8973E" },
                        { label: "Stress", value: data[data.length-1]?.stress, color: "#B8973E" },
                      ].map(m => (
                        <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: m.color }} />
                          <span style={{ fontSize: 11, color: "#6B6560" }}>{m.label} <strong style={{ color: "#1C1B19" }}>{m.value}/5</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Insights santé */}
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">{t("Tes insights personnalisés", "Your personalized insights")}</p>
              <div className="flex flex-col gap-3 mb-5">
                {insights.map((ins, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <HealthInsight {...ins} />
                  </motion.div>
                ))}
              </div>

              {/* Bouton Pilates */}
              <button onClick={() => navigate("/library")}
                style={{ width: "100%", padding: "15px 20px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 16, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span>Lancer une séance maintenant</span>
                <ChevronRight size={20} />
              </button>

              {/* Mensurations */}
              <button onClick={() => navigate("/measurements")}
                style={{ width: "100%", padding: "14px 16px", backgroundColor: "white", border: "1px solid rgba(28,27,25,0.07)", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(184,151,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><AppIcon name="ruler" size={18} /></div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1B19", margin: 0 }}>Mes mensurations</p>
                    <p style={{ fontSize: 12, color: "#8B8578", margin: 0 }}>Suivre poids, taille, hanches...</p>
                  </div>
                </div>
                <ChevronRight size={16} color="#B8B0A6" />
              </button>

            </motion.div>
          )}

          {/* ── Chargement ── */}
          {loading && (
            <motion.div key="loading" className="flex justify-center py-20">
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
            </motion.div>
          )}

        </AnimatePresence>

      </div>
      <BottomNav />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MobileLayout>
  );
}
