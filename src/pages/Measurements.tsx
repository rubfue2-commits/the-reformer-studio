import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Keyboard } from "@capacitor/keyboard";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

// ── Structure DB exacte ───────────────────────────────────────
interface Measurement {
  id: string;
  user_id: string;
  measured_at: string;   // timestamptz
  weight_kg?: number;    // numeric
  waist_cm?: number;     // numeric
  hips_cm?: number;      // numeric
  chest_cm?: number;     // numeric
  thigh_cm?: number;     // numeric (pas thigh_cm)
  arm_cm?: number;       // numeric (pas arm_cm)
  notes?: string;        // text (pas note)
  created_at?: string;
}

// Colonnes qui diminuent = bien (poids/mensurations)
const DECREASING_IS_GOOD = ['weight_kg','waist_cm','hips_cm','thigh_cm','chest_cm','arm_cm'];

const FIELDS = [
  { key: "weight_kg", label: "Poids",           unit: "kg", emoji: "⚖️", color: "#B8973E" },
  { key: "waist_cm",  label: "Tour de taille",   unit: "cm", emoji: "📏", color: "#EC4899" },
  { key: "hips_cm",   label: "Tour de hanches",  unit: "cm", emoji: "📐", color: "#8B5CF6" },
  { key: "chest_cm",  label: "Tour de poitrine", unit: "cm", emoji: "💪", color: "#3B82F6" },
  { key: "thigh_cm",  label: "Tour de cuisses",  unit: "cm", emoji: "🦵", color: "#10B981" },
  { key: "arm_cm",    label: "Tour de bras",     unit: "cm", emoji: "💪", color: "#F97316" },
];

// ── Graphique SVG smooth ──────────────────────────────────────
function MetricChart({ data, field, color, label, unit }: {
  data: Measurement[]; field: string; color: string; label: string; unit: string;
}) {
  const values = data.map(d => (d as any)[field]).filter((v: any) => v != null) as number[];
  if (values.length < 2) return null;

  const W = 320, H = 130;
  const PAD_T = 20, PAD_R = 12, PAD_B = 30, PAD_L = 36;
  const iW = W - PAD_L - PAD_R, iH = H - PAD_T - PAD_B;
  const minV = Math.min(...values) * 0.97;
  const maxV = Math.max(...values) * 1.03;
  const xStep = iW / Math.max(values.length - 1, 1);
  const yOf = (v: number) => PAD_T + iH - ((v - minV) / (maxV - minV || 1)) * iH;
  const pts: [number, number][] = values.map((v, i) => [PAD_L + i * xStep, yOf(v)]);

  const path = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`;
    const [px, py] = pts[i - 1];
    const cx = ((px + x) / 2).toFixed(1);
    return acc + ` C${cx},${py.toFixed(1)} ${cx},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  }, "");
  const area = path + ` L${pts[pts.length-1][0].toFixed(1)},${(PAD_T+iH).toFixed(1)} L${PAD_L},${(PAD_T+iH).toFixed(1)}Z`;

  const diffNum = parseFloat((values[values.length-1] - values[0]).toFixed(1));
  const isGood = DECREASING_IS_GOOD.includes(field) ? diffNum <= 0 : diffNum >= 0;
  const gId = "g" + field.replace(/_/g,"");

  return (
    <div className="bg-card rounded-3xl p-4 border border-border shadow-sm mb-4">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
        <div>
          <p className="font-body text-sm font-semibold text-foreground">{label}</p>
          <p className="font-body text-[11px] text-muted-foreground">
            {values.length} mesures · depuis {new Date(data[0].measured_at).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
          </p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:22, fontWeight:700, color, lineHeight:1 }}>
            {values[values.length-1]}
            <span style={{ fontSize:11, color:"#8B8578", fontWeight:400 }}> {unit}</span>
          </p>
          {diffNum !== 0 && (
            <span style={{ fontSize:11, fontWeight:600, color: isGood?"#22C55E":"#EF4444", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:2, marginTop:2 }}>
              {diffNum < 0 ? <TrendingDown size={11}/> : <TrendingUp size={11}/>}
              {diffNum > 0 ? "+" : ""}{diffNum} {unit}
            </span>
          )}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible", marginTop:8 }}>
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0,0.5,1].map(t => {
          const y = PAD_T + iH*(1-t);
          const v = (minV + (maxV-minV)*t).toFixed(1);
          return <g key={t}>
            <line x1={PAD_L} y1={y} x2={W-PAD_R} y2={y} stroke="rgba(28,27,25,0.05)" strokeWidth="1"/>
            <text x={PAD_L-4} y={y+3} textAnchor="end" fontSize="8" fill="#C4BDB5">{v}</text>
          </g>;
        })}
        <path d={area} fill={`url(#${gId})`}/>
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map(([x,y],i) => {
          const last = i===pts.length-1, first = i===0;
          if (!last && !first && pts.length>6) return null;
          return <g key={i}>
            <circle cx={x} cy={y} r={last?5:3} fill={last?color:"white"} stroke={color} strokeWidth={last?0:2}/>
            {last && <circle cx={x} cy={y} r={10} fill={color} fillOpacity="0.15"/>}
          </g>;
        })}
        {data.map((m,i) => {
          if (i!==0 && i!==data.length-1 && data.length>5 && i%Math.ceil(data.length/4)!==0) return null;
          const [x] = pts[i];
          return <text key={i} x={x} y={H} textAnchor="middle" fontSize="8" fill="#C4BDB5">
            {new Date(m.measured_at).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
          </text>;
        })}
      </svg>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
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
    const show = Keyboard.addListener("keyboardWillShow", i => setKeyboardHeight(i.keyboardHeight));
    const hide = Keyboard.addListener("keyboardWillHide", () => setKeyboardHeight(0));
    return () => { show.then(l => l.remove()); hide.then(l => l.remove()); };
  }, [user]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    setTimeout(() => e.target.scrollIntoView({ behavior:"smooth", block:"center" }), 350);

  const load = async () => {
    const { data, error } = await supabase
      .from("measurements")
      .select("id, user_id, measured_at, weight_kg, waist_cm, hips_cm, chest_cm, thigh_cm, arm_cm, notes, created_at")
      .eq("user_id", user!.id)
      .order("measured_at", { ascending: true })
      .limit(30);
    if (!error) setMeasurements(data || []);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    // Construire l'objet avec les vrais noms de colonnes DB
    const entry: Record<string, any> = {
      user_id: user.id,
      measured_at: new Date().toISOString(), // timestamptz
    };
    FIELDS.forEach(f => {
      if (form[f.key] && form[f.key].trim() !== "") {
        entry[f.key] = parseFloat(form[f.key]);
      }
    });
    // Vérifier qu'au moins une valeur est renseignée
    const hasValues = FIELDS.some(f => entry[f.key] !== undefined);
    if (!hasValues) { setSaving(false); return; }

    const { error } = await supabase.from("measurements").insert(entry);
    if (!error) {
      await load();
      setShowForm(false);
      setForm({});
    }
    setSaving(false);
  };

  const latest = measurements[measurements.length - 1];
  const previous = measurements.length >= 2 ? measurements[measurements.length - 2] : null;

  const getDiff = (key: string) => {
    const l = latest ? (latest as any)[key] : null;
    const p = previous ? (previous as any)[key] : null;
    if (l == null || p == null) return null;
    return parseFloat((l - p).toFixed(1));
  };

  const availableMetrics = FIELDS.filter(f =>
    measurements.filter(m => (m as any)[f.key] != null).length >= 2
  );
  const selectedMetric = activeMetric || availableMetrics[0]?.key || null;

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground"/>
          </button>
          <div className="flex-1">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Bien-être</p>
            <h1 className="font-display text-2xl font-light text-foreground">Mensurations</h1>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ width:36, height:36, borderRadius:"50%", backgroundColor:"#B8973E", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Plus size={18} color="#1C1B19"/>
          </button>
        </div>

        {/* Aucune donnée */}
        {measurements.length === 0 && !showForm && (
          <div style={{ textAlign:"center", padding:"48px 20px" }}>
            <p style={{ fontSize:40, marginBottom:16 }}>📏</p>
            <p style={{ fontSize:16, fontWeight:600, color:"#1C1B19", marginBottom:8 }}>Première prise</p>
            <p style={{ fontSize:13, color:"#8B8578", lineHeight:1.7, maxWidth:240, margin:"0 auto 24px" }}>
              Enregistre tes premières mensurations pour visualiser ton évolution au fil du temps.
            </p>
            <button onClick={() => setShowForm(true)}
              style={{ padding:"13px 28px", backgroundColor:"#B8973E", color:"#1C1B19", border:"none", borderRadius:14, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              Commencer le suivi
            </button>
          </div>
        )}

        {/* Données disponibles */}
        {measurements.length > 0 && (
          <>
            {/* Dernière prise — grille */}
            {latest && (
              <div className="mb-5">
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                  Dernière prise · {new Date(latest.measured_at).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {FIELDS.map(f => {
                    const val = (latest as any)[f.key];
                    if (val == null) return null;
                    const diff = getDiff(f.key);
                    const isGood = DECREASING_IS_GOOD.includes(f.key) ? (diff ?? 0) <= 0 : (diff ?? 0) >= 0;
                    return (
                      <button key={f.key} onClick={() => setActiveMetric(f.key)}
                        style={{ background: selectedMetric===f.key ? f.color+"15" : "white", borderRadius:16, padding:"12px 14px", border: selectedMetric===f.key ? `1.5px solid ${f.color}40` : "1px solid rgba(28,27,25,0.08)", cursor:"pointer", textAlign:"left", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
                        <p style={{ fontSize:12, color:"#8B8578", marginBottom:4 }}>{f.emoji} {f.label}</p>
                        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
                          <p style={{ fontSize:20, fontWeight:700, color:"#1C1B19", margin:0 }}>
                            {val}<span style={{ fontSize:11, color:"#8B8578", fontWeight:400 }}> {f.unit}</span>
                          </p>
                          {diff !== null && diff !== 0 && (
                            <span style={{ fontSize:11, fontWeight:600, color: isGood?"#22C55E":"#EF4444", display:"flex", alignItems:"center", gap:2 }}>
                              {diff < 0 ? <TrendingDown size={10}/> : <TrendingUp size={10}/>}
                              {diff > 0 ? "+" : ""}{diff}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
            )}

            {/* Graphique */}
            {availableMetrics.length > 0 && (
              <>
                <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Évolution</p>
                <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth:"none" }}>
                  {availableMetrics.map(f => (
                    <button key={f.key} onClick={() => setActiveMetric(f.key)}
                      className="flex-shrink-0 font-body text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: selectedMetric===f.key ? f.color : "rgba(28,27,25,0.07)", color: selectedMetric===f.key ? "white" : "#6B6560", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>
                {selectedMetric && (() => {
                  const field = FIELDS.find(f => f.key === selectedMetric)!;
                  const pts = measurements.filter(m => (m as any)[selectedMetric] != null);
                  return <MetricChart data={pts} field={selectedMetric} color={field.color} label={field.label} unit={field.unit}/>;
                })()}
              </>
            )}

            {/* Encouragement — 1 seule mesure */}
            {measurements.length === 1 && (
              <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor:"rgba(184,151,62,0.08)", border:"1px solid rgba(184,151,62,0.2)" }}>
                <p className="font-body text-xs font-semibold text-foreground mb-1">📈 Reviens dans quelques jours</p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Ajoute une deuxième prise pour voir ton graphique d'évolution apparaître.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sheet saisie */}
      <AnimatePresence>
        {showForm && (
          <>
            <div onClick={() => setShowForm(false)} style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.45)", zIndex:998 }}/>
            <motion.div
              initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", damping:28, stiffness:300 }}
              style={{ position:"fixed", left:0, right:0, bottom: keyboardHeight > 0 ? keyboardHeight : 0, zIndex:999, backgroundColor:"white", borderRadius:"24px 24px 0 0", maxHeight:"85vh", overflowY:"auto", WebkitOverflowScrolling:"touch" as any, padding:"20px 20px 44px" }}>
              <div style={{ width:36, height:4, borderRadius:2, backgroundColor:"#D1CCC5", margin:"0 auto 20px" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:600, color:"#1C1B19", margin:0 }}>Nouvelle prise</h3>
                  <p style={{ fontSize:12, color:"#8B8578", margin:"2px 0 0" }}>Remplis uniquement ce que tu connais</p>
                </div>
                <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#8B8578", lineHeight:1 }}>×</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {FIELDS.map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:12, color:"#6B6560", display:"block", marginBottom:6, fontWeight:500 }}>
                      {f.emoji} {f.label} <span style={{ color:"#B8B0A6" }}>({f.unit})</span>
                    </label>
                    <div style={{ display:"flex", alignItems:"center", border:"1px solid rgba(28,27,25,0.12)", borderRadius:12, overflow:"hidden", backgroundColor:"#FAFAF8" }}>
                      <input type="number" inputMode="decimal" step="0.1" placeholder="—" value={form[f.key] || ""}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        onFocus={handleFocus}
                        style={{ flex:1, padding:"14px 16px", border:"none", outline:"none", fontSize:16, color:"#1C1B19", fontFamily:"inherit", backgroundColor:"transparent" }}/>
                      <span style={{ paddingRight:14, fontSize:13, color:"#B8B0A6", fontWeight:500 }}>{f.unit}</span>
                    </div>
                  </div>
                ))}
                <button onClick={save} disabled={saving}
                  style={{ width:"100%", padding:"15px", backgroundColor:"#B8973E", color:"#1C1B19", border:"none", borderRadius:14, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit", marginTop:6, opacity: saving?0.7:1 }}>
                  {saving ? "Sauvegarde..." : "Enregistrer mes mensurations"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav/>
    </MobileLayout>
  );
}
