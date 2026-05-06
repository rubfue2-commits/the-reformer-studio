import { const BADGES = [
  // ── Séances ─────────────────────────────────────────────────────
  { id: "first",    icon: Star,     color: "#B8973E", bg: "#FAEEDA",
    titleFr: "Première séance",    titleEn: "First session",
    descFr: "Tu as complété ta toute première séance. Le début d'une belle aventure !",
    descEn: "You completed your very first session. The start of a great journey!",
    threshold: 1, xp: 50 },

  { id: "ten",      icon: Target,   color: "#3B82F6", bg: "#EFF6FF",
    titleFr: "10 séances",         titleEn: "10 sessions",
    descFr: "10 séances complétées. Tu prends de bonnes habitudes !",
    descEn: "10 sessions done. You're building great habits!",
    threshold: 10, xp: 150 },

  { id: "twenty5",  icon: Award,    color: "#8B5CF6", bg: "#F5F3FF",
    titleFr: "25 séances",         titleEn: "25 sessions",
    descFr: "25 séances ! Tu es sur la bonne voie.",
    descEn: "25 sessions! You're on the right track.",
    threshold: 25, xp: 300 },

  { id: "fifty",    icon: Zap,      color: "#F59E0B", bg: "#FFFBEB",
    titleFr: "50 séances",         titleEn: "50 sessions",
    descFr: "50 séances ! Tu es une vraie pratiquante.",
    descEn: "50 sessions! You're a true practitioner.",
    threshold: 50, xp: 500 },

  { id: "hundred",  icon: Trophy,   color: "#EF4444", bg: "#FEF2F2",
    titleFr: "100 séances",        titleEn: "100 sessions",
    descFr: "100 séances complétées. Quelle régularité impressionnante !",
    descEn: "100 sessions completed. What impressive consistency!",
    threshold: 100, xp: 1000 },

  { id: "two_fifty", icon: Flame,   color: "#F97316", bg: "#FFF7ED",
    titleFr: "250 séances",        titleEn: "250 sessions",
    descFr: "250 séances ! Tu es une icône du Reformer.",
    descEn: "250 sessions! You're a Reformer icon.",
    threshold: 250, xp: 2000 },

  { id: "five_hundred", icon: Crown, color: "#EC4899", bg: "#FDF2F8",
    titleFr: "500 séances",        titleEn: "500 sessions",
    descFr: "500 séances ! Une légende est née.",
    descEn: "500 sessions! A legend is born.",
    threshold: 500, xp: 4000 },

  { id: "thousand", icon: Sparkles, color: "#B8973E", bg: "#FAEEDA",
    titleFr: "1000 séances",       titleEn: "1000 sessions",
    descFr: "1000 séances ! Tu es au sommet. Le Reformer n'a plus de secret pour toi.",
    descEn: "1000 sessions! You're at the top. The Reformer holds no more secrets.",
    threshold: 1000, xp: 10000 },

  // ── Séries ──────────────────────────────────────────────────────
  { id: "streak7",  icon: Flame,    color: "#EF4444", bg: "#FEF2F2",
    titleFr: "7 jours de feu",     titleEn: "7-day streak",
    descFr: "7 jours consécutifs de pratique. Tu es en feu !",
    descEn: "7 consecutive days of practice. You're on fire!",
    threshold: 7, isStreak: true, xp: 200 },

  { id: "streak14", icon: Flame,    color: "#F97316", bg: "#FFF7ED",
    titleFr: "14 jours sans pause", titleEn: "14-day streak",
    descFr: "14 jours d'affilée ! Ta régularité est exemplaire.",
    descEn: "14 days in a row! Your consistency is exemplary.",
    threshold: 14, isStreak: true, xp: 350 },

  { id: "streak30", icon: Flame,    color: "#8B5CF6", bg: "#F5F3FF",
    titleFr: "30 jours de légende", titleEn: "30-day streak",
    descFr: "30 jours consécutifs. Tu es une machine !",
    descEn: "30 consecutive days. You're a machine!",
    threshold: 30, isStreak: true, xp: 700 },

  { id: "streak60", icon: Crown,    color: "#EC4899", bg: "#FDF2F8",
    titleFr: "60 jours de feu",    titleEn: "60-day streak",
    descFr: "60 jours sans interruption. Discipline de championne !",
    descEn: "60 days without a break. Champion discipline!",
    threshold: 60, isStreak: true, xp: 1500 },

  // ── Programmes ───────────────────────────────────────────────────
  { id: "prog_first", icon: BookOpen, color: "#10B981", bg: "#ECFDF5",
    titleFr: "Premier programme",  titleEn: "First program",
    descFr: "Tu as démarré ton premier programme. Continue !",
    descEn: "You started your first program. Keep going!",
    threshold: 1, isProgram: true, xp: 100 },

  { id: "prog5",    icon: BookOpen, color: "#3B82F6", bg: "#EFF6FF",
    titleFr: "5 programmes",       titleEn: "5 programs",
    descFr: "5 programmes complétés. Tu explores tout !",
    descEn: "5 programs completed. You're exploring everything!",
    threshold: 5, isProgram: true, xp: 400 },
] as constconst BADGES = [
  { id: "first",    icon: Star,     color: "#B8973E", bg: "#FAEEDA",
    titleFr: "Première séance",   titleEn: "First session",
    descFr: "Tu as complété ta toute première séance. Le début d'une belle aventure !",
    descEn: "You completed your very first session. The start of a great journey!",
    threshold: 1, xp: 50 },
  { id: "ten",      icon: Target,   color: "#3B82F6", bg: "#EFF6FF",
    titleFr: "10 séances",        titleEn: "10 sessions",
    descFr: "10 séances complétées. Tu prends de bonnes habitudes !",
    descEn: "10 sessions completed. You're building great habits!",
    threshold: 10, xp: 150 },
  { id: "streak7",  icon: Flame,    color: "#EF4444", bg: "#FEF2F2",
    titleFr: "7 jours de feu",    titleEn: "7-day streak",
    descFr: "7 jours consécutifs de pratique. Tu es en feu !",
    descEn: "7 consecutive days of practice. You're on fire!",
    threshold: 7, isStreak: true, xp: 200 },
  { id: "twenty5",  icon: Award,    color: "#8B5CF6", bg: "#F5F3FF",
    titleFr: "25 séances",        titleEn: "25 sessions",
    descFr: "25 séances — tu fais partie des plus motivées !",
    descEn: "25 sessions — you're among the most motivated!",
    threshold: 25, xp: 300 },
  { id: "streak14", icon: Zap,      color: "#F59E0B", bg: "#FFFBEB",
    titleFr: "14 jours d'affilée", titleEn: "14-day streak",
    descFr: "14 jours consécutifs — incroyable régularité !",
    descEn: "14 consecutive days — incredible consistency!",
    threshold: 14, isStreak: true, xp: 350 },
  { id: "heart",    icon: Heart,    color: "#EC4899", bg: "#FDF2F8",
    titleFr: "Corps en forme",    titleEn: "Fit body",
    descFr: "Tu suis ton corps avec soin. La régularité paie !",
    descEn: "You track your body carefully. Consistency pays off!",
    threshold: 5, isMeasurement: true, xp: 100 },
  { id: "fifty",    icon: Trophy,   color: "#B8973E", bg: "#FAEEDA",
    titleFr: "50 séances",        titleEn: "50 sessions",
    descFr: "50 séances — tu es une vraie athlète du Pilates !",
    descEn: "50 sessions — you're a true Pilates athlete!",
    threshold: 50, xp: 500 },
  { id: "streak30", icon: Crown,    color: "#7C3AED", bg: "#EDE9FE",
    titleFr: "30 jours de suite", titleEn: "30-day streak",
    descFr: "30 jours consécutifs — tu es une légende !",
    descEn: "30 consecutive days — you are a legend!",
    threshold: 30, isStreak: true, xp: 700 },
  { id: "hundred",  icon: Sparkles, color: "#10B981", bg: "#ECFDF5",
    titleFr: "100 séances",       titleEn: "100 sessions",
    descFr: "100 séances — championne absolue ! Un accomplissement extraordinaire.",
    descEn: "100 sessions — absolute champion! An extraordinary achievement.",
    threshold: 100, xp: 1000 },
];

const calcXP = (sessions: number, streak: number) => sessions * 15 + streak * 10;
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
  const xpInLevel     = xp % 500;
  const progress      = xpInLevel / 500;

  const [selected, setSelected] = useState<typeof BADGES[0] | null>(null);

  const isEarned = (b: typeof BADGES[0]) => {
    if (b.isStreak) return streak >= b.threshold;
    if (b.isMeasurement) return totalSessions >= b.threshold;
    return totalSessions >= b.threshold;
  };

  const earned = BADGES.filter(isEarned);
  const nextBadge = BADGES.find(b => !isEarned(b));

  const getProgress = (b: typeof BADGES[0]) => {
    const current = b.isStreak ? streak : totalSessions;
    return Math.min(current / b.threshold, 1);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">
              {t("Mes réussites","My achievements")}
            </p>
            <h1 className="font-display text-2xl font-light text-foreground">Badges & XP</h1>
          </div>
        </div>

        {/* Carte XP */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 mb-5 shadow-sm overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>

          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: "radial-gradient(#B8973E, transparent)", transform: "translate(30%, -30%)" }} />

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-body text-[10px] text-white/40 uppercase tracking-widest mb-1">
                {t("Niveau","Level")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-light text-white">{level}</span>
                <span className="font-body text-xs text-white/40">{t("Rang","Rank")} #{level}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-body text-[10px] text-white/40 uppercase tracking-widest mb-1">XP Total</p>
              <span className="font-display text-4xl font-light text-gold">{xp.toLocaleString()}</span>
            </div>
          </div>

          {/* Barre XP */}
          <div className="mb-2">
            <div className="flex justify-between mb-1.5">
              <span className="font-body text-[10px] text-white/40">
                {xpInLevel} XP {t("dans ce niveau","in this level")}
              </span>
              <span className="font-body text-[10px] text-white/40">500 XP</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: (progress * 100) + "%" }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }} />
            </div>
          </div>

          {/* Stats rapides */}
          <div className="flex gap-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <Trophy size={13} className="text-gold" />
              <span className="font-body text-xs text-white">{totalSessions} {t("séances","sessions")}</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Flame size={13} className="text-red-400" />
              <span className="font-body text-xs text-white">{streak} {t("jours streak","day streak")}</span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Star size={13} className="text-gold" />
              <span className="font-body text-xs text-white">{earned.length}/{BADGES.length} {t("badges","badges")}</span>
            </div>
          </div>
        </motion.div>

        {/* Prochain badge */}
        {nextBadge && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border border-border p-4 mb-5 shadow-sm">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
              {t("Prochain badge","Next badge")}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: nextBadge.bg }}>
                <nextBadge.icon size={20} strokeWidth={1.5} style={{ color: nextBadge.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm text-foreground">
                  {t(nextBadge.titleFr, nextBadge.titleEn)}
                </p>
                <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: (getProgress(nextBadge) * 100) + "%" }}
                    transition={{ duration: 1, delay: 0.4 }}
                    style={{ backgroundColor: nextBadge.color }} />
                </div>
                <p className="font-body text-[10px] text-muted-foreground mt-1">
                  {nextBadge.isStreak ? streak : totalSessions}/{nextBadge.threshold}
                  {" · "}{nextBadge.xp} XP
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grille badges */}
        <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          {t("Tous les badges","All badges")}
        </p>

        <div className="grid grid-cols-3 gap-3 pb-4">
          {BADGES.map((badge, i) => {
            const earned = isEarned(badge);
            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setSelected(badge)}
                className="relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-left"
                style={{
                  backgroundColor: earned ? badge.bg : "var(--color-card, #FFFFFF)",
                  borderColor: earned ? badge.color + "40" : "var(--color-border, #E5E7EB)",
                }}>

                {/* Badge icône */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: earned ? badge.color + "20" : "#F3F4F6" }}>
                  {earned
                    ? <badge.icon size={22} strokeWidth={1.5} style={{ color: badge.color }} />
                    : <Lock size={18} strokeWidth={1.5} className="text-muted-foreground" />
                  }
                </div>

                <p className="font-body text-[10px] text-center leading-tight font-medium"
                  style={{ color: earned ? badge.color : "#9CA3AF" }}>
                  {t(badge.titleFr, badge.titleEn)}
                </p>

                {earned && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ backgroundColor: badge.color }}>
                    ✓
                  </div>
                )}

                {!earned && (
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: (getProgress(badge) * 100) + "%",
                        backgroundColor: badge.color
                      }} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

      </div>

      {/* Modal détail badge */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 backdrop-blur-sm"
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-background rounded-t-3xl w-full max-w-md pb-10 overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Fermer */}
              <div className="flex justify-end px-5 mb-2">
                <button onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>

              {/* Contenu */}
              <div className="px-6">
                {/* Grande icône */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{ backgroundColor: selected.bg }}>
                    {isEarned(selected)
                      ? <selected.icon size={44} strokeWidth={1.5} style={{ color: selected.color }} />
                      : <Lock size={36} strokeWidth={1.5} className="text-muted-foreground" />
                    }
                  </motion.div>
                </div>

                {/* Titre + statut */}
                <div className="text-center mb-4">
                  <p className="font-display text-2xl font-light text-foreground mb-1">
                    {t(selected.titleFr, selected.titleEn)}
                  </p>
                  {isEarned(selected)
                    ? <span className="inline-block font-body text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ color: selected.color, backgroundColor: selected.bg }}>
                        ✓ {t("Obtenu","Earned")}
                      </span>
                    : <span className="inline-block font-body text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">
                        {t("Non débloqué","Not unlocked")}
                      </span>
                  }
                </div>

                {/* Description */}
                <p className="font-body text-sm text-muted-foreground text-center leading-relaxed mb-5">
                  {t(selected.descFr, selected.descEn)}
                </p>

                {/* Progression */}
                {!isEarned(selected) && (
                  <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-body text-xs text-muted-foreground">{t("Progression","Progress")}</span>
                      <span className="font-body text-xs font-semibold" style={{ color: selected.color }}>
                        {selected.isStreak ? streak : totalSessions}/{selected.threshold}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: (getProgress(selected) * 100) + "%" }}
                        transition={{ duration: 0.8 }}
                        style={{ backgroundColor: selected.color }} />
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground mt-2 text-center">
                      {t("Plus que","Only")} {selected.threshold - (selected.isStreak ? streak : totalSessions)} {t("de plus !","more to go!")}
                    </p>
                  </div>
                )}

                {/* XP récompense */}
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-muted p-3">
                  <Star size={16} className="text-gold" />
                  <span className="font-body text-sm font-semibold text-foreground">
                    {selected.xp} XP {isEarned(selected) ? t("gagnés","earned") : t("à gagner","to earn")}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
}
