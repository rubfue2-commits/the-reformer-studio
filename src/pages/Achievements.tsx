import { motion } from "framer-motion";
import { ChevronLeft, Flame, Target, Star, Award, Zap, Heart, Trophy, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSessions } from "@/hooks/useSessions";
import { useAuth } from "@/contexts/AuthContext";

const DEMO_EMAIL = "rubenfuentes@orange.fr";

const BADGES = [
  { id: "first",    icon: Star,     color: "#B8973E", bg: "#FAEEDA", titleFr: "Première séance",     titleEn: "First session",      descFr: "Tu as complété ta première séance !",          descEn: "You completed your first session!",       threshold: 1  },
  { id: "streak7",  icon: Flame,    color: "#EF4444", bg: "#FEF2F2", titleFr: "7 jours de suite",    titleEn: "7-day streak",       descFr: "7 jours consécutifs de pratique",              descEn: "7 consecutive days of practice",          threshold: 7, isStreak: true },
  { id: "ten",      icon: Target,   color: "#3B82F6", bg: "#EFF6FF", titleFr: "10 séances",          titleEn: "10 sessions",        descFr: "Tu as complété 10 séances au total",           descEn: "You completed 10 sessions",               threshold: 10 },
  { id: "streak14", icon: Zap,      color: "#F59E0B", bg: "#FFFBEB", titleFr: "14 jours de suite",   titleEn: "14-day streak",      descFr: "14 jours consécutifs — incroyable !",          descEn: "14 consecutive days — incredible!",       threshold: 14, isStreak: true },
  { id: "twenty5",  icon: Award,    color: "#8B5CF6", bg: "#F5F3FF", titleFr: "25 séances",          titleEn: "25 sessions",        descFr: "25 séances complétées",                        descEn: "25 sessions completed",                   threshold: 25 },
  { id: "heart",    icon: Heart,    color: "#EC4899", bg: "#FDF2F8", titleFr: "Corps en forme",      titleEn: "Fit body",           descFr: "Mesures enregistrées 5 fois",                  descEn: "Measurements recorded 5 times",           threshold: 5, isMeasurement: true },
  { id: "fifty",    icon: Trophy,   color: "#B8973E", bg: "#FAEEDA", titleFr: "50 séances",          titleEn: "50 sessions",        descFr: "50 séances — tu es une vraie athlète !",       descEn: "50 sessions — you are a true athlete!",   threshold: 50 },
  { id: "streak30", icon: Crown,    color: "#B8973E", bg: "#FAEEDA", titleFr: "30 jours de suite",   titleEn: "30-day streak",      descFr: "30 jours consécutifs — légende !",             descEn: "30 consecutive days — legend!",           threshold: 30, isStreak: true },
  { id: "hundred",  icon: Sparkles, color: "#34D399", bg: "#ECFDF5", titleFr: "100 séances",         titleEn: "100 sessions",       descFr: "100 séances — championne absolue !",           descEn: "100 sessions — absolute champion!",       threshold: 100 },
];

// Calcul XP
const calcXP = (totalSessions: number, streak: number) => totalSessions * 15 + streak * 10;
const calcLevel = (xp: number) => Math.floor(xp / 500) + 1;

export default function Achievements() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats } = useSessions();
  const isDemo = user?.email === DEMO_EMAIL;

  const totalSessions = isDemo ? 64 : stats.totalSessions;
  const streak        = isDemo ? 12 : stats.currentStreakDays;
  const xp            = isDemo ? 1525 : calcXP(totalSessions, streak);
  const level         = isDemo ? 3 : calcLevel(xp);
  const nextLevelXP   = level * 500;
  const progress      = (xp % 500) / 500;

  const earned = BADGES.filter(b => {
    if (b.isStreak) return streak >= b.threshold;
    return totalSessions >= b.threshold;
  });

  return (
    <MobileLayout>
      <div className="px-6 pt-14 pb-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">{t("Mes réussites","My achievements")}</p>
            <h1 className="font-display text-2xl font-light text-foreground">{t("Badges & XP","Badges & XP")}</h1>
          </div>
        </div>

        {/* Niveau XP */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-5 shadow-sm"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-body text-xs text-white/50 uppercase tracking-widest">{t("Niveau","Level")}</p>
              <p className="font-display text-4xl font-light text-white">{level}</p>
            </div>
            <div className="text-right">
              <p className="font-body text-xs text-white/50 uppercase tracking-widest">XP</p>
              <p className="font-display text-4xl font-light text-gold">{xp.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gold"
                initial={{ width: 0 }} animate={{ width: (progress * 100) + "%" }}
                transition={{ duration: 1, delay: 0.3 }} />
            </div>
            <p className="font-body text-xs text-white/40 flex-shrink-0">{nextLevelXP} XP</p>
          </div>
          <div className="flex gap-4 mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-gold" />
              <span className="font-body text-xs text-white">{totalSessions} {t("séances","sessions")}</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-red-400" />
              <span className="font-body text-xs text-white">{streak} {t("jours","days")}</span>
            </div>
          </div>
        </motion.div>

        {/* Badges obtenus */}
        <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-3">
          {t("Badges obtenus","Earned badges")} ({earned.length}/{BADGES.length})
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {BADGES.map((badge, i) => {
            const isEarned = earned.some(e => e.id === badge.id);
            return (
              <motion.div key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={"rounded-2xl p-3 flex flex-col items-center gap-2 border " +
                  (isEarned ? "border-transparent" : "border-border bg-muted/30")}
                style={isEarned ? { backgroundColor: badge.bg, borderColor: badge.color + "30" } : {}}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: isEarned ? badge.color + "20" : "#E5E7EB" }}>
                  <badge.icon size={20} strokeWidth={1.5}
                    style={{ color: isEarned ? badge.color : "#9CA3AF" }} />
                </div>
                <p className="font-body text-[10px] text-center leading-tight"
                  style={{ color: isEarned ? badge.color : "#9CA3AF" }}>
                  {t(badge.titleFr, badge.titleEn)}
                </p>
                {isEarned && (
                  <span className="font-body text-[9px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: badge.color + "20", color: badge.color }}>
                    ✓
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Badges à débloquer */}
        {earned.length < BADGES.length && (
          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-3">
              {t("Prochain badge","Next badge")}
            </p>
            {BADGES.filter(b => !earned.some(e => e.id === b.id)).slice(0, 1).map(badge => (
              <div key={badge.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <badge.icon size={20} strokeWidth={1.5} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-foreground">{t(badge.titleFr, badge.titleEn)}</p>
                  <p className="font-body text-xs text-muted-foreground">{t(badge.descFr, badge.descEn)}</p>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gold transition-all"
                      style={{ width: Math.min((badge.isStreak ? streak : totalSessions) / badge.threshold * 100, 100) + "%" }} />
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground mt-1">
                    {badge.isStreak ? streak : totalSessions}/{badge.threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <BottomNav />
    </MobileLayout>
  );
}
