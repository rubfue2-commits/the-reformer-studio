import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

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

const LEVELS = [
  { value: 1, color: "#EF4444" },
  { value: 2, color: "#F97316" },
  { value: 3, color: "#EAB308" },
  { value: 4, color: "#22C55E" },
  { value: 5, color: "#B8973E" },
];

function ScaleSelector({
  label, sublabel, levels, value, onChange,
}: {
  label: string;
  sublabel: string;
  levels: { value: number; label: string; color: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  const active = levels.find((l) => l.value === value);
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-body font-semibold text-sm text-foreground">{label}</p>
          <p className="font-body text-xs text-muted-foreground">{sublabel}</p>
        </div>
        {active && (
          <span
            className="font-body text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: active.color, background: active.color + "18" }}
          >
            {active.label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {levels.map((l) => (
          <button key={l.value} onClick={() => onChange(l.value)} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full h-2 rounded-full transition-all"
              style={{ backgroundColor: l.color, opacity: l.value <= value ? 1 : 0.2 }}
            />
            <span className={"font-body text-[10px] " + (l.value === value ? "text-foreground font-medium" : "text-muted-foreground")}>
              {l.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryCard({ entry, t }: { entry: JournalEntry; t: (fr: string, en: string) => string }) {
  const date = new Date(entry.date);
  const avg = Math.round((entry.energy + entry.mood + entry.body + entry.sleep + (6 - entry.stress)) / 5);
  const avgColor = avg >= 4 ? "#22C55E" : avg >= 3 ? "#EAB308" : "#EF4444";
  const bars = [
    { label: t("Energie", "Energy"), val: entry.energy, color: "#B8973E" },
    { label: t("Humeur", "Mood"), val: entry.mood, color: "#22C55E" },
    { label: t("Corps", "Body"), val: entry.body, color: "#3B82F6" },
    { label: t("Sommeil", "Sleep"), val: entry.sleep, color: "#8B5CF6" },
    { label: t("Calme", "Calm"), val: 6 - entry.stress, color: "#EC4899" },
  ];
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="font-body font-semibold text-sm text-foreground">
          {date.toLocaleDateString()}
        </p>
        <span
          className="font-body text-xs font-semibold px-3 py-1 rounded-full"
          style={{ color: avgColor, background: avgColor + "18" }}
        >
          {avg}/5
        </span>
      </div>
      <div className="space-y-1.5 mb-3">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="font-body text-[10px] text-muted-foreground w-14">{b.label}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: (b.val / 5) * 100 + "%", backgroundColor: b.color }} />
            </div>
            <span className="font-body text-[10px] text-muted-foreground w-4 text-right">{b.val}</span>
          </div>
        ))}
      </div>
      {entry.note ? (
        <p className="font-body text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">{entry.note}</p>
      ) : null}
    </div>
  );
}

export default function Wellness() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [view, setView] = useState<"today" | "history">("today");
  const [saved, setSaved] = useState(false);
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [body, setBody] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [history] = useState<JournalEntry[]>([
    {
      id: "1",
      date: new Date(Date.now() - 86400000).toISOString(),
      energy: 4, mood: 4, body: 3, sleep: 4, stress: 2,
      note: t("Belle seance ce matin, je me sens legere.", "Great session this morning, feeling light."),
      tags: [],
    },
    {
      id: "2",
      date: new Date(Date.now() - 172800000).toISOString(),
      energy: 2, mood: 3, body: 2, sleep: 2, stress: 4,
      note: t("Nuit agitee, dos tendu.", "Restless night, back tension."),
      tags: [],
    },
  ]);

  const tagList = [
    t("Courbatures", "Soreness"),
    t("Digestion", "Digestion"),
    t("Stress", "Stress"),
    t("Manque de sommeil", "Sleep deprived"),
    t("Bonne forme", "Fit"),
    t("Motivation", "Motivated"),
    t("Hydratee", "Hydrated"),
    t("Relachee", "Relaxed"),
  ];

  const energyLevels = [
    { value: 1, label: t("Epuisee", "Exhausted"), color: "#EF4444" },
    { value: 2, label: t("Fatiguee", "Tired"), color: "#F97316" },
    { value: 3, label: t("Correcte", "Okay"), color: "#EAB308" },
    { value: 4, label: t("Dynamisee", "Energized"), color: "#22C55E" },
    { value: 5, label: t("Au sommet", "On top"), color: "#B8973E" },
  ];

  const moodLevels = [
    { value: 1, label: t("Difficile", "Difficult"), color: "#EF4444" },
    { value: 2, label: t("Morose", "Low"), color: "#F97316" },
    { value: 3, label: t("Neutre", "Neutral"), color: "#EAB308" },
    { value: 4, label: t("Bien", "Good"), color: "#22C55E" },
    { value: 5, label: t("Excellente", "Excellent"), color: "#B8973E" },
  ];

  const bodyLevels = [
    { value: 1, label: t("Douloureux", "Painful"), color: "#EF4444" },
    { value: 2, label: t("Tendu", "Tense"), color: "#F97316" },
    { value: 3, label: t("Correct", "Okay"), color: "#EAB308" },
    { value: 4, label: t("Souple", "Flexible"), color: "#22C55E" },
    { value: 5, label: t("Parfait", "Perfect"), color: "#B8973E" },
  ];

  const sleepLevels = [
    { value: 1, label: t("Mauvais", "Poor"), color: "#EF4444" },
    { value: 2, label: t("Agite", "Restless"), color: "#F97316" },
    { value: 3, label: t("Acceptable", "Acceptable"), color: "#EAB308" },
    { value: 4, label: t("Bon", "Good"), color: "#22C55E" },
    { value: 5, label: t("Profond", "Deep"), color: "#B8973E" },
  ];

  const stressLevels = [
    { value: 1, label: t("Tres stressee", "Very stressed"), color: "#EF4444" },
    { value: 2, label: t("Stressee", "Stressed"), color: "#F97316" },
    { value: 3, label: t("Moderee", "Moderate"), color: "#EAB308" },
    { value: 4, label: t("Sereine", "Calm"), color: "#22C55E" },
    { value: 5, label: t("Zen", "Zen"), color: "#B8973E" },
  ];

  const globalScore = Math.round((energy + mood + body + sleep + (6 - stress)) / 5);
  const scoreColor = globalScore >= 4 ? "#22C55E" : globalScore >= 3 ? "#EAB308" : "#EF4444";

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4">
        <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {t("Mon journal", "My journal")}
        </p>
        <h1 className="font-display text-3xl text-foreground">{t("Bien-etre", "Wellness")}</h1>
      </div>

      <div className="flex px-6 gap-3 mb-6">
        <button
          onClick={() => setView("today")}
          className={"flex-1 py-2.5 rounded-xl font-body text-sm font-medium transition-all " + (view === "today" ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground")}
        >
          {t("Aujourd'hui", "Today")}
        </button>
        <button
          onClick={() => setView("history")}
          className={"flex-1 py-2.5 rounded-xl font-body text-sm font-medium transition-all " + (view === "history" ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground")}
        >
          {t("Historique", "History")}
        </button>
      </div>

      {view === "today" && (
        <div className="px-6 space-y-4">
          <div className="rounded-2xl bg-card border border-border p-4 flex items-center justify-between">
            <div>
              <p className="font-body text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
              <p className="font-body font-semibold text-sm text-foreground mt-0.5">
                {globalScore >= 4 ? t("Vous etes en forme !", "You are in great shape!") : globalScore >= 3 ? t("Journee correcte", "Decent day") : t("Prenez soin de vous", "Take care of yourself")}
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
              style={{ backgroundColor: scoreColor + "18", border: "2px solid " + scoreColor }}
            >
              <span className="font-display text-2xl" style={{ color: scoreColor }}>{globalScore}</span>
              <span className="font-body text-[9px] text-muted-foreground">/5</span>
            </div>
          </div>

          <ScaleSelector label={t("Niveau d'energie", "Energy level")} sublabel={t("Comment vous sentez-vous ?", "How do you feel?")} levels={energyLevels} value={energy} onChange={setEnergy} />
          <ScaleSelector label={t("Humeur", "Mood")} sublabel={t("Votre etat emotionnel", "Your emotional state")} levels={moodLevels} value={mood} onChange={setMood} />
          <ScaleSelector label={t("Ressenti corporel", "Body feeling")} sublabel={t("Comment se porte votre corps ?", "How is your body?")} levels={bodyLevels} value={body} onChange={setBody} />
          <ScaleSelector label={t("Qualite du sommeil", "Sleep quality")} sublabel={t("Comment avez-vous dormi ?", "How did you sleep?")} levels={sleepLevels} value={sleep} onChange={setSleep} />
          <ScaleSelector label={t("Stress", "Stress")} sublabel={t("1 = tres stressee, 5 = sereine", "1 = very stressed, 5 = calm")} levels={stressLevels} value={stress} onChange={setStress} />

          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="font-body font-semibold text-sm text-foreground mb-3">{t("Ce que je ressens", "What I feel")}</p>
            <div className="flex flex-wrap gap-2">
              {tagList.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={"font-body text-xs px-3 py-1.5 rounded-full border transition-all " + (tags.includes(tag) ? "bg-primary/10 border-primary text-primary font-medium" : "bg-muted border-border text-muted-foreground")}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="font-body font-semibold text-sm text-foreground mb-1">{t("Note personnelle", "Personal note")}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("Je me sens...", "I feel...")}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-primary"
            />
          </div>

          {saved ? (
            <div className="rounded-xl bg-green-50 border border-green-200 py-3 text-center">
              <p className="font-body text-sm text-green-700 font-medium">{t("Journal enregistre !", "Journal saved!")}</p>
            </div>
          ) : (
            <button onClick={handleSave} className="w-full rounded-xl bg-foreground text-background font-body font-semibold py-3">
              {t("Enregistrer ma journee", "Save my day")}
            </button>
          )}
        </div>
      )}

      {view === "history" && (
        <div className="px-6 space-y-3">
          {history.map((entry) => (
            <HistoryCard key={entry.id} entry={entry} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
