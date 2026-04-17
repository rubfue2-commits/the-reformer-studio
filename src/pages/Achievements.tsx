import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lock, Star, Flame, Trophy, Zap, Heart, Target, Clock, Calendar, TrendingUp, Award, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

type Category = "all" | "pratique" | "progression" | "regularite" | "special";

interface Badge {
  id: string;
  icon: any;
  name: string;
  desc: string;
  category: Category;
  achieved: boolean;
  achievedDate?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xp: number;
  progress?: number;
  target?: number;
}

const rarityConfig = {
  common:    { label: "Commun",    bg: "#F1EFE8", border: "#B4B2A9", color: "#444441", glow: "#88878020" },
  rare:      { label: "Rare",      bg: "#E6F1FB", border: "#85B7EB", color: "#0C447C", glow: "#378ADD30" },
  epic:      { label: "Épique",    bg: "#EEEDFE", border: "#AFA9EC", color: "#3C3489", glow: "#7F77DD30" },
  legendary: { label: "Légendaire",bg: "#FAEEDA", border: "#EF9F27", color: "#633806", glow: "#B8973E40" },
};

const badges: Badge[] = [
  { id: "first_session",   icon: Star,      name: "Premier pas",       desc: "Compléter ta 1re séance",         category: "pratique",    achieved: true,  achievedDate: "15 jan 2026", rarity: "common",    xp: 50  },
  { id: "sessions_5",      icon: Zap,       name: "En route",          desc: "5 séances complétées",            category: "pratique",    achieved: true,  achievedDate: "25 jan 2026", rarity: "common",    xp: 100 },
  { id: "sessions_10",     icon: Flame,     name: "Sur les rails",     desc: "10 séances complétées",           category: "pratique",    achieved: true,  achievedDate: "5 fév 2026",  rarity: "rare",      xp: 200 },
  { id: "sessions_25",     icon: Trophy,    name: "Pilates addict",    desc: "25 séances complétées",           category: "pratique",    achieved: false, rarity: "epic",      xp: 500,  progress: 24, target: 25 },
  { id: "sessions_50",     icon: Crown,     name: "Maîtresse du Reformer", desc: "50 séances complétées",       category: "pratique",    achieved: false, rarity: "legendary", xp: 1000, progress: 24, target: 50 },
  { id: "streak_3",        icon: Flame,     name: "3 jours d'affilée", desc: "Pratiquer 3 jours consécutifs",  category: "regularite",  achieved: true,  achievedDate: "20 jan 2026", rarity: "common",    xp: 75  },
  { id: "streak_7",        icon: Flame,     name: "Une semaine",       desc: "7 jours consécutifs",             category: "regularite",  achieved: true,  achievedDate: "28 jan 2026", rarity: "rare",      xp: 200 },
  { id: "streak_14",       icon: Flame,     name: "Deux semaines",     desc: "14 jours consécutifs",            category: "regularite",  achieved: false, rarity: "epic",      xp: 400,  progress: 12, target: 14 },
  { id: "streak_30",       icon: Crown,     name: "Le mois entier",    desc: "30 jours consécutifs",            category: "regularite",  achieved: false, rarity: "legendary", xp: 800,  progress: 12, target: 30 },
  { id: "weight_1kg",      icon: TrendingUp,name: "Première victoire", desc: "Perdre 1 kg depuis le début",     category: "progression", achieved: true,  achievedDate: "1 fév 2026",  rarity: "rare",      xp: 300 },
  { id: "weight_2kg",      icon: TrendingUp,name: "Belle progression", desc: "Perdre 2 kg depuis le début",     category: "progression", achieved: false, rarity: "epic",      xp: 600,  progress: 1.8, target: 2 },
  { id: "time_1h",         icon: Clock,     name: "1 heure pratiquée", desc: "Cumuler 1h de pratique",          category: "progression", achieved: true,  achievedDate: "22 jan 2026", rarity: "common",    xp: 50  },
  { id: "time_10h",        icon: Clock,     name: "10 heures",         desc: "Cumuler 10h de pratique",         category: "progression", achieved: true,  achievedDate: "3 fév 2026",  rarity: "rare",      xp: 250 },
  { id: "time_50h",        icon: Clock,     name: "50 heures",         desc: "Cumuler 50h de pratique",         category: "progression", achieved: false, rarity: "epic",      xp: 700,  progress: 18, target: 50 },
  { id: "goal_complete",   icon: Target,    name: "Objectif atteint",  desc: "Atteindre ton objectif du mois",  category: "special",     achieved: true,  achievedDate: "28 jan 2026", rarity: "epic",      xp: 500 },
  { id: "early_bird",      icon: Calendar,  name: "Lève-tôt",          desc: "Faire 5 séances avant 8h",        category: "special",     achieved: false, rarity: "rare",      xp: 200,  progress: 3, target: 5  },
  { id: "weekend_warrior", icon: Heart,     name: "Weekend warrior",   desc: "Pratiquer 4 weekends de suite",   category: "special",     achieved: false, rarity: "epic",      xp: 350,  progress: 2, target: 4  },
  { id: "perfectionist",   icon: Sparkles,  name: "Perfectionniste",   desc: "100% de complétion sur 1 mois",   category: "special",     achieved: false, rarity: "legendary", xp: 1000, progress: 92, target: 100 },
];

const categories: { id: Category; label: string }[] = [
  { id: "all",         label: "Tous" },
  { id: "pratique",    label: "Pratique" },
  { id: "regularite",  label: "Régularité" },
  { id: "progression", label: "Progression" },
  { id: "special",     label: "Spécial" },
];

const Achievements = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filtered = activeCategory === "all" ? badges : badges.filter(b => b.category === activeCategory);
  const achievedCount = badges.filter(b => b.achieved).length;
  const totalXP = badges.filter(b => b.achieved).reduce((acc, b) => acc + b.xp, 0);
  const level = Math.floor(totalXP / 500) + 1;
  const xpToNextLevel = 500 - (totalXP % 500);

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/profile")} className="rounded-full p-2 hover:bg-card text-muted-foreground">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-light text-foreground">Badges & Achievements</h1>
            <p className="font-body text-xs text-muted-foreground">{achievedCount}/{badges.length} obtenus</p>
          </div>
        </motion.div>

        {/* Niveau & XP */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl bg-card p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20">
                <Award size={22} className="text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Niveau actuel</p>
                <p className="font-display text-2xl text-foreground">Niveau {level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl text-gold">{totalXP.toLocaleString()}</p>
              <p className="font-body text-[10px] text-muted-foreground">XP totaux</p>
            </div>
          </div>
          <div className="mb-1 flex justify-between">
            <span className="font-body text-[10px] text-muted-foreground">Niveau {level}</span>
            <span className="font-body text-[10px] text-muted-foreground">+{xpToNextLevel} XP → Niveau {level + 1}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${((500 - xpToNextLevel) / 500) * 100}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Stats rapides */}
          <div className="mt-4 flex justify-around border-t border-border pt-4">
            {[
              { label: "Obtenus", value: achievedCount },
              { label: "Restants", value: badges.length - achievedCount },
              { label: "XP gagnés", value: totalXP },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-display text-lg text-foreground">{value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {categories.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveCategory(id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs transition-all ${
                activeCategory === id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Grille de badges */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {filtered.map((badge, i) => {
            const rarity = rarityConfig[badge.rarity];
            const Icon = badge.icon;
            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedBadge(badge)}
                className="flex flex-col items-center rounded-2xl p-3 text-center transition-all active:scale-95"
                style={{
                  background: badge.achieved ? rarity.bg : "#F1EFE8",
                  border: `1px solid ${badge.achieved ? rarity.border : "#D3D1C7"}`,
                  opacity: badge.achieved ? 1 : 0.6,
                }}
              >
                {/* Icône */}
                <div className="relative mb-2">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background: badge.achieved ? rarity.glow : "#E8E6E0",
                      boxShadow: badge.achieved ? `0 0 12px ${rarity.glow}` : "none",
                    }}
                  >
                    {badge.achieved ? (
                      <Icon size={22} strokeWidth={1.5} style={{ color: rarity.color }} />
                    ) : (
                      <Lock size={16} strokeWidth={1.5} className="text-muted-foreground" />
                    )}
                  </div>
                  {badge.achieved && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                      <span style={{ fontSize: 8, color: "white" }}>✓</span>
                    </div>
                  )}
                </div>

                <p className="font-body text-[10px] font-medium leading-tight" style={{ color: badge.achieved ? rarity.color : "#888780" }}>
                  {badge.name}
                </p>

                {/* Barre de progression */}
                {!badge.achieved && badge.progress !== undefined && badge.target !== undefined && (
                  <div className="mt-1.5 w-full">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/60">
                      <div
                        className="h-full rounded-full bg-gold transition-all"
                        style={{ width: `${Math.min((badge.progress / badge.target) * 100, 100)}%` }}
                      />
                    </div>
                    <p style={{ fontSize: 8 }} className="mt-0.5 text-muted-foreground">
                      {badge.progress}/{badge.target}
                    </p>
                  </div>
                )}

                {badge.achieved && (
                  <p style={{ fontSize: 8 }} className="mt-1 font-medium" style={{ color: rarity.color }}>
                    +{badge.xp} XP
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Modal détail badge */}
      <AnimatePresence>
        {selectedBadge && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-charcoal/60 backdrop-blur-sm"
              onClick={() => setSelectedBadge(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-background p-6 pb-10 shadow-xl"
            >
              {(() => {
                const rarity = rarityConfig[selectedBadge.rarity];
                const Icon = selectedBadge.icon;
                return (
                  <>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                      style={{ background: rarity.bg, boxShadow: selectedBadge.achieved ? `0 0 24px ${rarity.glow}` : "none" }}>
                      {selectedBadge.achieved
                        ? <Icon size={36} strokeWidth={1.5} style={{ color: rarity.color }} />
                        : <Lock size={28} strokeWidth={1.5} className="text-muted-foreground" />
                      }
                    </div>

                    <div className="text-center mb-4">
                      <div className="mb-2 flex justify-center">
                        <span className="rounded-full px-3 py-1 font-body text-[10px] font-medium"
                          style={{ background: rarity.bg, color: rarity.color, border: `1px solid ${rarity.border}` }}>
                          {rarity.label}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-light text-foreground mb-1">{selectedBadge.name}</h2>
                      <p className="font-body text-sm text-muted-foreground">{selectedBadge.desc}</p>
                    </div>

                    {selectedBadge.achieved ? (
                      <div className="rounded-2xl bg-card p-4 text-center mb-4">
                        <p className="font-display text-3xl text-gold mb-1">+{selectedBadge.xp} XP</p>
                        <p className="font-body text-xs text-muted-foreground">Obtenu le {selectedBadge.achievedDate}</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-card p-4 mb-4">
                        <div className="flex justify-between mb-2">
                          <p className="font-body text-xs text-muted-foreground">Progression</p>
                          <p className="font-body text-xs text-foreground">
                            {selectedBadge.progress ?? 0}/{selectedBadge.target ?? "?"}</p>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gold transition-all"
                            style={{ width: `${Math.min(((selectedBadge.progress ?? 0) / (selectedBadge.target ?? 1)) * 100, 100)}%` }} />
                        </div>
                        <p className="mt-2 font-body text-xs text-muted-foreground text-center">
                          Récompense : <span className="text-gold font-medium">+{selectedBadge.xp} XP</span>
                        </p>
                      </div>
                    )}

                    <button onClick={() => setSelectedBadge(null)}
                      className="w-full rounded-2xl bg-primary py-3.5 font-body text-sm font-medium text-primary-foreground">
                      Fermer
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
};

export default Achievements;
