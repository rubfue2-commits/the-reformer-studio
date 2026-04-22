import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
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

export default function Progress() {
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
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <div className="mb-5">
          <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-1">
            Connect Reformer
          </p>
          <h1 className="font-display text-3xl font-light text-foreground">
            {t("Progrès", "Progress")}
          </h1>
        </div>

        {/* Metric chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={"flex-shrink-0 px-4 py-2 rounded-full font-body text-xs font-medium transition-all border " +
                (activeMetric === m.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-muted-foreground")}
            >
              {t(m.fr, m.en)}
            </button>
          ))}
        </div>

        {/* Carte valeur actuelle */}
        <div className="rounded-2xl bg-card border border-border p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                {t(metric.fr, metric.en)}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl font-light" style={{ color: metric.color }}>
                  {latest ? latest.value : "--"}
                </span>
                <span className="font-body text-sm text-muted-foreground">{metric.unit}</span>
              </div>
              {diff !== null && (
                <p className={"font-body text-xs font-medium mt-1 " + (diff <= 0 ? "text-green-600" : "text-red-500")}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)} {metric.unit} {t("depuis la dernière fois", "since last time")}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-light flex-shrink-0"
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
                const isLast = i === metricData.slice(0, 7).length - 1;
                return (
                  <div key={i} className="flex-1 rounded-t-sm"
                    style={{ height: pct + "%", backgroundColor: metric.color + (isLast ? "ff" : "55") }} />
                );
              })}
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center">
              <p className="font-body text-xs text-muted-foreground">{t("Aucune donnée encore", "No data yet")}</p>
            </div>
          )}
        </div>

        {/* Historique */}
        {metricData.length > 0 && (
          <div className="pb-6">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-3">
              {t("Historique", "History")}
            </p>
            <div className="space-y-2">
              {metricData.slice(0, 10).map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                  <p className="font-body text-xs text-muted-foreground">
                    {new Date(m.measured_at).toLocaleDateString()}
                  </p>
                  <p className="font-body font-semibold text-sm text-foreground">
                    {m.value} {metric.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
          onClick={() => setShowModal(false)}>
          <div className="bg-background rounded-t-3xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}>
            <p className="font-display text-xl font-light text-foreground mb-1">
              {t("Ajouter une mesure", "Add measurement")}
            </p>
            <p className="font-body text-sm text-muted-foreground mb-5">
              {t(metric.fr, metric.en)} ({metric.unit})
            </p>
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

      <BottomNav />
    </MobileLayout>
  );
}
