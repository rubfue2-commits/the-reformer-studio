import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Droplets, Moon, Zap,
  Heart, Wind, ThumbsUp, Check, Flame, TrendingUp,
  Calendar, BookOpen, Pencil
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayEntry {
  date: string;
  energie: number;
  humeur: number;
  sommeil: number;
  douleurs: number;
  hydratation: number;
  note?: string;
  sessionDone: boolean;
}

// ─── Données historiques ──────────────────────────────────────────────────────

const HISTORY: DayEntry[] = [
  { date: "2026-02-20", energie: 4, humeur: 5, sommeil: 4, douleurs: 2, hydratation: 3, sessionDone: true,  note: "Super séance aujourd'hui, je me sens légère !" },
  { date: "2026-02-19", energie: 3, humeur: 4, sommeil: 3, douleurs: 3, hydratation: 2, sessionDone: true },
  { date: "2026-02-18", energie: 5, humeur: 5, sommeil: 5, douleurs: 1, hydratation: 4, sessionDone: true,  note: "Journée parfaite, énergie au max." },
  { date: "2026-02-17", energie: 2, humeur: 3, sommeil: 2, douleurs: 4, hydratation: 2, sessionDone: false, note: "Fatiguée, j'ai préféré me reposer." },
  { date: "2026-02-16", energie: 4, humeur: 4, sommeil: 4, douleurs: 2, hydratation: 3, sessionDone: true },
  { date: "2026-02-15", energie: 3, humeur: 3, sommeil: 3, douleurs: 3, hydratation: 3, sessionDone: false },
  { date: "2026-02-14", energie: 5, humeur: 5, sommeil: 4, douleurs: 1, hydratation: 4, sessionDone: true,  note: "Saint-Valentin 💛 Séance spéciale !" },
];

const todayStr = "2026-02-21";

// ─── Config métriques ─────────────────────────────────────────────────────────

const METRICS = [
  {
    key: "energie" as const,
    label: "Énergie",
    icon: Zap,
    color: "#B8973E",
    emojis: ["😴", "😪", "😐", "⚡", "🔥"],
    labels: ["Épuisée", "Fatiguée", "Normale", "Énergique", "Au top !"],
  },
  {
    key: "humeur" as const,
    label: "Humeur",
    icon: Heart,
    color: "#EC4899",
    emojis: ["😔", "😕", "😊", "😄", "🥳"],
    labels: ["Déprimée", "Morose", "Bien", "Joyeuse", "Euphorique"],
  },
  {
    key: "sommeil" as const,
    label: "Sommeil",
    icon: Moon,
    color: "#818CF8",
    emojis: ["😩", "😫", "😴", "😌", "✨"],
    labels: ["Très mal", "Mal dormi", "Passable", "Bien dormi", "Parfait"],
  },
  {
    key: "douleurs" as const,
    label: "Douleurs",
    icon: Wind,
    color: "#F97316",
    emojis: ["🤕", "😣", "😤", "🙂", "😎"],
    labels: ["Intenses", "Présentes", "Légères", "Minimes", "Aucune"],
  },
  {
    key: "hydratation" as const,
    label: "Hydratation",
    icon: Droplets,
    color: "#60A5FA",
    emojis: ["🏜️", "😤", "💧", "💦", "🌊"],
    labels: ["Très peu", "Peu", "Correct", "Bien", "Parfait"],
  },
];

type MetricKey = "energie" | "humeur" | "sommeil" | "douleurs" | "hydratation";

const DAY_NAMES = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const formatDate = (str: string) => {
  const d = new Date(str);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};

const shortDate = (str: string) => {
  const d = new Date(str);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()}`;
};

const getScoreColor = (v: number) => {
  if (v >= 4) return "#4CAF50";
  if (v >= 3) return "#B8973E";
  return "#EF4444";
};

// ─── Composant Score bar ──────────────────────────────────────────────────────

const ScoreBar = ({ value, color }: { value: number; color: string }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-2 flex-1 rounded-full transition-all"
        style={{ backgroundColor: i <= value ? color : "hsl(27,8%,90%)" }} />
    ))}
  </div>
);

// ─── Page principale ──────────────────────────────────────────────────────────

const Wellness = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"journal" | "historique" | "tendances">("journal");
  const [savedToday, setSavedToday] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayEntry | null>(null);

  // État saisie du jour
  const [todayEntry, setTodayEntry] = useState<Omit<DayEntry, "date" | "sessionDone">>({
    energie: 0,
    humeur: 0,
    sommeil: 0,
    douleurs: 0,
    hydratation: 0,
    note: "",
  });

  const allFilled = METRICS.every(m => todayEntry[m.key] > 0);
  const avgScore = METRICS.reduce((acc, m) => acc + (todayEntry[m.key] || 0), 0) / METRICS.length;

  const setMetric = (key: MetricKey, value: number) => {
    setTodayEntry(prev => ({ ...prev, [key]: value }));
  };

  // Calcul tendances
  const avgOf = (key: MetricKey) =>
    Math.round((HISTORY.reduce((acc, d) => acc + d[key], 0) / HISTORY.length) * 10) / 10;

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-3xl font-light text-foreground">Bien-être</h1>
            <p className="font-body text-sm text-muted-foreground mt-0.5">Écoute ton corps chaque jour</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-sm">
            <Heart size={18} className="text-pink-400" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-5">
          {([
            { id: "journal",     label: "Journal" },
            { id: "historique",  label: "Historique" },
            { id: "tendances",   label: "Tendances" },
          ] as { id: typeof tab; label: string }[]).map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 pb-3 font-body text-xs transition-all ${
                tab === id ? "border-b-2 border-gold text-foreground -mb-[1px]" : "text-muted-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* ─── JOURNAL DU JOUR ─── */}
            {tab === "journal" && (
              <div className="space-y-4 pb-6">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-muted-foreground capitalize">{formatDate(todayStr)}</p>
                  {allFilled && !savedToday && (
                    <span className="font-body text-[10px] text-gold">Score : {avgScore.toFixed(1)}/5</span>
                  )}
                </div>

                {savedToday ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="rounded-3xl bg-green-50 border border-green-200 p-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto mb-3">
                      <Check size={28} className="text-green-500" strokeWidth={2} />
                    </div>
                    <h3 className="font-display text-xl text-green-700 mb-1">Journal enregistré !</h3>
                    <p className="font-body text-sm text-green-600 mb-1">Score du jour : {avgScore.toFixed(1)}/5</p>
                    <p className="font-body text-xs text-green-500">Reviens demain pour ton bilan quotidien 🌱</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Métriques */}
                    {METRICS.map((metric, i) => {
                      const Icon = metric.icon;
                      const val = todayEntry[metric.key];
                      return (
                        <motion.div key={metric.key} initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="rounded-2xl bg-card p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon size={16} strokeWidth={1.5} style={{ color: metric.color }} />
                            <span className="font-body text-sm font-medium text-foreground">{metric.label}</span>
                            {val > 0 && (
                              <span className="ml-auto font-body text-xs text-muted-foreground">
                                {metric.labels[val - 1]}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between gap-2">
                            {metric.emojis.map((emoji, j) => {
                              const v = j + 1;
                              const selected = val === v;
                              return (
                                <button key={v} onClick={() => setMetric(metric.key, v)}
                                  className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2.5 transition-all ${
                                    selected ? "scale-110" : "opacity-50 hover:opacity-80"
                                  }`}
                                  style={selected ? { background: metric.color + "15", border: `1.5px solid ${metric.color}` } : {}}>
                                  <span style={{ fontSize: 22 }}>{emoji}</span>
                                  <span className="font-body text-[8px] text-muted-foreground">{v}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Note libre */}
                    <div className="rounded-2xl bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Pencil size={16} strokeWidth={1.5} className="text-muted-foreground" />
                        <span className="font-body text-sm font-medium text-foreground">Note du jour</span>
                        <span className="font-body text-[10px] text-muted-foreground ml-auto">Optionnel</span>
                      </div>
                      <textarea
                        value={todayEntry.note}
                        onChange={e => setTodayEntry(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Comment tu te sens aujourd'hui ? Une pensée, une observation sur ta pratique..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                      />
                    </div>

                    {/* CTA */}
                    <motion.button whileTap={{ scale: 0.98 }}
                      disabled={!allFilled}
                      onClick={() => setSavedToday(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium tracking-wide text-primary-foreground transition-opacity disabled:opacity-30">
                      <BookOpen size={16} strokeWidth={1.5} />
                      Enregistrer mon bilan du jour
                    </motion.button>

                    {!allFilled && (
                      <p className="text-center font-body text-[10px] text-muted-foreground">
                        Remplis toutes les métriques pour enregistrer
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ─── HISTORIQUE ─── */}
            {tab === "historique" && (
              <div className="pb-6">
                {/* Vue semaine */}
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                  {HISTORY.map(day => {
                    const avg = (day.energie + day.humeur + day.sommeil + day.douleurs + day.hydratation) / 5;
                    const color = getScoreColor(avg);
                    return (
                      <button key={day.date} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                        className={`flex flex-col items-center gap-1.5 shrink-0 rounded-2xl px-3 py-3 transition-all ${
                          selectedDay?.date === day.date ? "bg-card shadow-sm ring-1 ring-gold" : "bg-card"
                        }`}>
                        <span className="font-body text-[10px] text-muted-foreground">{shortDate(day.date)}</span>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: color + "20" }}>
                          <span className="font-display text-sm" style={{ color }}>{avg.toFixed(0)}</span>
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: day.sessionDone ? "#4CAF50" : "hsl(27,8%,85%)" }} />
                      </button>
                    );
                  })}
                </div>

                {/* Détail jour sélectionné */}
                <AnimatePresence>
                  {selectedDay && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                      <div className="rounded-2xl bg-card border border-gold/20 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-body text-xs font-medium text-foreground capitalize">
                            {formatDate(selectedDay.date)}
                          </p>
                          {selectedDay.sessionDone && (
                            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-body text-[10px] text-green-700">
                              <Flame size={9} /> Séance faite
                            </span>
                          )}
                        </div>
                        <div className="space-y-2.5">
                          {METRICS.map(m => (
                            <div key={m.key} className="flex items-center gap-3">
                              <span className="font-body text-[10px] text-muted-foreground w-20 shrink-0">{m.label}</span>
                              <div className="flex-1">
                                <ScoreBar value={selectedDay[m.key]} color={m.color} />
                              </div>
                              <span className="font-body text-[10px] text-muted-foreground w-4 text-right">
                                {selectedDay[m.key]}
                              </span>
                            </div>
                          ))}
                        </div>
                        {selectedDay.note && (
                          <div className="mt-3 rounded-xl bg-muted p-3">
                            <p className="font-body text-xs text-muted-foreground italic">"{selectedDay.note}"</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Liste complète */}
                <div className="rounded-3xl bg-card shadow-sm overflow-hidden">
                  {HISTORY.map((day, i) => {
                    const avg = (day.energie + day.humeur + day.sommeil + day.douleurs + day.hydratation) / 5;
                    const color = getScoreColor(avg);
                    return (
                      <button key={day.date} onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all ${
                          i < HISTORY.length - 1 ? "border-b border-border" : ""
                        } ${selectedDay?.date === day.date ? "bg-gold/5" : ""}`}>
                        <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: color + "15" }}>
                          <span className="font-display text-base" style={{ color }}>{avg.toFixed(1)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-foreground capitalize">{shortDate(day.date)}</p>
                          <div className="flex gap-1 mt-1">
                            {METRICS.map(m => (
                              <div key={m.key} className="h-1.5 w-6 rounded-full"
                                style={{ backgroundColor: m.color, opacity: day[m.key] / 5 }} />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {day.sessionDone && <Flame size={12} className="text-gold" />}
                          {day.note && <Pencil size={10} className="text-muted-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── TENDANCES ─── */}
            {tab === "tendances" && (
              <div className="pb-6 space-y-4">
                <p className="font-body text-xs text-muted-foreground">Moyennes sur les 7 derniers jours</p>

                {/* Score global */}
                <div className="rounded-3xl bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-light text-foreground">Score global</h3>
                    <span className="font-display text-2xl text-gold">
                      {(METRICS.reduce((acc, m) => acc + avgOf(m.key), 0) / METRICS.length).toFixed(1)}
                      <span className="font-body text-sm text-muted-foreground">/5</span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    {METRICS.map(m => {
                      const avg = avgOf(m.key);
                      const Icon = m.icon;
                      return (
                        <div key={m.key} className="flex items-center gap-3">
                          <Icon size={14} strokeWidth={1.5} style={{ color: m.color }} className="shrink-0" />
                          <span className="font-body text-xs text-foreground w-20 shrink-0">{m.label}</span>
                          <div className="flex-1">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <motion.div className="h-full rounded-full"
                                style={{ backgroundColor: m.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(avg / 5) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }} />
                            </div>
                          </div>
                          <span className="font-body text-xs font-medium shrink-0 w-6 text-right"
                            style={{ color: getScoreColor(avg) }}>
                            {avg}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Corrélation séances */}
                <div className="rounded-3xl bg-card p-5 shadow-sm">
                  <h3 className="font-display text-lg font-light text-foreground mb-3">Impact des séances</h3>
                  {(() => {
                    const withSession = HISTORY.filter(d => d.sessionDone);
                    const withoutSession = HISTORY.filter(d => !d.sessionDone);
                    const avgWith = withSession.length
                      ? (withSession.reduce((acc, d) => acc + (d.energie + d.humeur) / 2, 0) / withSession.length).toFixed(1)
                      : "—";
                    const avgWithout = withoutSession.length
                      ? (withoutSession.reduce((acc, d) => acc + (d.energie + d.humeur) / 2, 0) / withoutSession.length).toFixed(1)
                      : "—";
                    return (
                      <div className="flex gap-3">
                        <div className="flex-1 rounded-2xl p-4 text-center" style={{ background: "#4CAF5015" }}>
                          <Flame size={18} className="text-green-500 mx-auto mb-1" strokeWidth={1.5} />
                          <p className="font-display text-2xl" style={{ color: "#4CAF50" }}>{avgWith}</p>
                          <p className="font-body text-[10px] text-muted-foreground mt-0.5">Jours avec séance</p>
                          <p className="font-body text-[9px] text-muted-foreground">Énergie & humeur moy.</p>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp size={16} className="text-gold" />
                        </div>
                        <div className="flex-1 rounded-2xl p-4 text-center bg-muted">
                          <Moon size={18} className="text-muted-foreground mx-auto mb-1" strokeWidth={1.5} />
                          <p className="font-display text-2xl text-muted-foreground">{avgWithout}</p>
                          <p className="font-body text-[10px] text-muted-foreground mt-0.5">Jours sans séance</p>
                          <p className="font-body text-[9px] text-muted-foreground">Énergie & humeur moy.</p>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="font-body text-xs text-muted-foreground text-center mt-3 leading-relaxed">
                    Le Pilates booste ton énergie et ton humeur de manière significative 💛
                  </p>
                </div>

                {/* Conseils personnalisés */}
                <div className="rounded-3xl bg-card p-5 shadow-sm">
                  <h3 className="font-display text-lg font-light text-foreground mb-3">Conseils personnalisés</h3>
                  <div className="space-y-3">
                    {[
                      avgOf("sommeil") < 3.5 && { icon: Moon, color: "#818CF8", text: "Ton sommeil est en dessous de la moyenne. Essaie une séance de relaxation le soir avant de dormir." },
                      avgOf("hydratation") < 3 && { icon: Droplets, color: "#60A5FA", text: "Pense à boire plus d'eau ! Vise 1,5 à 2L par jour pour optimiser ta récupération." },
                      avgOf("energie") >= 4 && { icon: Zap, color: "#B8973E", text: "Excellent niveau d'énergie ! Tu es prête pour des séances plus intenses cette semaine." },
                      avgOf("douleurs") > 3 && { icon: Wind, color: "#F97316", text: "Des douleurs persistantes ? N'hésite pas à adapter l'intensité de tes séances." },
                    ].filter(Boolean).map((conseil: any, i) => {
                      const Icon = conseil.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 rounded-xl p-3"
                          style={{ background: conseil.color + "10" }}>
                          <Icon size={16} strokeWidth={1.5} style={{ color: conseil.color }} className="shrink-0 mt-0.5" />
                          <p className="font-body text-xs text-foreground leading-relaxed">{conseil.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Wellness;
