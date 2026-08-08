import {
  Flame, Dumbbell, PersonStanding, Leaf, Sparkles, Target, Trophy, Zap,
  Camera, Ruler, Calendar, CalendarClock, TrendingUp, Lock, Mail, Search,
  Moon, Scale, Diamond, Sprout, Activity, Heart, PartyPopper, CheckCircle2,
  Rocket, Clapperboard, Bell, Award, Hand, Frown, Meh, Smile, Laugh,
  Footprints, Wind, Timer, BatteryFull, Sun, Star, ClipboardList,
  Waves, Move, HeartPulse, Orbit, Hourglass,
  type LucideProps, type LucideIcon,
} from "lucide-react";

/**
 * Icônes de marque Connect Reformer.
 * Style trait fin, uniforme, dans l'or signature (#B8973E).
 * Remplace tous les emojis de l'application pour un rendu premium et cohérent.
 */

export const BRAND_GOLD = "#B8973E";

const MAP = {
  // Objectifs & entraînement
  "perte_gras": Flame,
  "prise_masse": Dumbbell,
  "souplesse": PersonStanding,
  "force": Dumbbell,
  "endurance": Footprints,
  "posture": PersonStanding,
  "tonification": Sparkles,
  "detente": Leaf,
  // Concepts
  flame: Flame,
  strength: Dumbbell,
  flex: PersonStanding,
  leaf: Leaf,
  sparkles: Sparkles,
  target: Target,
  trophy: Trophy,
  bolt: Zap,
  camera: Camera,
  ruler: Ruler,
  calendar: Calendar,
  reminder: CalendarClock,
  progress: TrendingUp,
  lock: Lock,
  mail: Mail,
  search: Search,
  moon: Moon,
  sun: Sun,
  scale: Scale,
  diamond: Diamond,
  sprout: Sprout,
  activity: Activity,
  heart: Heart,
  confetti: PartyPopper,
  check: CheckCircle2,
  rocket: Rocket,
  video: Clapperboard,
  bell: Bell,
  badge: Award,
  wave: Hand,
  wind: Wind,
  timer: Timer,
  battery: BatteryFull,
  star: Star,
  clipboard: ClipboardList,
  // Humeurs (retour de séance)
  mood_terrible: Frown,
  mood_bad: Meh,
  mood_ok: Smile,
  mood_good: Laugh,
  mood_great: Flame,
} as const;

export type IconName = keyof typeof MAP;

interface AppIconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

export default function AppIcon({ name, size = 24, color = BRAND_GOLD, strokeWidth = 1.75, ...rest }: AppIconProps) {
  const Cmp = MAP[name] || Sparkles;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}

/**
 * Icône associée à une catégorie de séance (MOBILITY, STRONG, FIRE...).
 * Mappe par slug/nom pour ignorer l'emoji stocké en base et afficher
 * une icône premium cohérente. Repli intelligent par mots-clés.
 */
export function categoryIcon(slugOrName: string | null | undefined): LucideIcon {
  const k = (slugOrName || "").toLowerCase();
  const table: { match: string[]; icon: LucideIcon }[] = [
    { match: ["mobility", "mobilite", "mobilité"], icon: Move },
    { match: ["full", "body", "complet"], icon: PersonStanding },
    { match: ["strong", "strength", "force", "muscu"], icon: Dumbbell },
    { match: ["fire", "cardio", "burn", "hiit"], icon: Flame },
    { match: ["pulse", "rythm", "tempo", "energie", "énergie"], icon: HeartPulse },
    { match: ["stretch", "etirement", "étirement", "souplesse"], icon: PersonStanding },
    { match: ["abs", "core", "abdo", "ventre", "gainage"], icon: Target },
    { match: ["booty", "glute", "fessier", "jambe", "leg"], icon: Activity },
    { match: ["arms", "bras", "haut"], icon: Dumbbell },
    { match: ["flow", "yoga", "zen", "detente", "détente", "relax"], icon: Leaf },
    { match: ["balance", "equilibre", "équilibre"], icon: Orbit },
    { match: ["breath", "respir", "calm"], icon: Wind },
  ];
  for (const entry of table) {
    if (entry.match.some((m) => k.includes(m))) return entry.icon;
  }
  return Sparkles; // repli élégant
}
