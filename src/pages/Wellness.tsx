import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWellness } from "@/hooks/useWellness";

const DEMO_EMAIL = "rubenfuentes@orange.fr";

const DEMO_HISTORY = [
  { id: "1", entry_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    energy: 4, mood: 4, body: 3, sleep: 4, stress: 2, note: "Belle séance ce matin.", tags: [] },
  { id: "2", entry_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    energy: 2, mood: 3, body: 2, sleep: 2, stress: 4, note: "Nuit agitée, dos tendu.", tags: [] },
];

function ScaleRow({ label, sublabel, levels, value, onChange }: {
  label: string; sublabel: string;
  levels: { value: number; label: string; color: string }[];
  value: number; onChange: (v: number) => void;
}) {
  const active = levels.find(l => l.value === value);
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <p className="font-body font-semibold text-sm text-foreground">{label}</p>
          <p className="font-body text-xs text-muted-foreground">{sublabel}</p>
        </div>
        {active && (
          <span className="font-body text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
            style={{ color: active.color, background: active.color + "18" }}>
            {active.label}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {levels.map(l => (
          <button key={l.value} onClick={() => onChange(l.value)} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-2 rounded-full transition-all"
              style={{ backgroundColor: l.color, opacity: l.value <= value ? 1 : 0.2 }} />
            <span className={"font-body text-[10px] " + (l.value === value ? "text-foreground font-semibold" : "text-muted-foreground")}>
              {l.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryCard({ entry, t }: { entry: any; t: (fr: string, en: string) => string }) {
  const avg = Math.round((entry.energy + entry.mood + entry.body + entry.sleep + (6 - entry.stress)) / 5);
  const color = avg >= 4 ? "#22C55E" : avg >= 3 ? "#EAB308" : "#EF4444";
  const bars = [
    { label: t("Énergie","Energy"), val: entry.energy, color: "#B8973E" },
    { label: t("Humeur","Mood"),   val: entry.mood,   color: "#22C55E" },
    { label: t("Corps","Body"),    val: entry.body,   color: "#3B82F6" },
    { label: t("Sommeil","Sleep"), val: entry.sleep,  color: "#8B5CF6" },
    { label: t("Calme","Calm"),    val: 6-entry.stress, color: "#EC4899" },
  ];
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-body font-semibold text-sm text-foreground">
          {new Date(entry.entry_date).toLocaleDateString()}
        </p>
        <span className="font-body text-xs font-semibold px-3 py-1 rounded-full"
          style={{ color, background: color + "18" }}>{avg}/5</span>
      </div>
      <div className="space-y-1.5 mb-2">
        {bars.map(b => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="font-body text-[10px] text-muted-foreground w-14 flex-shrink-0">{b.label}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: (b.val/5*100)+"%" , backgroundColor: b.color }} />
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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = user?.email === DEMO_EMAIL;

  const { entries, todayEntry, saveEntry, loading } = useWellness();

  const [view, setView] = useState<"today"|"history">("today");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string|null>(null);

  // Formulaire initialisé depuis l'entrée du jour si elle existe
  const [energy, setEnergy] = useState(todayEntry?.energy ?? 3);
  const [mood, setMood]     = useState(todayEntry?.mood   ?? 3);
  const [body, setBody]     = useState(todayEntry?.body   ?? 3);
  const [sleep, setSleep]   = useState(todayEntry?.sleep  ?? 3);
  const [stress, setStress] = useState(todayEntry?.stress ?? 3);
  const [note, setNote]     = useState(todayEntry?.note   ?? "");
  const [tags, setTags]     = useState<string[]>(todayEntry?.tags ?? []);

  // Synchro si todayEntry arrive du backend
  useEffect(() => {
    if (todayEntry) {
      setEnergy(todayEntry.energy);
      setMood(todayEntry.mood);
      setBody(todayEntry.body);
      setSleep(todayEntry.sleep);
      setStress(todayEntry.stress);
      setNote(todayEntry.note ?? "");
      setTags(todayEntry.tags ?? []);
    }
  }, [todayEntry]);

  const displayHistory = isDemo ? DEMO_HISTORY : entries.filter(e => e.entry_date !== new Date().toISOString().split('T')[0]);

  const energyL = [{value:1,label:t("Épuisée","Exhausted"),color:"#EF4444"},{value:2,label:t("Fatiguée","Tired"),color:"#F97316"},{value:3,label:t("Correcte","Okay"),color:"#EAB308"},{value:4,label:t("Dynamisée","Energized"),color:"#22C55E"},{value:5,label:t("Au sommet","On top"),color:"#B8973E"}];
  const moodL   = [{value:1,label:t("Difficile","Difficult"),color:"#EF4444"},{value:2,label:t("Morose","Low"),color:"#F97316"},{value:3,label:t("Neutre","Neutral"),color:"#EAB308"},{value:4,label:t("Bien","Good"),color:"#22C55E"},{value:5,label:t("Excellente","Excellent"),color:"#B8973E"}];
  const bodyL   = [{value:1,label:t("Douloureux","Painful"),color:"#EF4444"},{value:2,label:t("Tendu","Tense"),color:"#F97316"},{value:3,label:t("Correct","Okay"),color:"#EAB308"},{value:4,label:t("Souple","Flexible"),color:"#22C55E"},{value:5,label:t("Parfait","Perfect"),color:"#B8973E"}];
  const sleepL  = [{value:1,label:t("Mauvais","Poor"),color:"#EF4444"},{value:2,label:t("Agité","Restless"),color:"#F97316"},{value:3,label:t("Acceptable","Acceptable"),color:"#EAB308"},{value:4,label:t("Bon","Good"),color:"#22C55E"},{value:5,label:t("Profond","Deep"),color:"#B8973E"}];
  const stressL = [{value:1,label:t("Très stressée","Very stressed"),color:"#EF4444"},{value:2,label:t("Stressée","Stressed"),color:"#F97316"},{value:3,label:t("Modérée","Moderate"),color:"#EAB308"},{value:4,label:t("Sereine","Calm"),color:"#22C55E"},{value:5,label:t("Zen","Zen"),color:"#B8973E"}];

  const globalScore = Math.round((energy + mood + body + sleep + (6 - stress)) / 5);
  const scoreColor  = globalScore >= 4 ? "#22C55E" : globalScore >= 3 ? "#EAB308" : "#EF4444";

  const tagList = [
    t("Courbatures","Soreness"), t("Digestion","Digestion"), t("Stress","Stress"),
    t("Manque de sommeil","Sleep deprived"), t("Bonne forme","Fit"),
    t("Motivée","Motivated"), t("Hydratée","Hydrated"), t("Relâchée","Relaxed"),
  ];
  const toggleTag = (tag: string) => setTags(prev => prev.includes(tag) ? prev.filter(t2 => t2 !== tag) : [...prev, tag]);

  const handleSave = async () => {
    if (isDemo) { setSaved(true); setTimeout(() => setSaved(false), 3000); return; }
    setSaving(true); setSaveError(null);
    const { error } = await saveEntry({ energy, mood, body, sleep, stress, tags, note });
    setSaving(false);
    if (error) setSaveError(error);
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-14">
        <div className="mb-5">
          <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-1">
            {t("Mon journal","My journal")}
          </p>
          <h1 className="font-display text-3xl font-light text-foreground">{t("Bien-être","Wellness")}</h1>
        </div>

        <div className="flex gap-3 mb-5">
          {([["today",t("Aujourd'hui","Today")],["history",t("Historique","History")]] as [string,string][]).map(([id,label]) => (
            <button key={id} onClick={() => setView(id as "today"|"history")}
              className={"flex-1 py-2.5 rounded-xl font-body text-sm font-medium transition-all border " +
                (view===id ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground")}>
              {label}
            </button>
          ))}
        </div>

        {view === "today" && (
          <div className="space-y-3 pb-6">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-body text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                <p className="font-body font-semibold text-sm text-foreground mt-0.5">
                  {globalScore >= 4 ? t("Vous êtes en forme !","You are in great shape!")
                    : globalScore >= 3 ? t("Journée correcte","Decent day")
                    : t("Prenez soin de vous","Take care of yourself")}
                </p>
                {todayEntry && !isDemo && (
                  <p className="font-body text-[10px] text-green-600 mt-0.5">{t("✓ Déjà enregistrée aujourd'hui","✓ Already saved today")}</p>
                )}
              </div>
              <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                style={{ backgroundColor: scoreColor+"18", border: "2px solid "+scoreColor }}>
                <span className="font-display text-2xl font-light" style={{ color: scoreColor }}>{globalScore}</span>
                <span className="font-body text-[9px] text-muted-foreground">/5</span>
              </div>
            </div>

            <ScaleRow label={t("Niveau d'énergie","Energy level")} sublabel={t("Comment vous sentez-vous ?","How do you feel?")} levels={energyL} value={energy} onChange={setEnergy} />
            <ScaleRow label={t("Humeur","Mood")} sublabel={t("Votre état émotionnel","Your emotional state")} levels={moodL} value={mood} onChange={setMood} />
            <ScaleRow label={t("Ressenti corporel","Body feeling")} sublabel={t("Comment se porte votre corps ?","How is your body?")} levels={bodyL} value={body} onChange={setBody} />
            <ScaleRow label={t("Qualité du sommeil","Sleep quality")} sublabel={t("Comment avez-vous dormi ?","How did you sleep?")} levels={sleepL} value={sleep} onChange={setSleep} />
            <ScaleRow label={t("Stress","Stress")} sublabel={t("1 = très stressée, 5 = sereine","1 = very stressed, 5 = calm")} levels={stressL} value={stress} onChange={setStress} />

            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="font-body font-semibold text-sm text-foreground mb-3">{t("Ce que je ressens","What I feel")}</p>
              <div className="flex flex-wrap gap-2">
                {tagList.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={"font-body text-xs px-3 py-1.5 rounded-full border transition-all " +
                      (tags.includes(tag) ? "bg-primary/10 border-primary text-primary font-medium" : "bg-muted border-border text-muted-foreground")}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="font-body font-semibold text-sm text-foreground mb-2">{t("Note personnelle","Personal note")}</p>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                placeholder={t("Je me sens...","I feel...")}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-primary" />
            </div>

            {saveError && (
              <div className="rounded-xl bg-red-50 border border-red-200 py-3 px-4">
                <p className="font-body text-xs text-red-600">{saveError}</p>
              </div>
            )}

            {saved
              ? <div className="rounded-xl bg-green-50 border border-green-200 py-3 text-center">
                  <p className="font-body text-sm text-green-700 font-medium">{t("Journal enregistré !","Journal saved!")}</p>
                </div>
              : <button onClick={handleSave} disabled={saving}
                  className={"w-full rounded-xl font-body font-semibold py-3 transition-all " +
                    (saving ? "bg-muted text-muted-foreground" : "bg-foreground text-background")}>
                  {saving ? t("Enregistrement...","Saving...") : t("Enregistrer ma journée","Save my day")}
                </button>
            }
          </div>
        )}

        {view === "history" && (
          <div className="space-y-3 pb-6">
            {loading && !isDemo
              ? <p className="font-body text-sm text-muted-foreground text-center py-8">{t("Chargement...","Loading...")}</p>
              : displayHistory.length === 0
              ? <p className="font-body text-sm text-muted-foreground text-center py-8">{t("Aucune entrée pour l'instant.","No entries yet.")}</p>
              : displayHistory.map((entry: any) => <HistoryCard key={entry.id} entry={entry} t={t} />)
            }
          </div>
        )}
      </div>

      {/* Bouton mensurations */}
      <button onClick={() => navigate("/measurements")}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", backgroundColor: "white", border: "1px solid rgba(28,27,25,0.07)", borderRadius: 20, cursor: "pointer", fontFamily: "inherit", marginTop: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(184,151,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📏</div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1B19", margin: 0 }}>Mes mensurations</p>
            <p style={{ fontSize: 12, color: "#8B8578", margin: 0 }}>Poids, taille, hanches...</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8B0A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <BottomNav />
    </MobileLayout>
  );
}
