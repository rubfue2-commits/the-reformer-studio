import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Lock, CheckCircle,
  Play, Calendar, Clock, Flame, Target, Star,
  Award, TrendingUp, Heart, Zap, Crown, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SessionDay {
  day: number;
  title: string;
  duration: string;
  type: "workout" | "rest" | "optional";
  description: string;
  videoId?: string;
  calories?: number;
}

interface Week {
  weekNumber: number;
  theme: string;
  description: string;
  sessions: SessionDay[];
  focus: string[];
}

interface Program {
  id: string;
  title: string;
  subtitle: string;
  goal: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  level: string;
  calories: number;
  rating: number;
  enrolled: number;
  color: string;
  colorLight: string;
  icon: any;
  description: string;
  benefits: string[];
  equipment: string[];
  weeks: Week[];
  featured?: boolean;
  locked?: boolean;
}

// ─── Données programmes ───────────────────────────────────────────────────────

const PROGRAMS: Program[] = [
  {
    id: "debutante",
    title: "Pilates Débutante",
    subtitle: "Les bases du Reformer",
    goal: "Posture",
    durationWeeks: 4,
    sessionsPerWeek: 3,
    level: "Débutant",
    calories: 150,
    rating: 4.9,
    enrolled: 3240,
    color: "#B8973E",
    colorLight: "#FAEEDA",
    icon: Star,
    featured: true,
    description: "Le programme parfait pour découvrir le Pilates Reformer. En 4 semaines, tu vas apprendre les bases du mouvement, corriger ta posture et sentir ton centre s'activer.",
    benefits: ["Meilleure posture", "Activation du centre", "Souplesse +30%", "Confiance corporelle"],
    equipment: ["Tapis", "Élastique léger"],
    weeks: [
      {
        weekNumber: 1,
        theme: "Découverte & Respiration",
        description: "On pose les bases : respiration, centrage, alignement.",
        focus: ["Respiration latérale", "Activation du transverse", "Alignement vertébral"],
        sessions: [
          { day: 1, title: "Intro Pilates", duration: "20 min", type: "workout", description: "Présentation des principes fondamentaux", calories: 100 },
          { day: 2, title: "Repos actif", duration: "—", type: "rest", description: "Étirements doux ou marche" },
          { day: 3, title: "Respiration & Centre", duration: "25 min", type: "workout", description: "Travail sur la respiration profonde", calories: 120 },
          { day: 4, title: "Repos", duration: "—", type: "rest", description: "Récupération complète" },
          { day: 5, title: "Full Body Doux", duration: "30 min", type: "workout", description: "Premier enchaînement corps entier", calories: 140 },
          { day: 6, title: "Yoga optionnel", duration: "20 min", type: "optional", description: "Stretching et mobilité" },
          { day: 7, title: "Repos total", duration: "—", type: "rest", description: "Récupération complète" },
        ],
      },
      {
        weekNumber: 2,
        theme: "Fondations & Stabilité",
        description: "On construit la force profonde et la stabilité.",
        focus: ["Stabilisation du bassin", "Force des abdos profonds", "Mobilité thoracique"],
        sessions: [
          { day: 1, title: "Core Activation", duration: "25 min", type: "workout", description: "Renforcement des abdominaux profonds", calories: 130 },
          { day: 2, title: "Repos", duration: "—", type: "rest", description: "Récupération" },
          { day: 3, title: "Jambes & Bassin", duration: "30 min", type: "workout", description: "Stabilisation pelvienne et jambes", calories: 150 },
          { day: 4, title: "Repos actif", duration: "—", type: "rest", description: "Marche ou natation douce" },
          { day: 5, title: "Corps entier", duration: "35 min", type: "workout", description: "Intégration des semaines 1 et 2", calories: 165 },
          { day: 6, title: "Stretching", duration: "20 min", type: "optional", description: "Étirements complets" },
          { day: 7, title: "Repos total", duration: "—", type: "rest", description: "Récupération complète" },
        ],
      },
      {
        weekNumber: 3,
        theme: "Force & Fluidité",
        description: "Les mouvements deviennent plus fluides et plus forts.",
        focus: ["Fluidité des enchaînements", "Force du haut du corps", "Équilibre"],
        sessions: [
          { day: 1, title: "Upper Body", duration: "30 min", type: "workout", description: "Bras, épaules, dos supérieur", calories: 145 },
          { day: 2, title: "Repos", duration: "—", type: "rest", description: "Récupération" },
          { day: 3, title: "Pilates Flow", duration: "35 min", type: "workout", description: "Enchaînement fluide complet", calories: 170 },
          { day: 4, title: "Repos actif", duration: "—", type: "rest", description: "Marche ou vélo doux" },
          { day: 5, title: "Défi semaine 3", duration: "40 min", type: "workout", description: "Séance plus intense et complète", calories: 185 },
          { day: 6, title: "Yoga", duration: "25 min", type: "optional", description: "Récupération active" },
          { day: 7, title: "Repos total", duration: "—", type: "rest", description: "Récupération complète" },
        ],
      },
      {
        weekNumber: 4,
        theme: "Consolidation & Célébration",
        description: "On consolide les acquis et on mesure les progrès.",
        focus: ["Synthèse du programme", "Test des acquis", "Projection sur la suite"],
        sessions: [
          { day: 1, title: "Révision semaine 1", duration: "35 min", type: "workout", description: "Retour aux bases avec plus de maîtrise", calories: 155 },
          { day: 2, title: "Repos", duration: "—", type: "rest", description: "Récupération" },
          { day: 3, title: "Révision semaine 2-3", duration: "40 min", type: "workout", description: "Enchaînement des meilleurs exercices", calories: 180 },
          { day: 4, title: "Repos actif", duration: "—", type: "rest", description: "Mobilité douce" },
          { day: 5, title: "Séance Finale", duration: "45 min", type: "workout", description: "Programme complet de célébration !", calories: 200 },
          { day: 6, title: "Photos & Mesures", duration: "—", type: "optional", description: "Documente tes progrès !" },
          { day: 7, title: "Repos & Bilan", duration: "—", type: "rest", description: "Félicitations — tu as terminé !" },
        ],
      },
    ],
  },
  {
    id: "perte-poids",
    title: "Pilates Minceur",
    subtitle: "Sculpter & affiner la silhouette",
    goal: "Perte de poids",
    durationWeeks: 6,
    sessionsPerWeek: 4,
    level: "Intermédiaire",
    calories: 280,
    rating: 4.8,
    enrolled: 5120,
    color: "#EF4444",
    colorLight: "#FEF2F2",
    icon: Flame,
    description: "6 semaines pour transformer ta silhouette avec le Pilates. Des séances progressives qui combinent renforcement musculaire, cardio doux et flexibilité.",
    benefits: ["Perte de poids", "Ventre plat", "Cuisses & fessiers toniques", "Métabolisme boosté"],
    equipment: ["Tapis", "Élastique", "Ballon Pilates"],
    weeks: [
      { weekNumber: 1, theme: "Activation Métabolique", description: "Réveille ton métabolisme.", focus: ["Cardio Pilates", "Core intense", "Mobilité"], sessions: [
        { day: 1, title: "Cardio Pilates Intro", duration: "35 min", type: "workout", description: "Enchaînements dynamiques pour brûler", calories: 250 },
        { day: 2, title: "Core Sculpt", duration: "30 min", type: "workout", description: "Abdominaux et ceinture", calories: 200 },
        { day: 3, title: "Repos actif", duration: "—", type: "rest", description: "Marche 30 min" },
        { day: 4, title: "Full Body Brûle-Graisse", duration: "40 min", type: "workout", description: "Corps entier à intensité moyenne", calories: 280 },
        { day: 5, title: "Repos", duration: "—", type: "rest", description: "Récupération" },
        { day: 6, title: "HIIT Pilates", duration: "30 min", type: "workout", description: "Intervalles intenses Pilates", calories: 300 },
        { day: 7, title: "Repos total", duration: "—", type: "rest", description: "Récupération" },
      ]},
      { weekNumber: 2, theme: "Sculpture du Corps", description: "On cible les zones rebelles.", focus: ["Ventre", "Cuisses", "Bras"], sessions: [
        { day: 1, title: "Flat Belly", duration: "35 min", type: "workout", description: "Séance dédiée au ventre", calories: 230 },
        { day: 2, title: "Lower Body", duration: "40 min", type: "workout", description: "Fessiers et cuisses", calories: 260 },
        { day: 3, title: "Repos actif", duration: "—", type: "rest", description: "Natation ou vélo" },
        { day: 4, title: "Arms & Back", duration: "30 min", type: "workout", description: "Bras, dos, épaules", calories: 200 },
        { day: 5, title: "Repos", duration: "—", type: "rest", description: "Récupération" },
        { day: 6, title: "Corps Entier Intense", duration: "45 min", type: "workout", description: "Séance complète et dynamique", calories: 320 },
        { day: 7, title: "Repos total", duration: "—", type: "rest", description: "Récupération" },
      ]},
      { weekNumber: 3, theme: "Intensification", description: "On monte d'un cran.", focus: ["Intensité +", "Endurance", "Force"], sessions: [
        { day: 1, title: "Power Pilates", duration: "40 min", type: "workout", description: "Séance puissante et rythmée", calories: 310 },
        { day: 2, title: "Core Challenge", duration: "35 min", type: "workout", description: "Défi abdominaux", calories: 240 },
        { day: 3, title: "Repos actif", duration: "—", type: "rest", description: "Marche rapide" },
        { day: 4, title: "Circuit Training Pilates", duration: "45 min", type: "workout", description: "Circuits enchaînés sans pause", calories: 340 },
        { day: 5, title: "Repos", duration: "—", type: "rest", description: "Récupération" },
        { day: 6, title: "Défi Semaine 3", duration: "50 min", type: "workout", description: "La séance la plus intense jusqu'ici", calories: 370 },
        { day: 7, title: "Repos total", duration: "—", type: "rest", description: "Récupération complète" },
      ]},
      { weekNumber: 4, theme: "Mi-Parcours", description: "Bilan et ajustements.", focus: ["Révision", "Mesures", "Motivation"], sessions: [
        { day: 1, title: "Bilan Mi-Parcours", duration: "40 min", type: "workout", description: "Séance de révision des acquis", calories: 270 },
        { day: 2, title: "Zones Ciblées", duration: "35 min", type: "workout", description: "Focus sur tes zones à travailler", calories: 240 },
        { day: 3, title: "Repos actif", duration: "—", type: "rest", description: "Yoga ou stretching" },
        { day: 4, title: "Cardio & Force", duration: "45 min", type: "workout", description: "Mix cardio et renforcement", calories: 330 },
        { day: 5, title: "Repos", duration: "—", type: "rest", description: "Récupération" },
        { day: 6, title: "Photos & Mesures", duration: "—", type: "optional", description: "Documente tes progrès à mi-parcours" },
        { day: 7, title: "Repos total", duration: "—", type: "rest", description: "Récupération complète" },
      ]},
      { weekNumber: 5, theme: "Sprint Final", description: "On accélère avant la ligne d'arrivée.", focus: ["Intensité max", "Définition", "Endurance"], sessions: [
        { day: 1, title: "Sprint Pilates", duration: "45 min", type: "workout", description: "Séance ultra-dynamique", calories: 360 },
        { day: 2, title: "Définition Corps", duration: "40 min", type: "workout", description: "Sculpture de la silhouette", calories: 300 },
        { day: 3, title: "Repos actif", duration: "—", type: "rest", description: "Marche ou natation" },
        { day: 4, title: "Full Power", duration: "50 min", type: "workout", description: "Corps entier à intensité maximum", calories: 390 },
        { day: 5, title: "Repos", duration: "—", type: "rest", description: "Récupération" },
        { day: 6, title: "Super Séance", duration: "55 min", type: "workout", description: "La séance ultime avant la finale", calories: 400 },
        { day: 7, title: "Repos total", duration: "—", type: "rest", description: "Récupération complète" },
      ]},
      { weekNumber: 6, theme: "Transformation Finale", description: "Célèbre ta nouvelle silhouette !", focus: ["Consolidation", "Célébration", "Futur"], sessions: [
        { day: 1, title: "Best Of Semaine 1-3", duration: "45 min", type: "workout", description: "Les meilleurs exercices du début", calories: 320 },
        { day: 2, title: "Best Of Semaine 4-5", duration: "45 min", type: "workout", description: "Les meilleurs exercices de la fin", calories: 330 },
        { day: 3, title: "Repos actif", duration: "—", type: "rest", description: "Yoga de récupération" },
        { day: 4, title: "Séance Spéciale", duration: "50 min", type: "workout", description: "Programme exclusif semaine finale", calories: 350 },
        { day: 5, title: "Repos", duration: "—", type: "rest", description: "Préparation pour la grande finale" },
        { day: 6, title: "GRANDE FINALE", duration: "60 min", type: "workout", description: "Ta séance de transformation finale !", calories: 420 },
        { day: 7, title: "Bilan & Célébration", duration: "—", type: "optional", description: "Photos, mesures, et fête !" },
      ]},
    ],
  },
  {
    id: "post-partum",
    title: "Post-Partum Doux",
    subtitle: "Retrouver son corps en douceur",
    goal: "Postpartum",
    durationWeeks: 8,
    sessionsPerWeek: 3,
    level: "Débutant",
    calories: 120,
    rating: 5.0,
    enrolled: 2890,
    color: "#A78BFA",
    colorLight: "#EDE9FE",
    icon: Heart,
    locked: true,
    description: "Un programme spécialement conçu pour les mamans après l'accouchement. 8 semaines progressives pour retrouver force, tonus et bien-être en toute sécurité.",
    benefits: ["Rééducation périnéale", "Retour à la forme", "Bien-être mental", "Ventre post-partum"],
    equipment: ["Tapis", "Coussin"],
    weeks: Array.from({ length: 8 }, (_, i) => ({
      weekNumber: i + 1,
      theme: ["Réveil en douceur", "Périnée & Respiration", "Centre & Bassin", "Retour au Mouvement", "Force Progressive", "Endurance Douce", "Sculpter en Douceur", "Consolidation"][i],
      description: "Programme adapté à ta récupération post-partum.",
      focus: ["Périnée", "Abdominaux", "Posture"],
      sessions: [
        { day: 1, title: `Séance ${i * 3 + 1}`, duration: "20 min", type: "workout" as const, description: "Séance adaptée à la semaine", calories: 100 + i * 10 },
        { day: 2, title: "Repos", duration: "—", type: "rest" as const, description: "Récupération" },
        { day: 3, title: `Séance ${i * 3 + 2}`, duration: "25 min", type: "workout" as const, description: "Renforcement progressif", calories: 110 + i * 10 },
        { day: 4, title: "Repos actif", duration: "—", type: "rest" as const, description: "Marche douce avec bébé" },
        { day: 5, title: `Séance ${i * 3 + 3}`, duration: "30 min", type: "workout" as const, description: "Corps entier en douceur", calories: 120 + i * 10 },
        { day: 6, title: "Optionnel", duration: "15 min", type: "optional" as const, description: "Étirements ou respiration" },
        { day: 7, title: "Repos total", duration: "—", type: "rest" as const, description: "Récupération complète" },
      ],
    })),
  },
  {
    id: "gainage",
    title: "Gainage Intensif",
    subtitle: "Un core d'acier en 4 semaines",
    goal: "Tonification",
    durationWeeks: 4,
    sessionsPerWeek: 4,
    level: "Avancé",
    calories: 320,
    rating: 4.7,
    enrolled: 1560,
    color: "#10B981",
    colorLight: "#D1FAE5",
    icon: Zap,
    locked: true,
    description: "Le programme le plus intense pour un core en béton. 4 semaines de gainage Pilates avancé pour sculpter ta ceinture abdominale.",
    benefits: ["Core en acier", "Posture parfaite", "Performance sportive", "Dos renforcé"],
    equipment: ["Tapis", "Ballon", "Élastique fort"],
    weeks: Array.from({ length: 4 }, (_, i) => ({
      weekNumber: i + 1,
      theme: ["Fondations Extrêmes", "Challenge Core", "Intensité Maximum", "Maîtrise Totale"][i],
      description: "Programme intensif de gainage avancé.",
      focus: ["Core profond", "Stabilité", "Force"],
      sessions: [
        { day: 1, title: `Core Day 1 S${i + 1}`, duration: "40 min", type: "workout" as const, description: "Gainage intense", calories: 280 + i * 20 },
        { day: 2, title: `Core Day 2 S${i + 1}`, duration: "35 min", type: "workout" as const, description: "Abdominaux ciblés", calories: 260 + i * 20 },
        { day: 3, title: "Repos actif", duration: "—", type: "rest" as const, description: "Mobilité et récupération" },
        { day: 4, title: `Core Day 3 S${i + 1}`, duration: "45 min", type: "workout" as const, description: "Circuit core complet", calories: 310 + i * 20 },
        { day: 5, title: `Core Day 4 S${i + 1}`, duration: "50 min", type: "workout" as const, description: "Défi de la semaine", calories: 340 + i * 20 },
        { day: 6, title: "Repos", duration: "—", type: "rest" as const, description: "Récupération" },
        { day: 7, title: "Repos total", duration: "—", type: "rest" as const, description: "Récupération complète" },
      ],
    })),
  },
];

// ─── Composant Semaine ────────────────────────────────────────────────────────

const WeekDetail = ({ week, program, onBack }: { week: Week; program: Program; onBack: () => void }) => {
  const [activeDay, setActiveDay] = useState(0);
  const completedSessions = [0, 1, 2];

  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="h-full">
      {/* Header semaine */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
          <ChevronLeft size={18} strokeWidth={1.5} className="text-muted-foreground" />
        </button>
        <div>
          <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Semaine {week.weekNumber}</p>
          <h2 className="font-display text-xl font-light text-foreground">{week.theme}</h2>
        </div>
      </div>

      {/* Focus */}
      <div className="rounded-2xl bg-card p-4 mb-4 shadow-sm">
        <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Focus de la semaine</p>
        <div className="flex flex-wrap gap-2">
          {week.focus.map(f => (
            <span key={f} className="rounded-full px-3 py-1 font-body text-xs font-medium"
              style={{ background: program.colorLight, color: program.color }}>
              {f}
            </span>
          ))}
        </div>
        <p className="font-body text-xs text-muted-foreground mt-3 leading-relaxed">{week.description}</p>
      </div>

      {/* Planning jours */}
      <div className="rounded-3xl bg-card shadow-sm overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-display text-base font-light text-foreground">Planning des 7 jours</h3>
        </div>
        {week.sessions.map((session, i) => {
          const isDone = completedSessions.includes(i);
          const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
          return (
            <div key={session.day}
              className={`flex items-center gap-3 px-4 py-3 ${i < week.sessions.length - 1 ? "border-b border-border" : ""} ${session.type === "rest" ? "opacity-60" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium font-body ${
                isDone ? "bg-green-500 text-white" :
                session.type === "rest" ? "bg-muted text-muted-foreground" :
                session.type === "optional" ? "border border-dashed border-border text-muted-foreground" :
                "text-white"
              }`}
                style={!isDone && session.type === "workout" ? { backgroundColor: program.color } : {}}>
                {isDone ? <CheckCircle size={14} /> : dayNames[i]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-body text-sm ${session.type === "rest" ? "text-muted-foreground" : "text-foreground"}`}>
                  {session.title}
                  {session.type === "optional" && <span className="text-muted-foreground text-[10px] ml-1">(optionnel)</span>}
                </p>
                <p className="font-body text-[10px] text-muted-foreground">{session.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {session.calories && <span className="font-body text-[10px] text-muted-foreground">{session.calories} kcal</span>}
                {session.duration !== "—" && (
                  <span className="rounded-full bg-muted px-2 py-0.5 font-body text-[10px] text-muted-foreground">{session.duration}</span>
                )}
                {session.type === "workout" && !isDone && (
                  <button className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ backgroundColor: program.colorLight }}>
                    <Play size={10} style={{ color: program.color }} fill={program.color} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── Détail programme ─────────────────────────────────────────────────────────

const ProgramDetail = ({ program, onBack, onStart }: { program: Program; onBack: () => void; onStart: () => void }) => {
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null);
  const currentWeek = 2;
  const completedWeeks = [1];

  if (selectedWeek) {
    return (
      <div className="px-6 pt-6 pb-6">
        <WeekDetail week={selectedWeek} program={program} onBack={() => setSelectedWeek(null)} />
      </div>
    );
  }

  const Icon = program.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="px-6 pt-6 pb-5" style={{ background: `linear-gradient(180deg, ${program.colorLight} 0%, transparent 100%)` }}>
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground mb-5">
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span className="font-body text-sm">Programmes</span>
        </button>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: program.color + "20" }}>
            <Icon size={26} strokeWidth={1.5} style={{ color: program.color }} />
          </div>
          <div>
            <p className="font-body text-[10px] tracking-widest uppercase mb-1" style={{ color: program.color }}>
              {program.durationWeeks} semaines · {program.sessionsPerWeek}×/semaine
            </p>
            <h1 className="font-display text-2xl font-light text-foreground">{program.title}</h1>
            <p className="font-body text-sm text-muted-foreground">{program.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        {/* Métriques */}
        <div className="flex gap-3 mb-5">
          {[
            { label: "Niveau", value: program.level },
            { label: "Calories/séance", value: `~${program.calories}` },
            { label: "Avis", value: `${program.rating} ⭐` },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 rounded-2xl bg-card p-3 text-center shadow-sm">
              <p className="font-body text-xs font-medium text-foreground">{value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mb-5">
          <h3 className="font-display text-lg font-light text-foreground mb-2">À propos</h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{program.description}</p>
        </div>

        {/* Bénéfices */}
        <div className="mb-5">
          <h3 className="font-display text-lg font-light text-foreground mb-3">Ce que tu vas gagner</h3>
          <div className="grid grid-cols-2 gap-2">
            {program.benefits.map(b => (
              <div key={b} className="flex items-center gap-2 rounded-xl bg-card p-3 shadow-sm">
                <CheckCircle size={14} style={{ color: program.color }} strokeWidth={2} />
                <span className="font-body text-xs text-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Équipement */}
        <div className="mb-6">
          <h3 className="font-display text-lg font-light text-foreground mb-2">Équipement</h3>
          <div className="flex flex-wrap gap-2">
            {program.equipment.map(e => (
              <span key={e} className="rounded-full border border-border bg-card px-3 py-1 font-body text-xs text-muted-foreground">{e}</span>
            ))}
          </div>
        </div>

        {/* Planning semaines */}
        <h3 className="font-display text-lg font-light text-foreground mb-3">Planning semaine par semaine</h3>
        <div className="space-y-3 mb-6">
          {program.weeks.map((week) => {
            const isDone = completedWeeks.includes(week.weekNumber);
            const isCurrent = week.weekNumber === currentWeek;
            const isLocked = week.weekNumber > currentWeek + 1;

            return (
              <button key={week.weekNumber} onClick={() => !isLocked && setSelectedWeek(week)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  isLocked ? "opacity-50 cursor-not-allowed" :
                  isCurrent ? "border-2 shadow-sm" : "border-border bg-card"
                }`}
                style={isCurrent ? { borderColor: program.color, background: program.colorLight } : {}}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isDone ? "bg-green-500" : isLocked ? "bg-muted" : isCurrent ? "" : "bg-muted"
                  }`}
                    style={!isDone && !isLocked && isCurrent ? { backgroundColor: program.color } : {}}>
                    {isDone ? <CheckCircle size={18} className="text-white" /> :
                     isLocked ? <Lock size={16} className="text-muted-foreground" strokeWidth={1.5} /> :
                     <span className="font-display text-base" style={{ color: isCurrent ? "white" : "hsl(27,8%,60%)" }}>{week.weekNumber}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-medium text-foreground">{week.theme}</p>
                      {isCurrent && <span className="rounded-full px-2 py-0.5 font-body text-[9px] font-medium text-white" style={{ backgroundColor: program.color }}>En cours</span>}
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                      {week.sessions.filter(s => s.type === "workout").length} séances · {week.sessions.filter(s => s.type === "workout").reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0)} min total
                    </p>
                  </div>
                  {!isLocked && <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        {program.locked ? (
          <div className="rounded-2xl border border-dashed border-border p-5 text-center">
            <Crown size={24} className="text-gold mx-auto mb-2" />
            <p className="font-display text-base text-foreground mb-1">Programme Premium</p>
            <p className="font-body text-xs text-muted-foreground mb-3">Accès inclus dans l'abonnement annuel</p>
            <button className="w-full rounded-2xl bg-gold py-3 font-body text-sm font-medium text-white">
              Passer à Premium
            </button>
          </div>
        ) : (
          <motion.button whileTap={{ scale: 0.98 }} onClick={onStart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-body text-sm font-medium text-white shadow-lg"
            style={{ backgroundColor: program.color }}>
            <Play size={16} fill="white" />
            {currentWeek > 1 ? `Continuer — Semaine ${currentWeek}` : "Commencer le programme"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

const Programs = () => {
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  if (selectedProgram) {
    return (
      <MobileLayout showNav={false}>
        <div className="overflow-y-auto min-h-screen">
          <ProgramDetail
            program={selectedProgram}
            onBack={() => setSelectedProgram(null)}
            onStart={() => {}}
          />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-6 pt-14 pb-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-light text-foreground">Programmes</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">Des parcours guidés semaine par semaine</p>
        </motion.div>

        {/* Programme en cours */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-5 rounded-3xl overflow-hidden shadow-sm" style={{ background: "linear-gradient(135deg, #1C1B19, #2D2A22)" }}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-body text-[10px] tracking-widest uppercase text-white/50">Programme en cours</span>
            </div>
            <h2 className="font-display text-xl font-light text-white mb-1">Pilates Débutante</h2>
            <p className="font-body text-xs text-white/60 mb-4">Semaine 2 sur 4 · 3 séances restantes</p>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-body text-[10px] text-white/50">Progression</span>
                <span className="font-body text-[10px] text-gold">50%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gold"
                  initial={{ width: 0 }} animate={{ width: "50%" }} transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </div>
            <button onClick={() => setSelectedProgram(PROGRAMS[0])}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-3 font-body text-sm font-medium text-white">
              <Play size={14} fill="white" />
              Reprendre le programme
            </button>
          </div>
        </motion.div>

        {/* Tous les programmes */}
        <div className="mt-6">
          <h2 className="font-display text-lg font-light text-foreground mb-4">Tous les programmes</h2>
          <div className="space-y-4">
            {PROGRAMS.map((program, i) => {
              const Icon = program.icon;
              return (
                <motion.button key={program.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }} onClick={() => setSelectedProgram(program)}
                  className="w-full rounded-3xl bg-card shadow-sm overflow-hidden text-left">
                  {/* Bande colorée */}
                  <div className="h-2" style={{ backgroundColor: program.color }} />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: program.colorLight }}>
                        <Icon size={22} strokeWidth={1.5} style={{ color: program.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-display text-lg font-light text-foreground truncate">{program.title}</h3>
                          {program.locked && <Lock size={14} className="text-muted-foreground shrink-0" strokeWidth={1.5} />}
                          {program.featured && (
                            <span className="shrink-0 rounded-full px-2 py-0.5 font-body text-[9px] font-medium text-white"
                              style={{ backgroundColor: program.color }}>★ Populaire</span>
                          )}
                        </div>
                        <p className="font-body text-xs text-muted-foreground">{program.subtitle}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-body text-[10px] text-muted-foreground">
                            <Calendar size={10} /> {program.durationWeeks} semaines
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-body text-[10px] text-muted-foreground">
                            <Target size={10} /> {program.level}
                          </span>
                          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-body text-[10px] text-muted-foreground">
                            <Star size={10} /> {program.rating}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-1" />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="font-body text-[10px] text-muted-foreground">
                        {program.enrolled.toLocaleString()} participantes
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground">
                        ~{program.calories} kcal/séance
                      </span>
                      <span className="font-body text-[10px]" style={{ color: program.color }}>
                        {program.sessionsPerWeek}×/semaine
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Programs;
