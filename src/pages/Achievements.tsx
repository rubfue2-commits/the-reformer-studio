import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Flame, Target, Star, Award, Zap, Heart, Trophy, Crown, Sparkles, Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect } from "react";

const BADGES = [
  // ── Séances ──────────────────────────────────────────────────
  { id: "first",     icon: Star,     color: "#B8973E", bg: "#FAEEDA",
    titleFr: "Première séance",    titleEn: "First session",
    descFr: "Ta toute première séance. Le début d'une belle aventure !",
    descEn: "Your very first session. The start of a great journey!",
    threshold: 1, xp: 50 },
  { id: "ten",       icon: Target,   color: "#3B82F6", bg: "#EFF6FF",
    titleFr: "10 séances",         titleEn: "10 sessions",
    descFr: "10 séances complétées. Tu prends de bonnes habitudes !",
    descEn: "10 sessions done. You are building great habits!",
    threshold: 10, xp: 150 },
  { id: "twenty5",   icon: Award,    color: "#8B5CF6", bg: "#F5F3FF",
    titleFr: "25 séances",         titleEn: "25 sessions",
    descFr: "25 séances ! Tu es sur la bonne voie.",
    descEn: "25 sessions! You are on the right track.",
    threshold: 25, xp: 300 },
  { id: "fifty",     icon: Zap,      color: "#F59E0B", bg: "#FFFBEB",
    titleFr: "50 séances",         titleEn: "50 sessions",
    descFr: "50 séances ! Tu es une vraie pratiquante.",
    descEn: "50 sessions! You are a true practitioner.",
    threshold: 50, xp: 500 },
  { id: "hundred",   icon: Trophy,   color: "#EF4444", bg: "#FEF2F2",
    titleFr: "100 séances",        titleEn: "100 sessions",
    descFr: "100 séances ! Quelle régularité impressionnante !",
    descEn: "100 sessions! What impressive consistency!",
    threshold: 100, xp: 1000 },
  { id: "two_fifty", icon: Flame,    color: "#F97316", bg: "#FFF7ED",
    titleFr: "250 séances",        titleEn: "250 sessions",
    descFr: "250 séances ! Tu es une icône du Reformer.",
    descEn: "250 sessions! You are a Reformer icon.",
    threshold: 250, xp: 2000 },
  { id: "five_hun",  icon: Crown,    color: "#EC4899", bg: "#FDF2F8",
    titleFr: "500 séances",        titleEn: "500 sessions",
    descFr: "500 séances ! Une légende est née.",
    descEn: "500 sessions! A legend is born.",
    threshold: 500, xp: 4000 },
  { id: "thousand",  icon: Sparkles, color: "#B8973E", bg: "#FAEEDA",
    titleFr: "1000 séances",       titleEn: "1000 sessions",
    descFr: "1000 séances ! Tu es au sommet. Le Reformer n'a plus de secret pour toi.",
    descEn: "1000 sessions! You are at the top. The Reformer holds no more secrets.",
    threshold: 1000, xp: 10000 },
  // ── Séries ───────────────────────────────────────────────────
  { id: "streak7",   icon: Flame,    color: "#EF4444", bg: "#FEF2F2",
    titleFr: "7 jours de feu",     titleEn: "7-day streak",
    descFr: "7 jours consécutifs de pratique. Tu es en feu !",
    descEn: "7 consecutive days of practice. You are on fire!",
    threshold: 7, isStreak: true, xp: 200 },
  { id: "streak14",  icon: Flame,    color: "#F97316", bg: "#FFF7ED",
    titleFr: "14 jours sans pause", titleEn: "14-day streak",
    descFr: "14 jours d'affilée ! Ta régularité est exemplaire.",
    descEn: "14 days in a row! Your consistency is exemplary.",
    threshold: 14, isStreak: true, xp: 350 },
  { id: "streak30",  icon: Flame,    color: "#8B5CF6", bg: "#F5F3FF",
    titleFr: "30 jours de légende", titleEn: "30-day streak",
    descFr: "30 jours consécutifs. Tu es une machine !",
    descEn: "30 consecutive days. You are a machine!",
    threshold: 30, isStreak: true, xp: 700 },
  { id: "streak60",  icon: Crown,    color: "#EC4899", bg: "#FDF2F8",
    titleFr: "60 jours de feu",    titleEn: "60-day streak",
    descFr: "60 jours sans interruption. Discipline de championne !",
    descEn: "60 days without a break. Champion discipline!",
    threshold: 60, isStreak: true, xp: 1500 },
  // ── Bien-être ────────────────────────────────────────────────
  { id: "wellness5", icon: Heart,    color: "#EC4899", bg: "#FDF2F8",
    titleFr: "5 journaux remplis", titleEn: "5 wellness logs",
    descFr: "5 journaux bien-être complétés. Tu prends soin de toi !",
    descEn: "5 wellness logs done. You are taking care of yourself!",
    threshold: 5, isWellness: true, xp: 100 },
];

type BadgeType = typeof BADGES[number];

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<BadgeType | null>(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [wellnessCount, setWellnessCount] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    const [sessRes, wellRes] = await Promise.all([
      supabase.from("sessions").select("id, completed_at", { count: "exact" }).eq("user_id", user!.id),
      supabase.from("wellness_entries").select("id", { count: "exact" }).eq("user_id", user!.id),
    ]);
    const sessions = sessRes.count || 0;
    const wellness = wellRes.count || 0;
    setTotalSessions(sessions);
    setWellnessCount(wellness);

    // Calculer la série
    if (sessRes.data && sessRes.data.length > 0) {
      const dates = sessRes.data
        .map(s => new Date(s.completed_at).toDateString())
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const d = new Date(dates[i]);
        const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
        if (diff === i || diff === i + 1) streak++;
        else break;
      }
      setCurrentStreak(streak);
    }

    // Calculer XP total
    let xp = 0;
    BADGES.forEach(b => {
      const val = b.isStreak ? currentStreak : b.isWellness ? wellness : sessions;
      if (val >= b.threshold) xp += b.xp;
    });
    setTotalXP(xp);
  };

  const isUnlocked = (badge: BadgeType) => {
    if (badge.isStreak) return currentStreak >= badge.threshold;
    if (badge.isWellness) return wellnessCount >= badge.threshold;
    return totalSessions >= badge.threshold;
  };

  const unlockedCount = BADGES.filter(isUnlocked).length;
  const level = Math.floor(totalXP / 1000) + 1;
  const xpProgress = totalXP % 1000;

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Profil</p>
            <h1 className="font-display text-2xl font-light text-foreground">Badges & XP</h1>
          </div>
        </div>

        {/* Card stats */}
        <div className="rounded-3xl p-5 mb-5 overflow-hidden" style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-body text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Niveau</p>
              <p className="font-display text-3xl font-light" style={{ color: "#B8973E" }}>Niv. {level}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="font-body text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>XP Total</p>
              <p className="font-body text-xl font-semibold text-white">{totalXP.toLocaleString()}</p>
            </div>
          </div>
          {/* Barre XP */}
          <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 8 }}>
            <div style={{ height: "100%", backgroundColor: "#B8973E", borderRadius: 2, width: (xpProgress / 10) + "%" }} />
          </div>
          <div className="flex justify-between">
            <p className="font-body text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{xpProgress} / 1000 XP</p>
            <p className="font-body text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{unlockedCount}/{BADGES.length} badges</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Séances", value: totalSessions, icon: "⚡" },
            { label: "Série", value: currentStreak + "j", icon: "🔥" },
            { label: "Journaux", value: wellnessCount, icon: "💛" },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-2xl p-3 border border-border text-center">
              <p style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</p>
              <p className="font-body text-lg font-semibold text-foreground">{s.value}</p>
              <p className="font-body text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Grille de badges */}
        <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Mes badges</p>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge, i) => {
            const unlocked = isUnlocked(badge);
            const Icon = badge.icon;
            return (
              <motion.button key={badge.id} onClick={() => setSelected(badge)}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ backgroundColor: unlocked ? badge.bg : "#F5F3EE", borderRadius: 20, padding: "16px 12px", border: unlocked ? `1px solid ${badge.color}30` : "1px solid rgba(28,27,25,0.07)", textAlign: "center", opacity: unlocked ? 1 : 0.5 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: unlocked ? badge.color + "22" : "rgba(28,27,25,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    {unlocked ? <Icon size={22} color={badge.color} /> : <Lock size={18} color="#C4BDB5" />}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: unlocked ? "#1C1B19" : "#8B8578", lineHeight: 1.3, fontFamily: "inherit" }}>
                    {t(badge.titleFr, badge.titleEn)}
                  </p>
                  {unlocked && (
                    <p style={{ fontSize: 10, color: badge.color, fontWeight: 600, marginTop: 2, fontFamily: "inherit" }}>+{badge.xp} XP</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>

      {/* Modal badge */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ backgroundColor: "white", borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center" }}>
              <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#8B8578" }}>
                <X size={20} />
              </button>
              <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: selected.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                {isUnlocked(selected) ? <selected.icon size={32} color={selected.color} /> : <Lock size={28} color="#C4BDB5" />}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1C1B19", marginBottom: 8 }}>{t(selected.titleFr, selected.titleEn)}</h3>
              <p style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.6, marginBottom: 16 }}>{t(selected.descFr, selected.descEn)}</p>
              {isUnlocked(selected) ? (
                <div style={{ display: "inline-flex", padding: "6px 16px", backgroundColor: selected.bg, borderRadius: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: selected.color }}>+{selected.xp} XP débloqués !</p>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "#8B8578" }}>
                  {selected.isStreak ? `Série de ${selected.threshold} jours requise` : selected.isWellness ? `${selected.threshold} journaux requis` : `${selected.threshold} séances requises`}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
}
