import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useLanguage } from '@/i18n/LanguageContext';

type Metric = 'weight_kg' | 'waist_cm' | 'hips_cm' | 'chest_cm' | 'thigh_cm' | 'arm_cm';

const METRICS: { id: Metric; fr: string; en: string; unit: string; color: string }[] = [
  { id: 'weight_kg', fr: 'Poids',    en: 'Weight',  unit: 'kg', color: '#B8973E' },
  { id: 'waist_cm',  fr: 'Taille',   en: 'Waist',   unit: 'cm', color: '#4CAF50' },
  { id: 'hips_cm',   fr: 'Hanches',  en: 'Hips',    unit: 'cm', color: '#E91E63' },
  { id: 'chest_cm',  fr: 'Poitrine', en: 'Chest',   unit: 'cm', color: '#2196F3' },
  { id: 'thigh_cm',  fr: 'Cuisse',   en: 'Thigh',   unit: 'cm', color: '#9C27B0' },
  { id: 'arm_cm',    fr: 'Bras',     en: 'Arm',     unit: 'cm', color: '#FF5722' },
];

export default function Progress() {
  const navigate = useNavigate();
  const { measurements, latest, loading, addMeasurement } = useMeasurements();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const [activeMetric, setActiveMetric] = useState<Metric>('weight_kg');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Record<Metric, string>>>({});
  const [saving, setSaving] = useState(false);

  const cfg = METRICS.find(m => m.id === activeMetric)!;

  // Get the last 8 entries for the active metric
  const chartData = measurements
    .slice(0, 8)
    .reverse()
    .filter(m => m[activeMetric] !== null);

  const currentVal = latest?.[activeMetric];
  const prevVal = measurements[1]?.[activeMetric];
  const diff = currentVal != null && prevVal != null
    ? (currentVal - prevVal).toFixed(1)
    : null;

  const maxVal = chartData.length > 0
    ? Math.max(...chartData.map(m => Number(m[activeMetric] ?? 0)))
    : 1;
  const minVal = chartData.length > 0
    ? Math.min(...chartData.map(m => Number(m[activeMetric] ?? 0)))
    : 0;
  const range = maxVal - minVal || 1;

  const handleSave = async () => {
    setSaving(true);
    const entry: any = { measured_at: new Date().toISOString().split('T')[0] };
    METRICS.forEach(m => {
      if (form[m.id]) entry[m.id] = parseFloat(form[m.id]!);
    });
    await addMeasurement(entry);
    setSaving(false);
    setShowForm(false);
    setForm({});
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">
          {t('Progrès', 'Progress')}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-yellow-500 text-black font-body text-xs px-4 py-2"
        >
          + {t('Mesure', 'Measure')}
        </button>
      </div>

      <div className="px-6 space-y-5">
        {/* Metric selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {METRICS.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs transition-all border flex-shrink-0 ${
                activeMetric === m.id
                  ? 'text-black border-transparent'
                  : 'bg-card text-muted-foreground border-border'
              }`}
              style={activeMetric === m.id ? { backgroundColor: m.color } : {}}
            >
              {language === 'fr' ? m.fr : m.en}
            </button>
          ))}
        </div>

        {/* Current value card */}
        <div className="rounded-3xl bg-card border border-border p-5">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                {language === 'fr' ? cfg.fr : cfg.en} {t('actuel', 'current')}
              </p>
              {loading ? (
                <p className="font-display text-4xl text-muted-foreground">--</p>
              ) : currentVal != null ? (
                <p className="font-display text-4xl text-foreground">
                  {currentVal}
                  <span className="font-body text-lg text-muted-foreground ml-1">{cfg.unit}</span>
                </p>
              ) : (
                <p className="font-display text-xl text-muted-foreground">
                  {t('Aucune donnée', 'No data')}
                </p>
              )}
            </div>
            {diff !== null && (
              <p
                className="font-display text-xl font-bold"
                style={{ color: parseFloat(diff) <= 0 ? '#4CAF50' : '#EF4444' }}
              >
                {parseFloat(diff) > 0 ? '+' : ''}{diff} {cfg.unit}
              </p>
            )}
          </div>

          {/* Mini bar chart */}
          {chartData.length > 1 ? (
            <div className="flex items-end gap-1.5 h-16">
              {chartData.map((m, i) => {
                const val = Number(m[activeMetric] ?? 0);
                const heightPct = ((val - minVal) / range) * 70 + 30;
                const isLast = i === chartData.length - 1;
                return (
                  <div key={m.id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: heightPct + '%',
                        backgroundColor: isLast ? cfg.color : cfg.color + '55',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center">
              <p className="font-body text-xs text-muted-foreground">
                {t('Ajoute des mesures pour voir l'évolution', 'Add measurements to track progress')}
              </p>
            </div>
          )}
        </div>

        {/* History list */}
        {measurements.length > 0 && (
          <div>
            <h2 className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-3">
              {t('Historique', 'History')}
            </h2>
            <div className="space-y-2">
              {measurements.slice(0, 6).map((m, i) => (
                <div
                  key={m.id}
                  className="rounded-2xl bg-card border border-border px-4 py-3 flex items-center justify-between"
                >
                  <p className="font-body text-sm text-muted-foreground">
                    {new Date(m.measured_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                      day: 'numeric', month: 'short'
                    })}
                  </p>
                  <p className="font-display text-lg text-foreground">
                    {m[activeMetric] ?? '--'}
                    <span className="font-body text-sm text-muted-foreground ml-1">{cfg.unit}</span>
                  </p>
                  {i === 0 && (
                    <span className="font-body text-[10px] bg-yellow-500/20 text-yellow-600 rounded-full px-2 py-0.5">
                      {t('Dernier', 'Latest')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add measure modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setShowForm(false)}>
          <div
            className="w-full bg-background rounded-t-3xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl text-foreground">
              {t('Nouvelle mesure', 'New measurement')}
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              {t("Remplis les champs que tu as mesurés.", "Fill in the fields you measured.")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {METRICS.map(m => (
                <div key={m.id}>
                  <label className="font-body text-xs text-muted-foreground uppercase tracking-wide block mb-1">
                    {language === 'fr' ? m.fr : m.en} ({m.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form[m.id] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [m.id]: e.target.value }))}
                    placeholder="--"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || Object.values(form).every(v => !v)}
              className="w-full rounded-xl bg-yellow-500 text-black font-body py-3 font-semibold disabled:opacity-40"
            >
              {saving ? '...' : t('Enregistrer', 'Save')}
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around px-4 py-3">
        {[
          { path: '/home',     label: t('Accueil','Home'),    active: false },
          { path: '/library',  label: t('Vidéos','Videos'),   active: false },
          { path: '/progress', label: t('Progrès','Progress'),active: true  },
          { path: '/profile',  label: t('Profil','Profile'),  active: false },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 font-body text-[10px] uppercase tracking-wide ${
              item.active ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            <span className={`w-1 h-1 rounded-full ${item.active ? 'bg-yellow-500' : 'bg-transparent'}`} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
