import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Flame, TrendingUp, Award, ChevronRight, Zap, Target, Star } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageContext";

const weekData = [
  { day: "L", sessions: 1, score: 72 },
  { day: "M", sessions: 1, score: 78 },
  { day: "M", sessions: 1, score: 65 },
  { day: "J", sessions: 0, score: 82 },
  { day: "V", sessions: 0, score: 0 },
  { day: "S", sessions: 0, score: 0 },
  { day: "D", sessions: 0, score: 0 },
];

const recentBadges = [
  { icon: Flame, label: "7 jours", color: "#B8973E" },
  { icon: Target, label: "Objectif", color: "#60A5FA" },
  { icon: Star, label: "10 séances", color: "#A78BFA" },
];

const SCORE = 82;

const getScoreColor = (score: number) => {
  if (score >= 80) return "#4CAF50";
  if (score >= 60) return "#B8973E";
  return "#EF4444";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Optimal";
  if (score >= 60) return "Bon";
  return "À améliorer";
};

const getScoreAdvice = (score: number) => {
  if (score >= 80) return "Ton corps est prêt. C'est le bon moment pour une séance intense.";
  if (score >= 60) return "Bonne forme générale. Une séance modérée sera idéale aujourd'hui.";
  return "Pense à récupérer. Une séance douce ou du repos s'impose.";
};

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("home.good_morning") : hour < 18 ? t("home.good_afternoon") : t("home.good_evening");
  const scoreColor = getScoreColor(SCORE);
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (SCORE / 100) * circumference;
  const completedDays = weekData.filter(d => d.sessions > 0).length;

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header avec logo */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-5">
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">{greeting}</p>
            <h1 className="mt-0.5 font-display text-3xl font-light text-foreground">Camille</h1>
          </div>
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="icon" />
            <button onClick={() => navigate("/achievements")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm">
              <Award size={18} className="text-gold" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>

        {/* Score du jour */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-2 overflow-hidden rounded-3xl shadow-sm"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-body text-[10px] tracking-widest uppercase text-white/50">Score du jour</p>
                <p className="font-body text-xs text-white/70 mt-0.5">{getScoreAdvice(SCORE)}</p>
              </div>
              <div className="relative flex-shrink-0">
                <svg width="88" height="88" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
                  <motion.circle cx="44" cy="44" r="40" fill="none"
                    stroke={scoreColor} strokeWidth="6"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                    strokeLinecap="round" transform="rotate(-90 44 44)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-light text-white">{SCORE}</span>
                  <span className="font-body text-[8px] uppercase tracking-wider" style={{ color: scoreColor }}>
                    {getScoreLabel(SCORE)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-gold" />
                <span className="font-body text-xs text-white">12 {t("home.streak")}</span>
              </div>
              <div className="w-[0.5px] bg-white/10" />
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-blue-400" />
                <span className="font-body text-xs text-white">{completedDays}/7 {t("Cette semaine", "this week")}</span>
              </div>
              <div className="w-[0.5px] bg-white/10" />
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-400" />
                <span className="font-body text-xs text-white">-2.2 kg</span>
              </div>
            </div>
          </div>

          <div className="px-5 pb-1">
            <p className="font-body text-[9px] uppercase tracking-widest text-white/30 mb-2">{t("Score cette semaine", "Score this week")}</p>
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={weekData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={scoreColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={scoreColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="score" stroke={scoreColor} strokeWidth={1.5}
                  fill="url(#scoreGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between px-5 pb-5 pt-2">
            {weekData.map(({ day, sessions }, i) => {
              const isToday = i === 3;
              const done = sessions > 0;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center ${
                    done ? "bg-gold/30 border border-gold/60" :
                    isToday ? "border border-white/40" : "bg-white/5"
                  }`}>
                    {done && <div className="h-1.5 w-1.5 rounded-full bg-gold" />}
                  </div>
                  <span className={`font-body text-[9px] ${isToday ? "text-white font-medium" : "text-white/30"}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

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
          <button onClick={() => navigate("/achievements")}
            className="font-body text-[10px] text-gold">{t("Tout voir", "View all")}</button>
        </motion.div>

        {/* Séance recommandée */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="relative mt-4 overflow-hidden rounded-3xl bg-card shadow-sm">
          <div className="p-5">
            <span className="mb-1 block font-body text-[10px] tracking-widest uppercase text-gold">
              {t("Recommandé", "Recommended")}
            </span>
            <h2 className="font-display text-xl font-light text-foreground">Full Body Flow</h2>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-body text-xs text-muted-foreground">45 min · {t("Intermédiaire", "Intermediate")}</span>
              <span className="rounded-full bg-gold/10 px-2 py-0.5 font-body text-[10px] text-gold">{t("Tonification", "Toning")}</span>
            </div>
          </div>
        </motion.div>

        {/* Bouton démarrer */}
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium tracking-wide text-primary-foreground">
          <Play size={16} fill="currentColor" />
          {t("home.start_now")}
        </motion.button>

        {/* Progrès du mois */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-4 mb-6 rounded-3xl bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-light text-foreground">{t("Progrès du mois", "Monthly progress")}</h3>
            <button onClick={() => navigate("/progress")}
              className="flex items-center gap-1 font-body text-[10px] text-gold">
              {t("Détails", "Details")} <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex justify-between">
            {[
              { value: "24", label: t("home.sessions") },
              { value: "18h", label: t("Temps total", "Total time") },
              { value: "92%", label: t("Complétion", "Completion") },
              { value: "Niv.3", label: "Niveau XP" },
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
