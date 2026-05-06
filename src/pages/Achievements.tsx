import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Flame, Target, Star, Award, Zap, Heart,
  Trophy, Crown, Sparkles, Lock, X, Sun, Moon, Coffee,
  Dumbbell, Calendar, Smile, TrendingUp, Wind, Music
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/i18n/LanguageContext";

// ── Catégories ────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",       label: "Tous" },
  { id: "sessions",  label: "Séances" },
  { id: "streak",    label: "Séries" },
  { id: "wellness",  label: "Bien-être" },
  { id: "time",      label: "Horaires" },
  { id: "variety",   label: "Variété" },
  { id: "social",    label: "Communauté" },
  { id: "special",   label: "Spéciaux" },
];

// ── Badges ────────────────────────────────────────────────────
const BADGES = [

  // ════════ SÉANCES ════════════════════════════════════════════
  { id: "first",        icon: Star,       color: "#B8973E", bg: "#FAEEDA", cat: "sessions",
    titleFr: "Première séance",         titleEn: "First session",
    descFr:  "Ta toute première séance Connect Reformer. Le début d'une belle histoire !",
    descEn:  "Your very first Connect Reformer session. The start of a beautiful journey!",
    type: "sessions", threshold: 1,    xp: 50 },
  { id: "ten",          icon: Target,     color: "#3B82F6", bg: "#EFF6FF", cat: "sessions",
    titleFr: "10 séances",              titleEn: "10 sessions",
    descFr:  "10 séances complétées. La régularité commence ici !",
    descEn:  "10 sessions done. Consistency starts here!",
    type: "sessions", threshold: 10,   xp: 150 },
  { id: "twenty5",      icon: Award,      color: "#8B5CF6", bg: "#F5F3FF", cat: "sessions",
    titleFr: "25 séances",              titleEn: "25 sessions",
    descFr:  "25 séances ! Le Reformer devient une habitude.",
    descEn:  "25 sessions! The Reformer is becoming a habit.",
    type: "sessions", threshold: 25,   xp: 300 },
  { id: "fifty",        icon: Zap,        color: "#F59E0B", bg: "#FFFBEB", cat: "sessions",
    titleFr: "50 séances",              titleEn: "50 sessions",
    descFr:  "50 séances ! Tu es une vraie pratiquante.",
    descEn:  "50 sessions! You are a true practitioner.",
    type: "sessions", threshold: 50,   xp: 500 },
  { id: "hundred",      icon: Trophy,     color: "#EF4444", bg: "#FEF2F2", cat: "sessions",
    titleFr: "100 séances",             titleEn: "100 sessions",
    descFr:  "100 séances ! Quelle régularité impressionnante !",
    descEn:  "100 sessions! What impressive consistency!",
    type: "sessions", threshold: 100,  xp: 1000 },
  { id: "two_fifty",    icon: Flame,      color: "#F97316", bg: "#FFF7ED", cat: "sessions",
    titleFr: "250 séances",             titleEn: "250 sessions",
    descFr:  "250 séances ! Tu es une icône du Reformer.",
    descEn:  "250 sessions! You are a Reformer icon.",
    type: "sessions", threshold: 250,  xp: 2000 },
  { id: "five_hun",     icon: Crown,      color: "#EC4899", bg: "#FDF2F8", cat: "sessions",
    titleFr: "500 séances",             titleEn: "500 sessions",
    descFr:  "500 séances ! Une légende est née.",
    descEn:  "500 sessions! A legend is born.",
    type: "sessions", threshold: 500,  xp: 4000 },
  { id: "thousand",     icon: Sparkles,   color: "#B8973E", bg: "#FAEEDA", cat: "sessions",
    titleFr: "1000 séances",            titleEn: "1000 sessions",
    descFr:  "1000 séances ! Le Reformer n'a plus de secret pour toi. Tu es une légende.",
    descEn:  "1000 sessions! The Reformer holds no more secrets. You are a legend.",
    type: "sessions", threshold: 1000, xp: 10000 },

  // ════════ SÉRIES ══════════════════════════════════════════════
  { id: "streak3",      icon: Flame,      color: "#F97316", bg: "#FFF7ED", cat: "streak",
    titleFr: "3 jours d'affilée",       titleEn: "3-day streak",
    descFr:  "3 jours consécutifs ! L'élan est là.",
    descEn:  "3 days in a row! The momentum is here.",
    type: "streak", threshold: 3,  xp: 80 },
  { id: "streak7",      icon: Flame,      color: "#EF4444", bg: "#FEF2F2", cat: "streak",
    titleFr: "7 jours de feu",          titleEn: "7-day streak",
    descFr:  "Une semaine complète ! Tu es en feu.",
    descEn:  "A full week! You are on fire.",
    type: "streak", threshold: 7,  xp: 200 },
  { id: "streak14",     icon: Flame,      color: "#DC2626", bg: "#FEF2F2", cat: "streak",
    titleFr: "14 jours sans pause",     titleEn: "14-day streak",
    descFr:  "2 semaines d'affilée ! Ta régularité est exemplaire.",
    descEn:  "2 weeks in a row! Your consistency is exemplary.",
    type: "streak", threshold: 14, xp: 350 },
  { id: "streak30",     icon: Crown,      color: "#8B5CF6", bg: "#F5F3FF", cat: "streak",
    titleFr: "30 jours de légende",     titleEn: "30-day streak",
    descFr:  "Un mois entier ! Tu es une machine.",
    descEn:  "A whole month! You are a machine.",
    type: "streak", threshold: 30, xp: 700 },
  { id: "streak60",     icon: Sparkles,   color: "#EC4899", bg: "#FDF2F8", cat: "streak",
    titleFr: "60 jours invincible",     titleEn: "60-day streak",
    descFr:  "60 jours sans interruption. Discipline de championne !",
    descEn:  "60 days without a break. Champion discipline!",
    type: "streak", threshold: 60, xp: 1500 },
  { id: "streak100",    icon: Trophy,     color: "#B8973E", bg: "#FAEEDA", cat: "streak",
    titleFr: "100 jours — Élite",       titleEn: "100-day streak — Elite",
    descFr:  "100 jours de suite. Tu appartiens à une élite rarissime.",
    descEn:  "100 days straight. You belong to a very rare elite.",
    type: "streak", threshold: 100, xp: 5000 },

  // ════════ BIEN-ÊTRE ═══════════════════════════════════════════
  { id: "wellness1",    icon: Heart,      color: "#EC4899", bg: "#FDF2F8", cat: "wellness",
    titleFr: "Premier journal",         titleEn: "First wellness log",
    descFr:  "Premier journal bien-être rempli. Tu prends soin de toi !",
    descEn:  "First wellness log done. You are taking care of yourself!",
    type: "wellness", threshold: 1,   xp: 30 },
  { id: "wellness10",   icon: Smile,      color: "#EC4899", bg: "#FDF2F8", cat: "wellness",
    titleFr: "10 journaux remplis",     titleEn: "10 wellness logs",
    descFr:  "10 journaux complétés. Écouter son corps, c'est un art.",
    descEn:  "10 logs done. Listening to your body is an art.",
    type: "wellness", threshold: 10,  xp: 150 },
  { id: "wellness30",   icon: Heart,      color: "#F43F5E", bg: "#FFF1F2", cat: "wellness",
    titleFr: "30 journaux — Équilibre", titleEn: "30 wellness logs",
    descFr:  "30 journaux ! Tu maîtrises ton équilibre corps-esprit.",
    descEn:  "30 logs! You master your body-mind balance.",
    type: "wellness", threshold: 30,  xp: 400 },
  { id: "wellness_perfect", icon: Star,   color: "#B8973E", bg: "#FAEEDA", cat: "wellness",
    titleFr: "Score parfait",           titleEn: "Perfect score",
    descFr:  "Un score de 100/100 dans la journée ! Ton corps est au top.",
    descEn:  "A score of 100/100 in a day! Your body is at its best.",
    type: "perfect_score", threshold: 1, xp: 300 },
  { id: "measurements",  icon: TrendingUp, color: "#10B981", bg: "#ECFDF5", cat: "wellness",
    titleFr: "Premières mesures",       titleEn: "First measurements",
    descFr:  "Premières mensurations enregistrées. Ton évolution commence !",
    descEn:  "First measurements recorded. Your transformation begins!",
    type: "measurements", threshold: 1, xp: 100 },

  // ════════ HORAIRES ════════════════════════════════════════════
  { id: "early_bird",   icon: Sun,        color: "#F59E0B", bg: "#FFFBEB", cat: "time",
    titleFr: "Lève-tôt",                titleEn: "Early bird",
    descFr:  "5 séances avant 7h du matin. Tu attaques la journée en force !",
    descEn:  "5 sessions before 7am. You start the day strong!",
    type: "early_bird", threshold: 5,  xp: 250 },
  { id: "night_owl",    icon: Moon,       color: "#6366F1", bg: "#EEF2FF", cat: "time",
    titleFr: "Oiseau de nuit",          titleEn: "Night owl",
    descFr:  "5 séances après 21h. Tu sculpts ta silhouette même le soir.",
    descEn:  "5 sessions after 9pm. You sculpt your figure even at night.",
    type: "night_owl", threshold: 5,   xp: 250 },
  { id: "lunch_break",  icon: Coffee,     color: "#92400E", bg: "#FEF3C7", cat: "time",
    titleFr: "Pause méridienne",        titleEn: "Lunch break",
    descFr:  "5 séances entre 12h et 14h. La pause déjeuner Pilates !",
    descEn:  "5 sessions between 12pm and 2pm. The Pilates lunch break!",
    type: "lunch_break", threshold: 5, xp: 200 },
  { id: "weekend_w",    icon: Calendar,   color: "#059669", bg: "#ECFDF5", cat: "time",
    titleFr: "Guerrière du week-end",   titleEn: "Weekend warrior",
    descFr:  "10 séances le week-end. Tu ne t'accordes aucun répit !",
    descEn:  "10 weekend sessions. You give yourself no rest!",
    type: "weekend", threshold: 10,    xp: 300 },

  // ════════ VARIÉTÉ ═════════════════════════════════════════════
  { id: "explorer",     icon: Wind,       color: "#0EA5E9", bg: "#F0F9FF", cat: "variety",
    titleFr: "Exploratrice",            titleEn: "Explorer",
    descFr:  "Tu as essayé 5 types de cours différents. La curiosité paie !",
    descEn:  "You tried 5 different class types. Curiosity pays off!",
    type: "variety", threshold: 5,     xp: 350 },
  { id: "all_rounder",  icon: Dumbbell,   color: "#7C3AED", bg: "#F5F3FF", cat: "variety",
    titleFr: "Complète",                titleEn: "All-rounder",
    descFr:  "Tu as fait tous les types de cours ! Rien ne t'arrête.",
    descEn:  "You tried every class type! Nothing stops you.",
    type: "variety", threshold: 9,     xp: 800 },
  { id: "program_done", icon: Award,      color: "#059669", bg: "#ECFDF5", cat: "variety",
    titleFr: "Programme complété",      titleEn: "Program completed",
    descFr:  "Tu as terminé ton premier programme. Quelle réussite !",
    descEn:  "You completed your first program. What an achievement!",
    type: "program", threshold: 1,     xp: 500 },
  { id: "long_session", icon: Zap,        color: "#F97316", bg: "#FFF7ED", cat: "variety",
    titleFr: "Endurance",               titleEn: "Endurance",
    descFr:  "5 séances de 50 minutes ou plus. Tu repousses tes limites !",
    descEn:  "5 sessions of 50 minutes or more. You push your limits!",
    type: "long_session", threshold: 5, xp: 400 },

  // ════════ COMMUNAUTÉ ══════════════════════════════════════════
  { id: "first_referral", icon: Sparkles, color: "#EC4899", bg: "#FDF2F8", cat: "social",
    titleFr: "Première marraine",       titleEn: "First referral",
    descFr:  "Tu as parrainé ta première amie ! L'aventure se partage.",
    descEn:  "You referred your first friend! The journey is shared.",
    type: "referral", threshold: 1,    xp: 200 },
  { id: "referral3",    icon: Crown,      color: "#B8973E", bg: "#FAEEDA", cat: "social",
    titleFr: "Trio de marraines",       titleEn: "Triple referral",
    descFr:  "3 amies parrainées ! Tu es une véritable ambassadrice.",
    descEn:  "3 friends referred! You are a true ambassador.",
    type: "referral", threshold: 3,    xp: 600 },
  { id: "reviewer",     icon: Star,       color: "#F59E0B", bg: "#FFFBEB", cat: "social",
    titleFr: "Critique d'élite",        titleEn: "Elite reviewer",
    descFr:  "Tu as donné ton avis sur 5 séances. Ta voix compte !",
    descEn:  "You reviewed 5 sessions. Your voice matters!",
    type: "reviews", threshold: 5,     xp: 150 },

  // ════════ SPÉCIAUX ════════════════════════════════════════════
  { id: "comeback",     icon: TrendingUp, color: "#10B981", bg: "#ECFDF5", cat: "special",
    titleFr: "Le grand retour",         titleEn: "The comeback",
    descFr:  "Tu es revenue après 2 semaines d'absence. Bravo le courage !",
    descEn:  "You came back after 2 weeks away. What courage!",
    type: "comeback", threshold: 1,    xp: 200 },
  { id: "anniversary",  icon: Music,      color: "#B8973E", bg: "#FAEEDA", cat: "special",
    titleFr: "1 an de Reformer",        titleEn: "1 year of Reformer",
    descFr:  "Un an avec Connect Reformer ! Tu fais partie de la famille.",
    descEn:  "One year with Connect Reformer! You are part of the family.",
    type: "anniversary", threshold: 365, xp: 3000 },
  { id: "perfect_week", icon: Trophy,     color: "#8B5CF6", bg: "#F5F3FF", cat: "special",
    titleFr: "Semaine parfaite",        titleEn: "Perfect week",
    descFr:  "7 séances en 7 jours ! Une semaine sans faille.",
    descEn:  "7 sessions in 7 days! A flawless week.",
    type: "perfect_week", threshold: 7, xp: 1000 },
  { id: "double_day",   icon: Zap,        color: "#EF4444", bg: "#FEF2F2", cat: "special",
    titleFr: "Double dose",             titleEn: "Double session",
    descFr:  "2 séances dans la même journée ! Tu es insatiable.",
    descEn:  "2 sessions in one day! You are unstoppable.",
    type: "double_day", threshold: 1,   xp: 300 },
];

type BadgeData = typeof BADGES[number];

// ── Stats utilisateur ─────────────────────────────────────────
interface UserStats {
  sessions: number;
  streak: number;
  wellness: number;
  measurements: number;
  referrals: number;
  reviews: number;
  varietyTypes: number;
  earlyBird: number;
  nightOwl: number;
  lunchBreak: number;
  weekendSessions: number;
  longSessions: number;
  programsDone: number;
  perfectScore: number;
  comeback: number;
  perfectWeek: number;
  doubleDay: number;
  daysOnApp: number;
}

export default function Achievements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<BadgeData | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [stats, setStats] = useState<UserStats>({
    sessions: 0, streak: 0, wellness: 0, measurements: 0,
    referrals: 0, reviews: 0, varietyTypes: 0,
    earlyBird: 0, nightOwl: 0, lunchBreak: 0, weekendSessions: 0,
    longSessions: 0, programsDone: 0, perfectScore: 0,
    comeback: 0, perfectWeek: 0, doubleDay: 0, daysOnApp: 0,
  });

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    const [sessRes, wellRes, measRes, refRes, revRes, progRes] = await Promise.all([
      supabase.from("sessions").select("id, completed_at, duration_minutes, category").eq("user_id", user!.id),
      supabase.from("wellness_entries").select("id, score", { count: "exact" }).eq("user_id", user!.id),
      supabase.from("measurements").select("id", { count: "exact" }).eq("user_id", user!.id),
      supabase.from("referrals").select("id", { count: "exact" }).eq("referrer_id", user!.id),
      supabase.from("program_reviews").select("id", { count: "exact" }).eq("user_id", user!.id),
      supabase.from("user_program_progress").select("id", { count: "exact" }).eq("user_id", user!.id).eq("is_completed", true),
    ]);

    const sessions = sessRes.data || [];
    const total = sessions.length;

    // Calcul série
    const dates = [...new Set(sessions.map(s => new Date(s.completed_at).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const diff = Math.round((today.getTime() - new Date(dates[i]).getTime()) / 86400000);
      if (diff === i || diff === i + 1) streak++;
      else break;
    }

    // Horaires
    let earlyBird = 0, nightOwl = 0, lunchBreak = 0, weekendSessions = 0;
    let longSessions = 0, doubleDay = 0;
    const dayCounts: Record<string, number> = {};

    sessions.forEach(s => {
      const d = new Date(s.completed_at);
      const h = d.getHours();
      const dow = d.getDay();
      const dateKey = d.toDateString();
      if (h < 7) earlyBird++;
      if (h >= 21) nightOwl++;
      if (h >= 12 && h < 14) lunchBreak++;
      if (dow === 0 || dow === 6) weekendSessions++;
      if ((s.duration_minutes || 0) >= 50) longSessions++;
      dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
    });
    const doubleDays = Object.values(dayCounts).filter(c => c >= 2).length;

    // Variété de cours
    const categories = new Set(sessions.map(s => s.category).filter(Boolean));

    // Semaine parfaite (7 séances en 7 jours consécutifs)
    let perfectWeek = 0;
    for (let i = 0; i <= dates.length - 7; i++) {
      const window7 = dates.slice(i, i + 7);
      if (window7.length === 7) {
        const first = new Date(window7[6]).getTime();
        const last = new Date(window7[0]).getTime();
        if ((last - first) / 86400000 <= 6) { perfectWeek = 1; break; }
      }
    }

    // 1 an sur l'app
    const { data: profileData } = await supabase.from("profiles").select("created_at").eq("id", user!.id).single();
    const daysOnApp = profileData ? Math.floor((Date.now() - new Date(profileData.created_at).getTime()) / 86400000) : 0;

    setStats({
      sessions: total, streak, wellness: wellRes.count || 0,
      measurements: measRes.count || 0, referrals: refRes.count || 0,
      reviews: revRes.count || 0, varietyTypes: categories.size,
      earlyBird, nightOwl, lunchBreak, weekendSessions,
      longSessions, programsDone: progRes.count || 0,
      perfectScore: 0, comeback: 0,
      perfectWeek, doubleDay: doubleDays, daysOnApp,
    });
  };

  const getStatValue = (badge: BadgeData): number => {
    switch (badge.type) {
      case "sessions":    return stats.sessions;
      case "streak":      return stats.streak;
      case "wellness":    return stats.wellness;
      case "measurements":return stats.measurements;
      case "referral":    return stats.referrals;
      case "reviews":     return stats.reviews;
      case "variety":     return stats.varietyTypes;
      case "early_bird":  return stats.earlyBird;
      case "night_owl":   return stats.nightOwl;
      case "lunch_break": return stats.lunchBreak;
      case "weekend":     return stats.weekendSessions;
      case "long_session":return stats.longSessions;
      case "program":     return stats.programsDone;
      case "perfect_week":return stats.perfectWeek;
      case "double_day":  return stats.doubleDay;
      case "anniversary": return stats.daysOnApp;
      default:            return 0;
    }
  };

  const isUnlocked = (badge: BadgeData) => getStatValue(badge) >= badge.threshold;

  const filteredBadges = activeCategory === "all"
    ? BADGES
    : BADGES.filter(b => b.cat === activeCategory);

  const unlockedCount = BADGES.filter(isUnlocked).length;
  const totalXP = BADGES.filter(isUnlocked).reduce((sum, b) => sum + b.xp, 0);
  const level = Math.floor(totalXP / 1000) + 1;
  const xpProgress = totalXP % 1000;

  return (
    <MobileLayout>
      <div className="pt-12 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 px-5">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Profil</p>
            <h1 className="font-display text-2xl font-light text-foreground">Badges & XP</h1>
          </div>
        </div>

        {/* Card niveau */}
        <div className="mx-5 rounded-3xl p-5 mb-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Niveau</p>
              <p className="font-display text-3xl font-light" style={{ color: "#B8973E" }}>Niv. {level}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>XP Total</p>
              <p className="font-body text-xl font-semibold text-white">{totalXP.toLocaleString()} XP</p>
            </div>
          </div>
          <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, marginBottom: 6 }}>
            <div style={{ height: "100%", backgroundColor: "#B8973E", borderRadius: 2, width: (xpProgress / 10) + "%", transition: "width 0.6s ease" }} />
          </div>
          <div className="flex justify-between">
            <p className="font-body text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{xpProgress} / 1000 XP → Niv. {level + 1}</p>
            <p className="font-body text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{unlockedCount}/{BADGES.length} badges</p>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="flex gap-2 px-5 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { label: "Séances", value: stats.sessions, icon: "⚡" },
            { label: "Série",   value: stats.streak + "j", icon: "🔥" },
            { label: "Journaux", value: stats.wellness, icon: "💛" },
            { label: "Parrainages", value: stats.referrals, icon: "✨" },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border flex-shrink-0" style={{ padding: "10px 14px", textAlign: "center", minWidth: 72 }}>
              <p style={{ fontSize: 18, marginBottom: 1 }}>{s.icon}</p>
              <p className="font-body text-base font-semibold text-foreground">{s.value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtres catégories */}
        <div className="mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 px-5" style={{ width: "max-content" }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className="font-body text-xs font-medium px-4 py-1.5 rounded-full whitespace-nowrap transition-all"
                style={{ backgroundColor: activeCategory === cat.id ? "#1C1B19" : "rgba(28,27,25,0.07)", color: activeCategory === cat.id ? "#FDFAF7" : "#6B6560", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grille de badges */}
        <div className="grid grid-cols-3 gap-3 px-5">
          {filteredBadges.map((badge, i) => {
            const unlocked = isUnlocked(badge);
            const val = getStatValue(badge);
            const progress = Math.min(100, Math.round((val / badge.threshold) * 100));
            const Icon = badge.icon;
            return (
              <motion.button key={badge.id} onClick={() => setSelected(badge)}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ backgroundColor: unlocked ? badge.bg : "#F5F3EE", borderRadius: 20, padding: "14px 10px", border: unlocked ? `1.5px solid ${badge.color}30` : "1px solid rgba(28,27,25,0.07)", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  {/* Barre de progression en fond */}
                  {!unlocked && progress > 0 && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: progress + "%", backgroundColor: badge.color, opacity: 0.5, borderRadius: "0 0 0 20px" }} />
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: unlocked ? badge.color + "22" : "rgba(28,27,25,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    {unlocked ? <Icon size={22} color={badge.color} /> : <Lock size={16} color="#C4BDB5" />}
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: unlocked ? "#1C1B19" : "#8B8578", lineHeight: 1.3, fontFamily: "inherit", marginBottom: 2 }}>
                    {t(badge.titleFr, badge.titleEn)}
                  </p>
                  {unlocked ? (
                    <p style={{ fontSize: 9, color: badge.color, fontWeight: 700, fontFamily: "inherit" }}>+{badge.xp} XP</p>
                  ) : (
                    <p style={{ fontSize: 9, color: "#B8B0A6", fontFamily: "inherit" }}>{val}/{badge.threshold}</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
        <div style={{ height: 16 }} />
      </div>

      {/* Modal badge */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ backgroundColor: "white", borderRadius: 28, padding: "32px 24px", width: "100%", maxWidth: 320, textAlign: "center", position: "relative" }}>
              <button onClick={() => setSelected(null)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#8B8578" }}>
                <X size={20} />
              </button>
              <div style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: selected.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                {isUnlocked(selected) ? <selected.icon size={36} color={selected.color} /> : <Lock size={30} color="#C4BDB5" />}
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: selected.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                {CATEGORIES.find(c => c.id === selected.cat)?.label}
              </p>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1C1B19", marginBottom: 10 }}>
                {t(selected.titleFr, selected.titleEn)}
              </h3>
              <p style={{ fontSize: 13, color: "#6B6560", lineHeight: 1.65, marginBottom: 20 }}>
                {t(selected.descFr, selected.descEn)}
              </p>
              {isUnlocked(selected) ? (
                <div style={{ display: "inline-flex", padding: "8px 20px", backgroundColor: selected.bg, borderRadius: 24, border: `1px solid ${selected.color}30` }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: selected.color }}>+{selected.xp} XP débloqués ✓</p>
                </div>
              ) : (
                <div style={{ backgroundColor: "#F5F3EE", borderRadius: 14, padding: "12px 16px" }}>
                  <p style={{ fontSize: 12, color: "#6B6560", marginBottom: 6 }}>Progression</p>
                  <div style={{ height: 6, backgroundColor: "#E8E4DE", borderRadius: 3, marginBottom: 6 }}>
                    <div style={{ height: "100%", backgroundColor: selected.color, borderRadius: 3, width: Math.min(100, Math.round((getStatValue(selected) / selected.threshold) * 100)) + "%" }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1B19" }}>
                    {getStatValue(selected)} / {selected.threshold}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
}
