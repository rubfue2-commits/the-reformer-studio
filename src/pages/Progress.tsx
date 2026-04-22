import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMeasurements } from "@/hooks/useMeasurements";

const METRICS = [
  { key: "weight", fr: "Poids",    en: "Weight",  unit: "kg", color: "#B8973E" },
  { key: "waist",  fr: "Taille",   en: "Waist",   unit: "cm", color: "#22C55E" },
  { key: "hips",   fr: "Hanches",  en: "Hips",    unit: "cm", color: "#EC4899" },
  { key: "chest",  fr: "Poitrine", en: "Chest",   unit: "cm", color: "#8B5CF6" },
  { key: "thigh",  fr: "Cuisse",   en: "Thigh",   unit: "cm", color: "#F97316" },
  { key: "arm",    fr: "Bras",     en: "Arm",     unit: "cm", color: "#3B82F6" },
];

const NAV = [
  { path: "/home",     labelFr: "Accueil",  labelEn: "Home"     },
  { path: "/library",  labelFr: "Seances",  labelEn: "Sessions" },
  { path: "/progress", labelFr: "Progres",  labelEn: "Progress" },
  { path: "/profile",  labelFr: "Profil",   labelEn: "Profile"  },
];

export default function Progress() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { measurements, addMeasurement } = useMeasurements(user?.id);

  const [activeMetric, setActiveMetric] = useState("weight");
  const [showModal, setShowModal] = useState(false);
  const [newValue, setNewValue] = useState("");

  const metric = METRICS.find(m => m.key === activeMetric)!;
  const metricData = (measurements || [])
    .filter((m: any) => m.metric_type === activeMetric)
    .sort((a: any, b: any) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime());

  const latest = metricData[0];
  const prev = metricData[1];
  const diff = latest && prev ? (latest.value - prev.value) : null;

  const handleAdd = async () => {
    if (!newValue || !user) return;
    await addMeasurement({ metric_type: activeMetric, value: parseFloat(newValue), unit: metric.unit });
    setNewValue("");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto px-4">

          {/* Header */}
          <div className="pt-12 pb-5">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">Connect Reformer</p>
            <h1 className="font-display text-3xl text-foreground">{t("Progres", "Progress")}</h1>
          </div>

          {/* Metric chips — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={"flex-shrink-0 px-4 py-2 rounded-full font-body text-sm font-medium transition-all " +
                  (activeMetric === m.key ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground")}
              >
                {t(m.fr, m.en)}
              </button>
            ))}
          </div>

          {/* Current value card */}
          <div className="rounded-2xl bg-card border border-border p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">{t(metric.fr, metric.en)}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-4xl" style={{ color: metric.color }}>
                    {latest ? latest.value : "--"}
                  </span>
                  <span className="font-body text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                {diff !== null && (
                  <p className={"font-body text-xs font-medium mt-1 " + (diff <= 0 ? "text-green-600" : "text-red-500")}>
                    {diff > 0 ? "+" : ""}{diff.toFixed(1)} {metric.unit} {t("depuis la derniere fois", "since last time")}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-light"
              >+</button>
            </div>

            {/* Mini bar chart */}
            {metricData.length > 0 ? (
              <div className="flex items-end gap-1.5 h-16">
                {metricData.slice(0, 7).reverse().map((m: any, i: number) => {
                  const vals = metricData.slice(0, 7).map((x: any) => x.value);
                  const mn = Math.min(...vals);
                  const mx = Math.max(...vals);
                  const pct = mx === mn ? 50 : ((m.value - mn) / (mx - mn)) * 80 + 20;
                  return (
                    <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height: pct + "%", backgroundColor: metric.color + (i === metricData.slice(0,7).length - 1 ? "ff" : "60") }} />
                  );
                })}
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center">
                <p className="font-body text-xs text-muted-foreground">{t("Aucune donnee", "No data yet")}</p>
              </div>
            )}
          </div>

          {/* History */}
          {metricData.length > 0 && (
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-3">{t("Historique", "History")}</p>
              <div className="space-y-2">
                {metricData.slice(0, 10).map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                    <p className="font-body text-xs text-muted-foreground">
                      {new Date(m.measured_at).toLocaleDateString()}
                    </p>
                    <p className="font-body font-semibold text-sm text-foreground">{m.value} {metric.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-background rounded-t-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <p className="font-display text-xl text-foreground mb-1">{t("Ajouter une mesure", "Add measurement")}</p>
            <p className="font-body text-sm text-muted-foreground mb-5">{t(metric.fr, metric.en)} ({metric.unit})</p>
            <input
              type="number"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder={t("Valeur...", "Value...")}
              className="w-full border border-border rounded-xl px-4 py-3 font-body text-base bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-border font-body text-sm text-muted-foreground">
                {t("Annuler", "Cancel")}
              </button>
              <button onClick={handleAdd}
                className="flex-1 py-3 rounded-xl bg-foreground text-background font-body text-sm font-semibold">
                {t("Enregistrer", "Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="max-w-md mx-auto flex justify-around px-2 py-2">
          {NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={"flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors " +
                  (active ? "text-foreground" : "text-muted-foreground")}>
                <span className={"w-1.5 h-1.5 rounded-full mb-0.5 " + (active ? "bg-primary" : "bg-transparent")} />
                <span className="font-body text-[10px] uppercase tracking-wide">{t(item.labelFr, item.labelEn)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
