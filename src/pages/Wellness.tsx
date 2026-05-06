import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, TrendingUp, Flame, Moon, Heart, Wind, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/i18n/LanguageContext";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

// ── Types ─────────────────────────────────────────────────────
interface WellnessEntry {
  id: string; entry_date: string;
  mood: number; energy: number;
  sleep: number; stress: number;
  body?: number; note?: string;
  tags?: string[]; score?: number;
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

const sliderColors = ["#EF4444","#F97316","#F59E0B","#84CC16","#22C55E"];

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
function HealthInsight({ icon, title, text, color }: { icon: string; title: string; text: string; color: string }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ backgroundColor: color + "08", borderColor: color + "25" }}>
      <div className="flex items-start gap-3">
        <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
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

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    const todayStr = today();

    const [todayRes, historyRes] = await Promise.all([
      supabase.from("wellness_entries").select("*").eq("user_id", user!.id).eq("entry_date", todayStr).maybeSingle(),
      supabase.from("wellness_entries").select("*").eq("user_id", user!.id).order("entry_date", { ascending: false }).limit(30),
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

    await supabase.from("wellness_entries").upsert({
      user_id: user.id,
      entry_date: today(),
      mood: mood,
      energy: energy,
      sleep: sleep,
      stress: stress,
      tags: feelings,
      note: notes,
      score: globalScore,
    }, { onConflict: "user_id,entry_date" });

    await loadData();
    setSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  // ── Insights santé personnalisés ────────────────────────────
  const getInsights = () => {
    const insights = [];
    if (!weekStats) return insights;
    
    if (weekStats.avgSleep >= 4) insights.push({ icon: "🌙", color: "#6366F1",
      title: "Sommeil récupérateur",
      text: "Ton sommeil de qualité booste tes performances Pilates de 30%. Un corps reposé progresse 2x plus vite." });
    if (weekStats.avgSleep < 3) insights.push({ icon: "😴", color: "#8B5CF6",
      title: "Privilégie le sommeil",
      text: "Le Pilates améliore naturellement la qualité du sommeil. 8h de récupération permettent à tes muscles de se reconstruire." });
    if (weekStats.avgStress >= 4) insights.push({ icon: "🧘", color: "#10B981",
      title: "Tu gères le stress",
      text: "Le Pilates active le système nerveux parasympathique, réduisant le cortisol jusqu'à 25%. Continue !" });
    if (weekStats.avgStress < 3) insights.push({ icon: "🌿", color: "#F59E0B",
      title: "Le Pilates anti-stress",
      text: "3 séances par semaine réduisent l'anxiété de 40% en 8 semaines. Chaque respiration compte." });
    if (weekStats.avgEnergy >= 4) insights.push({ icon: "⚡", color: "#F59E0B",
      title: "Énergie au top",
      text: "Ton niveau d'énergie élevé est idéal pour progresser. C'est le moment de pousser tes limites !" });
    if (weekStats.avgMood >= 4) insights.push({ icon: "✨", color: "#EC4899",
      title: "Bonne humeur = meilleurs résultats",
      text: "La bonne humeur libère des endorphines qui amplifient les bénéfices du Pilates. Garde cette énergie !" });
    if (weekStats.streak >= 5) insights.push({ icon: "🔥", color: "#EF4444",
      title: weekStats.streak + " jours d'affilée !",
      text: "La régularité est la clé. Après 21 jours de pratique continue, le Pilates devient un besoin naturel." });
    if (weekStats.totalEntries >= 10) insights.push({ icon: "💎", color: "#B8973E",
      title: "Tu te connais mieux",
      text: weekStats.totalEntries + " journaux complétés ! La connaissance de ton corps est le premier secret de la progression." });

    // Toujours au moins 2 insights
    if (insights.length === 0) insights.push(
      { icon: "🌱", color: "#10B981", title: "Commence ton suivi", text: "Le journal bien-être t'aide à comprendre comment ton corps réagit au Pilates et à optimiser ta pratique." },
      { icon: "💪", color: "#B8973E", title: "Le Pilates transforme", text: "4 à 6 semaines de pratique régulière suffisent pour voir des changements visibles sur la posture et la silhouette." }
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
          <h1 className="font-display text-3xl font-light text-foreground">Bien-être</h1>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Formulaire — visible uniquement si pas encore rempli aujourd'hui ── */}
          {!todayEntry && !loading && (
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>

              <div className="rounded-3xl p-4 mb-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
                <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Aujourd'hui</p>
                <p className="font-display text-lg font-light text-white">Comment se porte votre corps ?</p>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <ScoreSlider label="Humeur" sub="Comment vous sentez-vous ?" value={mood} onChange={setMood} labels={MOOD_LABELS} />
                <ScoreSlider label="Énergie" sub="Quel est votre niveau d'énergie ?" value={energy} onChange={setEnergy} labels={ENERGY_LABELS} />
                <ScoreSlider label="Qualité du sommeil" sub="Comment avez-vous dormi ?" value={sleep} onChange={setSleep} labels={SLEEP_LABELS} />
                <ScoreSlider label="Stress" sub="1 = très stressée, 5 = sereine" value={stress} onChange={setStress} labels={STRESS_LABELS} />
              </div>

              {/* Ressentis */}
              <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <p className="font-body text-sm font-semibold text-foreground mb-3">Ce que je ressens</p>
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
                <p className="font-body text-sm font-semibold text-foreground mb-2">Note personnelle</p>
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
                    <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Journal du jour</p>
                    <p className="font-display text-lg font-light text-white">Journée enregistrée ✓</p>
                    <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Score {todayEntry.score || Math.round(((todayEntry.mood + todayEntry.energy + todayEntry.sleep + todayEntry.stress) / 20) * 100)}/100 · Reviens demain !
                    </p>
                  </div>
                </div>
                {/* Mini scores */}
                <div className="flex gap-3 mt-4">
                  {[
                    { label: "Humeur", value: todayEntry.mood, color: "#EC4899" },
                    { label: "Énergie", value: todayEntry.energy, color: "#F59E0B" },
                    { label: "Sommeil", value: todayEntry.sleep, color: "#6366F1" },
                    { label: "Stress", value: todayEntry.stress, color: "#10B981" },
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
                    <StatCard icon={Heart}     label="Humeur moyenne"  value={weekStats.avgMood + "/5"}   color="#EC4899" sub={weekStats.avgMood >= 4 ? "Excellente forme !" : "En progression"} />
                    <StatCard icon={Flame}      label="Énergie moyenne" value={weekStats.avgEnergy + "/5"} color="#F59E0B" sub={weekStats.avgEnergy >= 4 ? "Tu es en feu !" : "Garde le rythme"} />
                    <StatCard icon={Moon}       label="Qualité sommeil" value={weekStats.avgSleep + "/5"}  color="#6366F1" sub={weekStats.avgSleep >= 4 ? "Récupération top" : "Essaie de dormir plus"} />
                    <StatCard icon={Wind}       label="Niveau de stress" value={weekStats.avgStress + "/5"} color="#10B981" sub={weekStats.avgStress >= 4 ? "Très sereine" : "Le Pilates aide !"} />
                  </div>
                </>
              )}

              {/* Graphique 7 jours */}
              {history.length >= 2 && (
                <div className="bg-card rounded-3xl p-4 border border-border shadow-sm mb-5">
                  <p className="font-body text-xs font-semibold text-foreground mb-1">Évolution du bien-être</p>
                  <p className="font-body text-[11px] text-muted-foreground mb-4">Score global sur les 14 derniers jours</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                    {history.slice(0, 14).reverse().map((e, i) => {
                      const score = e.score || Math.round(((e.mood + e.energy + e.sleep + e.stress) / 20) * 100);
                      const height = Math.max(8, (score / 100) * 80);
                      const isToday = e.entry_date === today();
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: "100%", height, backgroundColor: isToday ? "#B8973E" : (score >= 70 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444") + (isToday ? "" : "80"), borderRadius: 4, transition: "height 0.5s ease" }} />
                          <p style={{ fontSize: 8, color: "#B8B0A6" }}>
                            {new Date(e.entry_date).toLocaleDateString("fr-FR", { weekday: "narrow" })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Insights santé */}
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Tes insights personnalisés</p>
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
                  <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(184,151,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📏</div>
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
