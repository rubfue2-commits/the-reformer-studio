import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface JournalEntry {
  id: string;
  date: string;
  energy: number;
  mood: number;
  body: number;
  sleep: number;
  stress: number;
  note: string;
  tags: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ENERGY_LEVELS = [
  { value: 1, fr: "Epuisee",        en: "Exhausted",     color: "#EF4444", bg: "#FEF2F2", bar: "w-1/5"  },
  { value: 2, fr: "Fatiguee",       en: "Tired",         color: "#F97316", bg: "#FFF7ED", bar: "w-2/5"  },
  { value: 3, fr: "Correcte",       en: "Okay",          color: "#EAB308", bg: "#FEFCE8", bar: "w-3/5"  },
  { value: 4, fr: "Dynamisee",      en: "Energized",     color: "#22C55E", bg: "#F0FDF4", bar: "w-4/5"  },
  { value: 5, fr: "Au sommet",      en: "On top",        color: "#B8973E", bg: "#FFFBEB", bar: "w-full" },
];

const MOOD_LEVELS = [
  { value: 1, fr: "Difficile",      en: "Difficult",     color: "#EF4444" },
  { value: 2, fr: "Morose",         en: "Low",           color: "#F97316" },
  { value: 3, fr: "Neutre",         en: "Neutral",       color: "#EAB308" },
  { value: 4, fr: "Bien",           en: "Good",          color: "#22C55E" },
  { value: 5, fr: "Excellente",     en: "Excellent",     color: "#B8973E" },
];

const BODY_LEVELS = [
  { value: 1, fr: "Douloureux",     en: "Painful",       color: "#EF4444" },
  { value: 2, fr: "Tendu",          en: "Tense",         color: "#F97316" },
  { value: 3, fr: "Correct",        en: "Okay",          color: "#EAB308" },
  { value: 4, fr: "Souple",         en: "Flexible",      color: "#22C55E" },
  { value: 5, fr: "Parfait",        en: "Perfect",       color: "#B8973E" },
];

const SLEEP_LEVELS = [
  { value: 1, fr: "Mauvais",        en: "Poor",          color: "#EF4444" },
  { value: 2, fr: "Agite",          en: "Restless",      color: "#F97316" },
  { value: 3, fr: "Acceptable",     en: "Acceptable",    color: "#EAB308" },
  { value: 4, fr: "Bon",            en: "Good",          color: "#22C55E" },
  { value: 5, fr: "Profond",        en: "Deep",          color: "#B8973E" },
];

const STRESS_LEVELS = [
  { value: 1, fr: "Tres stressee",  en: "Very stressed", color: "#EF4444" },
  { value: 2, fr: "Stressee",       en: "Stressed",      color: "#F97316" },
  { value: 3, fr: "Moderee",        en: "Moderate",      color: "#EAB308" },
  { value: 4, fr: "Sereine",        en: "Calm",          color: "#22C55E" },
  { value: 5, fr: "Zen",            en: "Zen",           color: "#B8973E" },
];

const TAGS_FR = ["Courbatures", "Inflammation", "Digestion", "Regles", "Stress", "Manque de sommeil", "Bonne forme", "Motivation", "Hydratee", "Relachee"];
const TAGS_EN = ["Soreness", "Inflammation", "Digestion", "Period", "Stress", "Sleep deprived", "Fit", "Motivated", "Hydrated", "Relaxed"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScaleSelector({
  label, sublabel, levels, value, onChange,
}: {
  label: string; sublabel: string;
  levels: { value: number; fr: string; en: string; color: string }[];
  value: number; onChange: (v: number) => void;
}) {
  const active = levels.find(l => l.value === value);
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-body font-semibold text-sm text-foreground">{label}</p>
          <p className="font-body text-xs text-muted-foreground">{sublabel}</p>
        </div>
        {active && (
          <span className="font-body text-xs font-semibold px-3 py-1 rounded-full" style={{ color: active.color, background: active.color + "18" }}>
            {active.fr}
          </span>
        )}
      </div>
      {/* Scale dots */}
      <div className="flex items-center gap-2">
        {levels.map(l => (
          <button key={l.value} onClick={() => onChange(l.value)}
            className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className={"w-full h-2 rounded-full transition-all " + (l.value <= value ? "opacity-100" : "opacity-20")}
              style={{ backgroundColor: l.color }} />
            <span className={"font-body text-[10px] font-medium transition-colors " + (l.value === value ? "text-foreground" : "text-muted-foreground")}>
              {l.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryCard({ entry, fr }: { entry: JournalEntry; fr: boolean }) {
  const date = new Date(entry.date);
  const dayName = date.toLocaleDateString(fr ? "fr-FR" : "en-US", { weekday: "long" });
  const dayNum = date.toLocaleDateString(fr ? "fr-FR" : "en-US", { day: "numeric", month: "long" });
  const avg = Math.round((entry.energy + entry.mood + entry.body + entry.sleep + (6 - entry.stress)) / 5);
  const avgColor = avg >= 4 ? "#22C55E" : avg >= 3 ? "#EAB308" : "#EF4444";
  const avgLabel = avg >= 4 ? (fr ? "Bonne journee" : "Good day") : avg >= 3 ? (fr ? "Journee correcte" : "Okay day") : (fr ? "Journee difficile" : "Hard day");

  const bars = [
    { label: fr ? "Energie" : "Energy",  val: entry.energy,           color: "#B8973E" },
    { label: fr ? "Humeur" : "Mood",     val: entry.mood,             color: "#22C55E" },
    { label: fr ? "Corps" : "Body",      val: entry.body,             color: "#3B82F6" },
    { label: fr ? "Sommeil" : "Sleep",   val: entry.sleep,            color: "#8B5CF6" },
    { label: fr ? "Calme" : "Calm",      val: 6 - entry.stress,       color: "#EC4899" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-body text-xs text-muted-foreground capitalize">{dayName}</p>
          <p className="font-body font-semibold text-sm text-foreground capitalize">{dayNum}</p>
        </div>
        <span className="font-body text-xs font-semibold px-3 py-1 rounded-full" style={{ color: avgColor, background: avgColor + "18" }}>
          {avgLabel}
        </span>
      </div>

      {/* Mini bar chart */}
      <div className="space-y-1.5 mb-3">
        {bars.map(b => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="font-body text-[10px] text-muted-foreground w-14 flex-shrink-0">{b.label}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: (b.val / 5 * 100) + "%", backgroundColor: b.color }} />
            </div>
            <span className="font-body text-[10px] text-muted-foreground w-4 text-right">{b.val}</span>
          </div>
        ))}
      </div>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {entry.tags.map(tag => (
            <span key={tag} className="font-body text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">{tag}</span>
          ))}
        </div>
      )}
      {entry.note && (
        <p className="font-body text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">{entry.note}</p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Wellness() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fr = language === "fr";

  const [view, setView] = useState<"today" | "history">("today");
  const [saved, setSaved] = useState(false);

  // Today's form
  const [energy, setEnergy]  = useState(3);
  const [mood, setMood]      = useState(3);
  const [body, setBody]      = useState(3);
  const [sleep, setSleep]    = useState(3);
  const [stress, setStress]  = useState(3);
  const [note, setNote]      = useState("");
  const [tags, setTags]      = useState<string[]>([]);

  // Mock history
  const [history] = useState<JournalEntry[]>([
    { id: "1", date: new Date(Date.now() - 86400000).toISOString(), energy: 4, mood: 4, body: 3, sleep: 4, stress: 2, note: fr ? "Belle seance ce matin, je me sens legere." : "Great session this morning, feeling light.", tags: [fr ? "Bonne forme" : "Fit", fr ? "Motivee" : "Motivated"]  },
    { id: "2", date: new Date(Date.now() - 172800000).toISOString(), energy: 2, mood: 3, body: 2, sleep: 2, stress: 4, note: fr ? "Nuit agitee, dos tendu apres le travail." : "Restless night, back tension after work.", tags: [fr ? "Courbatures" : "Soreness", fr ? "Stress" : "Stress"] },
    { id: "3", date: new Date(Date.now() - 259200000).toISOString(), energy: 5, mood: 5, body: 5, sleep: 5, stress: 1, note: "", tags: [fr ? "Relachee" : "Relaxed", fr ? "Hydratee" : "Hydrated"] },
  ]);

  const today = new Date().toLocaleDateString(fr ? "fr-FR" : "en-US", { weekday: "long", day: "numeric", month: "long" });

  const globalScore = Math.round((energy + mood + body + sleep + (6 - stress)) / 5);
  const scoreLabel = globalScore >= 4 ? (fr ? "Vous etes en pleine forme !" : "You are in great shape!") : globalScore >= 3 ? (fr ? "Journee correcte" : "Decent day") : (fr ? "Prenez soin de vous" : "Take care of yourself");
  const scoreColor = globalScore >= 4 ? "#22C55E" : globalScore >= 3 ? "#EAB308" : "#EF4444";

  const tagList = fr ? TAGS_FR : TAGS_EN;
  const toggleTag = (tag: string) => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); }, 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {fr ? "Mon journal" : "My journal"}
        </p>
        <h1 className="font-display text-3xl text-foreground">{fr ? "Bien-etre" : "Wellness"}</h1>
      </div>

      {/* Tabs */}
      <div className="flex px-6 gap-3 mb-6">
        {[{ id: "today", fr: "Aujourd'hui", en: "Today" }, { id: "history", fr: "Historique", en: "History" }].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id as "today" | "history")}
            className={"flex-1 py-2.5 rounded-xl font-body text-sm font-medium transition-all " + (view === tab.id ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground")}>
            {fr ? tab.fr : tab.en}
          </button>
        ))}
      </div>

      {view === "today" && (
        <div className="px-6 space-y-4">
          {/* Date + Global score */}
          <div className="rounded-2xl bg-card border border-border p-4 flex items-center justify-between">
            <div>
              <p className="font-body text-xs text-muted-foreground capitalize">{today}</p>
              <p className="font-body font-semibold text-sm text-foreground mt-0.5">{scoreLabel}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center" style={{ backgroundColor: scoreColor + "18", border: "2px solid " + scoreColor }}>
              <span className="font-display text-2xl" style={{ color: scoreColor }}>{globalScore}</span>
              <span className="font-body text-[9px] text-muted-foreground">/5</span>
            </div>
          </div>

          {/* Scales */}
          <ScaleSelector
            label={fr ? "Niveau d'energie" : "Energy level"}
            sublabel={fr ? "Comment vous sentez-vous physiquement ?" : "How do you feel physically?"}
            levels={ENERGY_LEVELS} value={energy} onChange={setEnergy} />

          <ScaleSelector
            label={fr ? "Humeur generale" : "Overall mood"}
            sublabel={fr ? "Quel est votre etat emotionnel aujourd'hui ?" : "What is your emotional state today?"}
            levels={MOOD_LEVELS} value={mood} onChange={setMood} />

          <ScaleSelector
            label={fr ? "Ressenti corporel" : "Body feeling"}
            sublabel={fr ? "Comment se porte votre corps ?" : "How is your body doing?"}
            levels={BODY_LEVELS} value={body} onChange={setBody} />

          <ScaleSelector
            label={fr ? "Qualite du sommeil" : "Sleep quality"}
            sublabel={fr ? "Comment avez-vous dormi ?" : "How did you sleep?"}
            levels={SLEEP_LEVELS} value={sleep} onChange={setSleep} />

          <ScaleSelector
            label={fr ? "Niveau de stress" : "Stress level"}
            sublabel={fr ? "1 = tres stressee, 5 = totalement sereine" : "1 = very stressed, 5 = totally calm"}
            levels={STRESS_LEVELS} value={stress} onChange={setStress} />

          {/* Tags */}
          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="font-body font-semibold text-sm text-foreground mb-1">
              {fr ? "Ce que je ressens" : "What I feel"}
            </p>
            <p className="font-body text-xs text-muted-foreground mb-3">
              {fr ? "Selectionnez tout ce qui s'applique" : "Select all that apply"}
            </p>
            <div className="flex flex-wrap gap-2">
              {tagList.map(tag => {
                const active = tags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={"font-body text-xs px-3 py-1.5 rounded-full border transition-all " + (active ? "bg-primary/10 border-primary text-primary font-medium" : "bg-muted border-border text-muted-foreground")}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note libre */}
          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="font-body font-semibold text-sm text-foreground mb-1">
              {fr ? "Note personnelle" : "Personal note"}
            </p>
            <p className="font-body text-xs text-muted-foreground mb-3">
              {fr ? "Un mot sur votre journee, une intention..." : "A word about your day, an intention..."}
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={fr ? "Je me sens... Aujourd'hui j'ai envie de..." : "I feel... Today I want to..."}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Save */}
          {saved ? (
            <div className="rounded-xl bg-green-50 border border-green-200 py-3 text-center">
              <p className="font-body text-sm text-green-700 font-medium">
                {fr ? "Journal enregistre !" : "Journal saved!"}
              </p>
            </div>
          ) : (
            <button onClick={handleSave}
              className="w-full rounded-xl bg-foreground text-background font-body font-semibold py-3">
              {fr ? "Enregistrer ma journee" : "Save my day"}
            </button>
          )}

          <div className="h-2" />
        </div>
      )}

      {view === "history" && (
        <div className="px-6 space-y-3">
          {history.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-8 text-center">
              <p className="font-display text-xl text-foreground mb-2">{fr ? "Aucune entree" : "No entries yet"}</p>
              <p className="font-body text-sm text-muted-foreground">{fr ? "Commencez votre journal aujourd'hui." : "Start your journal today."}</p>
            </div>
          ) : (
            history.map(entry => <HistoryCard key={entry.id} entry={entry} fr={fr} />)
          )}
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around px-4 py-3">
        {[
          { path: "/home",     label: fr ? "Accueil" : "Home",     active: false },
          { path: "/library",  label: fr ? "Seances" : "Sessions", active: false },
          { path: "/progress", label: fr ? "Progres" : "Progress", active: false },
          { path: "/profile",  label: fr ? "Profil" : "Profile",   active: false },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={"flex flex-col items-center gap-1 font-body text-[10px] uppercase tracking-wide " + (item.active ? "text-primary" : "text-muted-foreground")}>
            <span className={"w-1 h-1 rounded-full " + (item.active ? "bg-primary" : "bg-transparent")} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
