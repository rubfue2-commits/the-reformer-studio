import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Keyboard } from "@capacitor/keyboard";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

interface Measurement {
  id: string; measured_at: string;
  weight_kg?: number; waist_cm?: number; hips_cm?: number;
  chest_cm?: number; thigh_cm?: number; arm_cm?: number;
}

const FIELDS = [
  { key: "weight_kg", label: "Poids",           unit: "kg", emoji: "⚖️", color: "#B8973E" },
  { key: "waist_cm",  label: "Tour de taille",   unit: "cm", emoji: "📏", color: "#EC4899" },
  { key: "hips_cm",   label: "Tour de hanches",  unit: "cm", emoji: "📐", color: "#8B5CF6" },
  { key: "chest_cm",  label: "Tour de poitrine", unit: "cm", emoji: "💪", color: "#3B82F6" },
  { key: "thigh_cm",  label: "Tour de cuisses",  unit: "cm", emoji: "🦵", color: "#10B981" },
  { key: "arm_cm",    label: "Tour de bras",     unit: "cm", emoji: "💪", color: "#F97316" },
];

function MetricChart({ data, field, color, label, unit }: {
  data: Measurement[]; field: string; color: string; label: string; unit: string;
}) {
  const values = data.map(d => (d as any)[field]).filter((v: any) => v != null) as number[];
  if (values.length < 2) return null;

  const W = 320, H = 130;
  const PAD_T = 16, PAD_R = 12, PAD_B = 28, PAD_L = 32;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const minV = Math.min(...values) * 0.97;
  const maxV = Math.max(...values) * 1.03;
  const xStep = innerW / Math.max(values.length - 1, 1);
  const yScale = (v: number) => PAD_T + innerH - ((v - minV) / (maxV - minV)) * innerH;
  const pts: [number, number][] = values.map((v, i) => [PAD_L + i * xStep, yScale(v)]);

  const path = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const [px, py] = pts[i - 1];
    const cx = ((px + x) / 2).toFixed(1);
    return acc + ` C ${cx} ${py.toFixed(1)} ${cx} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, "");
  const area = path + ` L ${pts[pts.length - 1][0].toFixed(1)} ${(PAD_T + innerH).toFixed(1)} L ${PAD_L} ${(PAD_T + innerH).toFixed(1)} Z`;

  const first = values[0], last = values[values.length - 1];
  const diffNum = parseFloat((last - first).toFixed(1));
  const isPositive = ['weight_kg','waist_cm','hips_cm','thigh_cm'].includes(field) ? diffNum <= 0 : diffNum >= 0;
  const gradId = "g_" + field;

  return (
    <div className="bg-card rounded-3xl p-4 border border-border shadow-sm mb-4">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <p className="font-body text-sm font-semibold text-foreground">{label}</p>
          <p className="font-body text-[11px] text-muted-foreground">{values.length} mesures · depuis le {new Date(data[0].measured_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>
            {last}<span style={{ fontSize: 11, color: "#8B8578", fontWeight: 400 }}> {unit}</span>
          </p>
          {diffNum !== 0 && (
            <p style={{ fontSize: 11, fontWeight: 600, color: isPositive ? "#22C55E" : "#EF4444", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, marginTop: 2 }}>
              {diffNum < 0 ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
              {diffNum > 0 ? "+" : ""}{diffNum} {unit}
            </p>
          )}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", marginTop: 6 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map(t => {
          const y = PAD_T + innerH * (1 - t);
          const val = (minV + (maxV - minV) * t).toFixed(1);
          return (
            <g key={t}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="rgba(28,27,25,0.05)" strokeWidth="1" />
              <text x={PAD_L - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#C4BDB5">{val}</text>
            </g>
          );
        })}
        <path d={area} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => {
          const isLast = i === pts.length - 1;
          const isFirst = i === 0;
          if (!isLast && !isFirst && pts.length > 6) return null;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={isLast ? 5 : 3} fill={isLast ? color : "white"} stroke={color} strokeWidth={isLast ? 0 : 2} />
              {isLast && <circle cx={x} cy={y} r={10} fill={color} fillOpacity="0.15" />}
            </g>
          );
        })}
        {data.map((m, i) => {
          if (i !== 0 && i !== data.length - 1 && data.length > 5 && i % Math.ceil(data.length / 4) !== 0) return null;
          const [x] = pts[i];
          return (
            <text key={i} x={x} y={H} textAnchor="middle" fontSize="8" fill="#C4BDB5">
              {new Date(m.measured_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function Measurements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  useEffect(() => {
    if (user) load();
    const showSub = Keyboard.addListener("keyboardWillShow", info => setKeyboardHeight(info.keyboardHeight));
    const hideSub = Keyboard.addListener("keyboardWillHide", () => setKeyboardHeight(0));
    return () => { showSub.then(l => l.remove()); hideSub.then(l => l.remove()); };
  }, [user]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
  };

  const load = async () => {
    const { data } = await supabase.from("measurements").select("*")
      .eq("user_id", user!.id).order("measured_at", { ascending: true }).limit(30);
    setMeasurements(data || []);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const entry: Record<string, any> = { user_id: user.id, measured_at: new Date().toISOString() };
    FIELDS.forEach(f => { if (form[f.key]) entry[f.key] = parseFloat(form[f.key]); });
    await supabase.from("measurements").insert(entry);
    await load();
    setShowForm(false);
    setForm({});
    setSaving(false);
  };

  const latest = measurements[measurements.length - 1];
  const previous = measurements.length >= 2 ? measurements[measurements.length - 2] : null;

  const getDiff = (key: string) => {
    const l = latest ? (latest as any)[key] : null;
    const p = previous ? (previous as any)[key] : null;
    if (!l || !p) return null;
    return (l - p).toFixed(1);
  };

  const availableMetrics = FIELDS.filter(f =>
    measurements.filter(m => (m as any)[f.key] != null).length >= 2
  );
  const selectedMetric = activeMetric || availableMetrics[0]?.key || null;

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Bien-être</p>
            <h1 className="font-display text-2xl font-light text-foreground">Mensurations</h1>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#B8973E", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={18} color="#1C1B19" />
          </button>
        </div>

        {measurements.length === 0 && !showForm && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>📏</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1B19", marginBottom: 6 }}>Première prise</p>
            <p style={{ fontSize: 13, color: "#8B8578", lineHeight: 1.6, maxWidth: 240, margin: "0 auto 20px" }}>
              Enregistre tes premières mensurations pour voir ton évolution au fil du temps.
            </p>
            <button onClick={() => setShowForm(true)}
              style={{ padding: "13px 28px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Saisir mes mensurations
            </button>
          </div>
        )}

        {measurements.length > 0 && (
          <>
            {latest && (
              <div className="mb-5">
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                  Dernière prise · {new Date(latest.measured_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {FIELDS.map(f => {
                    const val = (latest as any)[f.key];
                    if (!val) return null;
                    const diff = getDiff(f.key);
                    const diffNum = diff ? parseFloat(diff) : 0;
                    const isGood = ['weight_kg','waist_cm','hips_cm','thigh_cm'].includes(f.key) ? diffNum <= 0 : diffNum >= 0;
                    return (
                      <button key={f.key} onClick={() => setActiveMetric(f.key)}
                        style={{ background: selectedMetric === f.key ? f.color + "15" : "white", borderRadius: 16, padding: "12px 14px", border: selectedMetric === f.key ? `1.5px solid ${f.color}40` : "1px solid rgba(28,27,25,0.07)", cursor: "pointer", textAlign: "left", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                        <p style={{ fontSize: 12, color: "#8B8578", marginBottom: 4 }}>{f.emoji} {f.label}</p>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "space-between" }}>
                          <p style={{ fontSize: 20, fontWeight: 700, color: "#1C1B19", margin: 0 }}>
                            {val}<span style={{ fontSize: 11, color: "#8B8578", fontWeight: 400 }}>{f.unit}</span>
                          </p>
                          {diff && diffNum !== 0 && (
                            <p style={{ fontSize: 11, fontWeight: 600, color: isGood ? "#22C55E" : "#EF4444", display: "flex", alignItems: "center", gap: 2, margin: 0 }}>
                              {diffNum < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                              {diffNum > 0 ? "+" : ""}{diff}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}

            {availableMetrics.length > 0 && (
              <>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Évolution</p>
                <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  {availableMetrics.map(f => (
                    <button key={f.key} onClick={() => setActiveMetric(f.key)}
                      className="flex-shrink-0 font-body text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: selectedMetric === f.key ? f.color : "rgba(28,27,25,0.07)", color: selectedMetric === f.key ? "white" : "#6B6560", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>
                {selectedMetric && (() => {
                  const field = FIELDS.find(f => f.key === selectedMetric)!;
                  const filteredData = measurements.filter(m => (m as any)[selectedMetric] != null);
                  return <MetricChart data={filteredData} field={selectedMetric} color={field.color} label={field.label} unit={field.unit} />;
                })()}
              </>
            )}

            {measurements.length === 1 && (
              <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "rgba(184,151,62,0.08)", border: "1px solid rgba(184,151,62,0.2)" }}>
                <p className="font-body text-xs font-semibold text-foreground mb-1">📈 Continue !</p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">Ajoute une deuxième prise pour voir apparaître ton graphique d'évolution.</p>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 998 }} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              style={{ position: "fixed", left: 0, right: 0, bottom: keyboardHeight > 0 ? keyboardHeight : 0, zIndex: 999, backgroundColor: "white", borderRadius: "24px 24px 0 0", maxHeight: "85vh", overflowY: "auto", WebkitOverflowScrolling: "touch" as any, padding: "20px 20px 40px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#D1CCC5", margin: "0 auto 20px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1C1B19", margin: 0 }}>Nouvelle prise</h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#8B8578", lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {FIELDS.map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, color: "#6B6560", display: "block", marginBottom: 6, fontWeight: 500 }}>
                      {f.emoji} {f.label} <span style={{ color: "#B8B0A6" }}>({f.unit})</span>
                    </label>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(28,27,25,0.12)", borderRadius: 12, overflow: "hidden", backgroundColor: "#FAFAF8" }}>
                      <input type="number" inputMode="decimal" step="0.1" placeholder="—" value={form[f.key] || ""}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        onFocus={handleFocus}
                        style={{ flex: 1, padding: "14px 16px", border: "none", outline: "none", fontSize: 16, color: "#1C1B19", fontFamily: "inherit", backgroundColor: "transparent" }} />
                      <span style={{ paddingRight: 14, fontSize: 13, color: "#B8B0A6", fontWeight: 500 }}>{f.unit}</span>
                    </div>
                  </div>
                ))}
                <button onClick={save} disabled={saving}
                  style={{ width: "100%", padding: "15px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 6, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Sauvegarde..." : "Enregistrer mes mensurations"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
}
