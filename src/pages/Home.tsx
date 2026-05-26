import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Flame, TrendingUp, Award, ChevronRight, Zap, Star, BookOpen } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProfile } from "@/hooks/useProfile";
import { useSessions } from "@/hooks/useSessions";
import { useScore } from "@/hooks/useScore";

const DEMO_EMAIL = "rubenfuentes@orange.fr";

const weekData = [
  { day: "L", score: 72 }, { day: "M", score: 78 }, { day: "M", score: 65 },
  { day: "J", score: 82 }, { day: "V", score: 0 }, { day: "S", score: 0 }, { day: "D", score: 0 },
];

const recentBadges = [
  { icon: Flame,  label: `${streak} jours`,    color: "#B8973E" },
  { icon: Star,   label: `${weekSessions} séances`, color: "#A78BFA" },
];

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [monthStats, setMonthStats] = useState({ sessions: 0, minutes: 0, completion: 0, level: 1 });
  const [streak, setStreak] = useState(0);
  const [weekSessions, setWeekSessions] = useState(0);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

    const [monthRes, weekRes, allRes] = await Promise.all([
      supabase.from("sessions").select("id, duration_minutes, completed_at").eq("user_id", user!.id).gte("completed_at", startOfMonth),
      supabase.from("sessions").select("id").eq("user_id", user!.id).gte("completed_at", startOfWeek),
      supabase.from("sessions").select("completed_at").eq("user_id", user!.id).order("completed_at", { ascending: false }).limit(90),
    ]);

    const monthSessions = monthRes.data || [];
    const totalMin = monthSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    const totalH = Math.round(totalMin / 60);

    // Calcul streak
    const dates = [...new Set((allRes.data || []).map(s => new Date(s.completed_at).toDateString()))];
    let s = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const diff = Math.round((today.getTime() - new Date(dates[i]).getTime()) / 86400000);
      if (diff === i || diff === i + 1) s++;
      else break;
    }

    // Niveau XP (basé sur total sessions)
    const totalSessions = allRes.data?.length || 0;
    const lvl = Math.floor(totalSessions / 25) + 1;

    setMonthStats({
      sessions: monthSessions.length,
      minutes: totalMin,
      completion: totalSessions > 0 ? Math.min(100, Math.round((monthSessions.length / 20) * 100)) : 0,
      level: lvl,
    });
    setStreak(s);
    setWeekSessions((weekRes.data || []).length);
  };

  const { profile } = useProfile();
  const { stats } = useSessions();
  const isDemo = user?.email === DEMO_EMAIL;
  const dayScore = useScore(isDemo);

  const firstName = isDemo
    ? "Camille"
    : profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "";

  const displayStreak       = isDemo ? 12 : stats.currentStreakDays;
  const displayWeekCount    = isDemo ? 3 : stats.thisWeekCount;
  const displayTotalSessions = isDemo ? 64 : stats.totalSessions;
  const displayTotalTime    = isDemo ? "48h" : (stats.totalMinutes >= 60 ? Math.floor(stats.totalMinutes / 60) + "h" : stats.totalMinutes + "min");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("Bonjour","Good morning") : hour < 18 ? t("Bon après-midi","Good afternoon") : t("Bonsoir","Good evening");

  const circumference = 2 * Math.PI * 40;

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-5">
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">{greeting}</p>
            <h1 className="mt-0.5 font-display text-3xl font-light text-foreground">{firstName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="icon" />
            <button onClick={() => navigate("/achievements")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm">
              <Award size={18} className="text-gold" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>

        {/* ──────────────────────────────────────
            CAS 1 : Pas de journal → Rappel
        ────────────────────────────────────── */}
        {!isDemo && !dayScore.hasJournal ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-2 rounded-3xl overflow-hidden shadow-sm mb-4"
            style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
            <div className="p-5">
              {/* Icône + titre */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(184,151,62,0.2)" }}>
                  <BookOpen size={22} className="text-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-body text-[10px] text-white/40 uppercase tracking-widest">
                    {t("Score du jour","Today's score")}
                  </p>
                  <p className="font-display text-lg font-light text-white">
                    {t("Journal non rempli","Journal not filled")}
                  </p>
                </div>
              </div>

              {/* Message */}
              <p className="font-body text-sm text-white/60 leading-relaxed mb-5">
                {t(
                  "Remplis ton journal bien-être pour voir ton score du jour et recevoir une recommandation de séance personnalisée.",
                  "Fill in your wellness journal to see your daily score and get a personalized session recommendation."
                )}
              </p>

              {/* 3 critères à remplir */}
              <div className="flex gap-2 mb-5">
                {[
                  { label: t("Énergie","Energy"), color: "#B8973E" },
                  { label: t("Humeur","Mood"),    color: "#60A5FA" },
                  { label: t("Sommeil","Sleep"),  color: "#8B5CF6" },
                ].map(c => (
                  <div key={c.label} className="flex-1 rounded-xl py-2 px-1 text-center"
                    style={{ backgroundColor: c.color + "20" }}>
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: c.color }} />
                    <p className="font-body text-[9px] text-white/50">{c.label}</p>
                  </div>
                ))}
              </div>

              {/* Bouton → Journal */}
              <button
                onClick={() => navigate("/wellness")}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-body text-sm font-semibold"
                style={{ backgroundColor: "#B8973E", color: "#1C1B19" }}>
                <BookOpen size={16} strokeWidth={2} />
                {t("Remplir mon journal","Fill my journal")}
              </button>
            </div>
          </motion.div>
        ) : (
        /* ──────────────────────────────────────
            CAS 2 : Score affiché
        ────────────────────────────────────── */
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-2 overflow-hidden rounded-3xl shadow-sm"
            style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <p className="font-body text-[10px] tracking-widest uppercase text-white/50 mb-1">
                    {t("Score du jour","Today's score")}
                  </p>
                  <p className="font-body text-xs text-white/60 leading-snug">{dayScore.advice}</p>

                  {/* Détail scores */}
                  <div className="flex gap-3 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#EC4899" }} />
                      <span className="font-body text-[10px] text-white/50">
                        {t("Bien-être","Wellness")} {dayScore.wellnessScore}/60
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#60A5FA" }} />
                      <span className="font-body text-[10px] text-white/50">
                        {t("Activité","Activity")} {dayScore.activityScore}/40
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cercle score */}
                <div className="relative flex-shrink-0">
                  <svg width="88" height="88" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
                    <motion.circle cx="44" cy="44" r="40" fill="none"
                      stroke={dayScore.color} strokeWidth="6"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference - ((dayScore.score || 0) / 100) * circumference }}
                      transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                      strokeLinecap="round" transform="rotate(-90 44 44)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl font-light text-white">{dayScore.score}</span>
                    <span className="font-body text-[9px] uppercase tracking-wider"
                      style={{ color: dayScore.color }}>{dayScore.label}</span>
                  </div>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="flex gap-3 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-gold" />
                  <span className="font-body text-xs text-white">{displayStreak} {t("jours","days")}</span>
                </div>
                <div className="w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-blue-400" />
                  <span className="font-body text-xs text-white">{displayWeekCount}/7 {t("cette semaine","this week")}</span>
                </div>
              </div>
            </div>

            {/* Graphique semaine */}
            <div className="px-5 pb-1">
              <p className="font-body text-[9px] uppercase tracking-widest text-white/30 mb-2">
                {t("Score cette semaine","Score this week")}
              </p>
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={weekData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={dayScore.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={dayScore.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="score" stroke={dayScore.color}
                    strokeWidth={1.5} fill="url(#scoreGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Jours de la semaine */}
            <div className="flex justify-between px-5 pb-5 pt-2">
              {weekData.map(({ day, score }, i) => {
                const isToday = i === 3;
                const done = score > 0;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center ${
                      done ? "bg-gold/30 border border-gold/60" : isToday ? "border border-white/40" : "bg-white/5"
                    }`}>
                      {done && <div className="h-1.5 w-1.5 rounded-full bg-gold" />}
                    </div>
                    <span className={`font-body text-[9px] ${isToday ? "text-white font-medium" : "text-white/30"}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Badges récents */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {recentBadges.map(({ icon: Icon, label, color }, i) => (
              <motion.div key={label} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 300 }}
                className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-sm">
                <Icon size={11} style={{ color }} strokeWidth={2} />
                <span className="font-body text-[10px] text-foreground">{label}</span>
              </motion.div>
            ))}
          </div>
          <button onClick={() => navigate("/achievements")} className="font-body text-[10px] text-gold">
            {t("Tout voir","See all")}
          </button>
        </motion.div>

        {/* Séance recommandée */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="relative mt-4 overflow-hidden rounded-3xl bg-card shadow-sm">
          <div className="p-5">
            <span className="mb-1 block font-body text-[10px] tracking-widest uppercase text-gold">
              {t("Recommandé pour toi","Recommended for you")}
            </span>
            <h2 className="font-display text-xl font-light text-foreground">Full Body Flow</h2>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-body text-xs text-muted-foreground">45 min · {t("Intermédiaire","Intermediate")}</span>
              <span className="rounded-full bg-gold/10 px-2 py-0.5 font-body text-[10px] text-gold">{t("Tonification","Toning")}</span>
            </div>
          </div>
        </motion.div>

        {/* Bouton démarrer */}
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/library")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium tracking-wide text-primary-foreground">
          <Play size={16} fill="currentColor" />
          {t("Démarrer la séance","Start session")}
        </motion.button>

        {/* Stats du mois */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-4 mb-6 rounded-3xl bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-light text-foreground">{t("Progrès du mois","Monthly progress")}</h3>
            <button onClick={() => navigate("/wellness")} className="flex items-center gap-1 font-body text-[10px] text-gold">
              {t("Détails","Details")} <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex justify-between">
            {[
              { value: String(displayTotalSessions), label: t("Séances","Sessions") },
              { value: displayTotalTime,              label: t("Temps total","Total time") },
              { value: monthStats.completion + "%",   label: t("Complétion","Completion") },
              { value: `Niv.${monthStats.level}`,                       label: t("Niveau XP","XP Level") },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-xl text-foreground">{value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Home;
