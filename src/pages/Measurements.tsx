import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

interface Measurement {
  id: string; measured_at: string;
  weight_kg?: number; waist_cm?: number; hips_cm?: number;
  chest_cm?: number; thighs_cm?: number; arms_cm?: number;
}

const FIELDS = [
  { key: "weight_kg",  label: "Poids",      unit: "kg",  icon: "⚖️" },
  { key: "waist_cm",   label: "Tour de taille", unit: "cm", icon: "📏" },
  { key: "hips_cm",    label: "Tour de hanches", unit: "cm", icon: "📐" },
  { key: "chest_cm",   label: "Tour de poitrine", unit: "cm", icon: "💪" },
  { key: "thighs_cm",  label: "Tour de cuisses", unit: "cm", icon: "🦵" },
  { key: "arms_cm",    label: "Tour de bras", unit: "cm", icon: "💪" },
];

export default function Measurements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    const { data } = await supabase.from("measurements").select("*").eq("user_id", user!.id).order("measured_at", { ascending: false }).limit(10);
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

  const latest = measurements[0];
  const previous = measurements[1];

  const getDiff = (key: string) => {
    if (!latest || !previous) return null;
    const l = (latest as any)[key]; const p = (previous as any)[key];
    if (!l || !p) return null;
    return ((l - p) as number).toFixed(1);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/wellness")} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
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

        {/* Dernières mensurations */}
        {latest && (
          <div className="bg-card rounded-3xl p-5 border border-border shadow-sm mb-4">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Dernière prise</p>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(f => {
                const val = (latest as any)[f.key];
                if (!val) return null;
                const diff = getDiff(f.key);
                const diffNum = diff ? parseFloat(diff) : 0;
                return (
                  <div key={f.key} style={{ backgroundColor: "#FAFAF8", borderRadius: 14, padding: "12px" }}>
                    <p style={{ fontSize: 11, color: "#8B8578", marginBottom: 3 }}>{f.icon} {f.label}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#1C1B19" }}>{val}</span>
                      <span style={{ fontSize: 11, color: "#8B8578" }}>{f.unit}</span>
                      {diff && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: diffNum < 0 ? "#16A34A" : diffNum > 0 ? "#EF4444" : "#8B8578" }}>
                          {diffNum > 0 ? "+" : ""}{diff}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}

        {measurements.length === 0 && !showForm && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📏</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1B19", marginBottom: 6 }}>Première prise</p>
            <p style={{ fontSize: 13, color: "#8B8578", lineHeight: 1.6, maxWidth: 240, margin: "0 auto 16px" }}>
              Enregistre tes premières mensurations pour suivre tes progrès.
            </p>
            <button onClick={() => setShowForm(true)} style={{ padding: "12px 24px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Saisir mes mensurations
            </button>
          </div>
        )}

        {/* Historique */}
        {measurements.length > 0 && (
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Historique</p>
            {measurements.slice(0, 5).map(m => (
              <div key={m.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(28,27,25,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 13, color: "#6B6560" }}>{new Date(m.measured_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                <div style={{ display: "flex", gap: 12 }}>
                  {m.weight_kg && <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1B19" }}>{m.weight_kg} kg</span>}
                  {m.waist_cm && <span style={{ fontSize: 12, color: "#8B8578" }}>T: {m.waist_cm} cm</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire de saisie */}
        <AnimatePresence>
          {showForm && (
            <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "flex-end" }}>
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
                style={{ backgroundColor: "white", borderRadius: "24px 24px 0 0", padding: "24px 20px", paddingBottom: "calc(24px + env(safe-area-inset-bottom))", width: "100%", maxHeight: "75vh", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1C1B19" }}>Nouvelle prise</h3>
                  <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8B8578" }}>×</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {FIELDS.map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: "#6B6560", display: "block", marginBottom: 4 }}>{f.emoji} {f.label} ({f.unit})</label>
                      <input type="number" step="0.1" placeholder="—" value={form[f.key] || ""}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        onFocus={e => setTimeout(() => e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" }), 350)}
                        inputMode="decimal"
                        style={{ width: "100%", padding: "12px 14px", border: "1px solid rgba(28,27,25,0.12)", borderRadius: 10, fontSize: 16, color: "#1C1B19", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                  ))}
                  <button onClick={save} disabled={saving}
                    style={{ width: "100%", padding: "14px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>
                    {saving ? "Sauvegarde..." : "Enregistrer"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </MobileLayout>
  );
}
