import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "@/hooks/usePreferences";
import { useLanguage } from "@/i18n/LanguageContext";

const GOALS = [
  { id: "weight_loss",    emoji: "🔥", fr: "Perte de poids", en: "Weight loss"   },
  { id: "strength",       emoji: "💪", fr: "Renforcement",   en: "Strength"      },
  { id: "flexibility",    emoji: "🧘", fr: "Souplesse",      en: "Flexibility"   },
  { id: "posture",        emoji: "🎯", fr: "Posture",        en: "Posture"        },
  { id: "rehabilitation", emoji: "🩺", fr: "Reeducation",    en: "Rehab"         },
  { id: "relaxation",     emoji: "✨", fr: "Relaxation",     en: "Relaxation"    },
];

const LEVELS = [
  { id: "beginner",     fr: "Debutante",     en: "Beginner",     desc_fr: "Je commence",          desc_en: "Just starting"        },
  { id: "intermediate", fr: "Intermediaire", en: "Intermediate", desc_fr: "Quelques mois",         desc_en: "A few months"         },
  { id: "advanced",     fr: "Avancee",       en: "Advanced",     desc_fr: "Plus d un an",          desc_en: "Over a year"          },
];

const FOCUSES = [
  { id: "core",      emoji: "⭕", fr: "Abdos",       en: "Core"      },
  { id: "legs",      emoji: "🦵", fr: "Jambes",      en: "Legs"      },
  { id: "arms",      emoji: "💪", fr: "Bras",        en: "Arms"      },
  { id: "back",      emoji: "🔙", fr: "Dos",         en: "Back"      },
  { id: "full_body", emoji: "🌟", fr: "Corps entier", en: "Full body" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = usePreferences();
  const { language } = useLanguage();
  const fr = language === "fr";

  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [level, setLevel] = useState<string>("");
  const [frequency, setFrequency] = useState(3);
  const [focuses, setFocuses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const total = 4;
  const progress = ((step + 1) / total) * 100;

  const toggleGoal = (id: string) =>
    setGoals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleFocus = (id: string) =>
    setFocuses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const canNext =
    (step === 0 && goals.length > 0) ||
    (step === 1 && level !== "") ||
    step === 2 ||
    (step === 3 && focuses.length > 0);

  const finish = async () => {
    setSaving(true);
    await completeOnboarding({
      goals: goals as any,
      experience_level: level as any,
      weekly_frequency: frequency,
      focus_areas: focuses as any,
    });
    setSaving(false);
    navigate("/home");
  };

  const titles = [
    fr ? "Tes objectifs" : "Your goals",
    fr ? "Ton niveau"    : "Your level",
    fr ? "Ta frequence"  : "Your frequency",
    fr ? "Zones cibles"  : "Focus areas",
  ];

  const cardStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    padding: "16px 12px", borderRadius: 18, cursor: "pointer",
    background: active ? "rgba(196,150,58,0.18)" : "#1C1C1E",
    border: active ? "1.5px solid #C4963A" : "0.5px solid rgba(255,255,255,0.08)",
    color: active ? "#C4963A" : "rgba(255,255,255,0.6)",
    fontSize: 13, fontFamily: "DM Sans, sans-serif", fontWeight: 500,
  });

  return (
    <div style={{ minHeight: "100%", background: "#0F0F0F", display: "flex", flexDirection: "column" }}>

      {/* Progress */}
      <div style={{ height: 3, background: "#1C1C1E", marginTop: 44 }}>
        <div style={{ height: "100%", width: progress + "%", background: "#C4963A", transition: "width 0.4s" }} />
      </div>

      {/* Header */}
      <div style={{ padding: "24px 20px 8px", display: "flex", alignItems: "center", gap: 12 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            style={{ background: "none", border: "none", color: "#C4963A", fontSize: 28, cursor: "pointer", lineHeight: 1, padding: 0 }}>
            ‹
          </button>
        )}
        <div>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, fontWeight: 600, color: "#C4963A", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>
            {step + 1} / {total}
          </p>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 34, fontWeight: 300, color: "#fff", margin: 0 }}>
            {titles[step]}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>

        {step === 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => toggleGoal(g.id)} style={cardStyle(goals.includes(g.id))}>
                <span style={{ fontSize: 28 }}>{g.emoji}</span>
                {fr ? g.fr : g.en}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LEVELS.map(l => {
              const active = level === l.id;
              return (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  style={{ ...cardStyle(active), flexDirection: "row", gap: 14, padding: "18px 20px", textAlign: "left" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: active ? "#C4963A" : "transparent",
                    border: active ? "2px solid #C4963A" : "2px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active && <span style={{ color: "#000", fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 500, color: active ? "#C4963A" : "#fff", fontFamily: "DM Sans, sans-serif" }}>
                      {fr ? l.fr : l.en}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "DM Sans, sans-serif" }}>
                      {fr ? l.desc_fr : l.desc_en}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: "center", paddingTop: 24 }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>
              {fr ? "Seances par semaine" : "Sessions per week"}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              {[2, 3, 4, 5].map(f => (
                <button key={f} onClick={() => setFrequency(f)} style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: frequency === f ? "#C4963A" : "#1C1C1E",
                  border: frequency === f ? "none" : "0.5px solid rgba(255,255,255,0.1)",
                  color: frequency === f ? "#000" : "#fff",
                  fontFamily: "Cormorant Garamond, serif", fontSize: 32, cursor: "pointer",
                }}>
                  {f}
                </button>
              ))}
            </div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 20 }}>
              {frequency}x / {fr ? "semaine" : "week"}
            </p>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {FOCUSES.map(f => (
              <button key={f.id} onClick={() => toggleFocus(f.id)} style={cardStyle(focuses.includes(f.id))}>
                <span style={{ fontSize: 28 }}>{f.emoji}</span>
                {fr ? f.fr : f.en}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: "12px 20px 40px" }}>
        {step < total - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
            style={{ width: "100%", height: 54, background: canNext ? "#C4963A" : "#333", color: canNext ? "#000" : "#666", border: "none", borderRadius: 14, fontFamily: "DM Sans, sans-serif", fontSize: 16, fontWeight: 600, cursor: canNext ? "pointer" : "default" }}>
            {fr ? "Continuer" : "Continue"}
          </button>
        ) : (
          <button onClick={finish} disabled={!canNext || saving}
            style={{ width: "100%", height: 54, background: canNext ? "#C4963A" : "#333", color: canNext ? "#000" : "#666", border: "none", borderRadius: 14, fontFamily: "DM Sans, sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            {saving ? "..." : (fr ? "Commencer !" : "Start!")}
          </button>
        )}
      </div>
    </div>
  );
}
