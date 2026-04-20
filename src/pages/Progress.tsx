import { useState } from 'react';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useLanguage } from '@/i18n/LanguageContext';

type Metric = 'weight_kg' | 'waist_cm' | 'hips_cm' | 'chest_cm' | 'thigh_cm' | 'arm_cm';

const METRICS: { id: Metric; fr: string; en: string; unit: string; color: string }[] = [
  { id: 'weight_kg', fr: 'Poids',    en: 'Weight',  unit: 'kg', color: '#C4963A' },
  { id: 'waist_cm',  fr: 'Taille',   en: 'Waist',   unit: 'cm', color: '#30D158' },
  { id: 'hips_cm',   fr: 'Hanches',  en: 'Hips',    unit: 'cm', color: '#FF453A' },
  { id: 'chest_cm',  fr: 'Poitrine', en: 'Chest',   unit: 'cm', color: '#0A84FF' },
  { id: 'thigh_cm',  fr: 'Cuisse',   en: 'Thigh',   unit: 'cm', color: '#BF5AF2' },
  { id: 'arm_cm',    fr: 'Bras',     en: 'Arm',     unit: 'cm', color: '#FF9F0A' },
];

export default function Progress() {
  const { measurements, latest, loading, addMeasurement } = useMeasurements();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const [activeMetric, setActiveMetric] = useState<Metric>('weight_kg');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Record<Metric, string>>>({});
  const [saving, setSaving] = useState(false);

  const cfg = METRICS.find(m => m.id === activeMetric)!;
  const currentVal = latest?.[activeMetric];
  const prev = measurements[1]?.[activeMetric];
  const diff = currentVal != null && prev != null ? (Number(currentVal) - Number(prev)).toFixed(1) : null;

  const chartData = measurements.slice(0, 8).reverse();
  const vals = chartData.map(m => Number(m[activeMetric] ?? 0)).filter(v => v > 0);
  const maxVal = vals.length ? Math.max(...vals) : 1;
  const minVal = vals.length ? Math.min(...vals) : 0;
  const range = maxVal - minVal || 1;

  const handleSave = async () => {
    setSaving(true);
    const entry: Record<string, unknown> = { measured_at: new Date().toISOString().split('T')[0] };
    METRICS.forEach(m => { if (form[m.id]) entry[m.id] = parseFloat(form[m.id]!); });
    await addMeasurement(entry as Parameters<typeof addMeasurement>[0]);
    setSaving(false);
    setShowModal(false);
    setForm({});
  };

  return (
    <div className="ios-page">
      {/* Nav */}
      <div className="ios-nav" style={{ top: 44 }}>
        <span className="ios-nav-title">{t('Progrès', 'Progress')}</span>
        <button className="ios-nav-btn" onClick={() => setShowModal(true)}>+ {t('Mesure', 'Add')}</button>
      </div>

      <div style={{ paddingTop: 8 }}>
        {/* Metric chips */}
        <div className="ios-scroll-row" style={{ paddingTop: 12, paddingBottom: 12 }}>
          {METRICS.map(m => {
            const active = activeMetric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id)}
                style={{
                  flexShrink: 0,
                  height: 32,
                  padding: '0 14px',
                  borderRadius: 20,
                  border: 'none',
                  fontFamily: 'DM Sans',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: active ? m.color : 'var(--ios-card)',
                  color: active ? '#000' : 'var(--ios-text-2)',
                  transition: 'all 0.2s',
                }}
              >
                {language === 'fr' ? m.fr : m.en}
              </button>
            );
          })}
        </div>

        {/* Current value card */}
        <div style={{ margin: '0 16px 12px', background: 'var(--ios-card)', borderRadius: 20, padding: 18 }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: 'var(--ios-text-3)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>
            {language === 'fr' ? cfg.fr : cfg.en}
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              {loading ? (
                <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 52, color: 'var(--ios-text-3)' }}>--</div>
              ) : currentVal != null ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond', fontSize: 52, fontWeight: 400, color: '#fff', lineHeight: 1 }}>{currentVal}</span>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 16, color: 'var(--ios-text-2)' }}>{cfg.unit}</span>
                </div>
              ) : (
                <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: 'var(--ios-text-3)', margin: 0 }}>{t('Aucune donnée', 'No data')}</p>
              )}
            </div>
            {diff !== null && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: 20, fontWeight: 600, color: parseFloat(diff) <= 0 ? '#30D158' : '#FF453A' }}>
                  {parseFloat(diff) > 0 ? '+' : ''}{diff}
                </span>
                <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--ios-text-3)', margin: 0 }}>{cfg.unit}</p>
              </div>
            )}
          </div>

          {/* Mini bar chart */}
          {chartData.length > 1 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 60 }}>
              {chartData.map((m, i) => {
                const val = Number(m[activeMetric] ?? 0);
                if (!val) return <div key={m.id} style={{ flex: 1 }} />;
                const h = ((val - minVal) / range) * 70 + 30;
                const isLast = i === chartData.length - 1;
                return (
                  <div key={m.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ height: h + '%', background: isLast ? cfg.color : cfg.color + '44', borderRadius: '3px 3px 0 0', transition: 'height 0.4s' }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--ios-text-3)', margin: 0 }}>
                {t('Ajoute des mesures pour voir ton évolution', 'Add measurements to see your progress')}
              </p>
            </div>
          )}
        </div>

        {/* History */}
        {measurements.length > 0 && (
          <>
            <div className="ios-section-header">{t('Historique', 'History')}</div>
            <div className="ios-list" style={{ margin: '0 16px 16px' }}>
              {measurements.slice(0, 6).map((m, i) => (
                <div key={m.id} className="ios-list-item">
                  <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--ios-text-2)', flex: 1 }}>
                    {new Date(m.measured_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontFamily: 'Cormorant Garamond', fontSize: 22, color: '#fff' }}>
                    {m[activeMetric] ?? '--'}
                  </span>
                  <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--ios-text-3)', marginLeft: 4 }}>{cfg.unit}</span>
                  {i === 0 && (
                    <span style={{ marginLeft: 8, background: cfg.color + '22', color: cfg.color, fontFamily: 'DM Sans', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 10 }}>
                      {t('Dernier', 'Latest')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#1C1C1E', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
            <p style={{ fontFamily: 'Cormorant Garamond', fontSize: 26, color: '#fff', margin: '0 0 16px' }}>
              {t('Nouvelle mesure', 'New measurement')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {METRICS.map(m => (
                <div key={m.id}>
                  <label style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--ios-text-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {language === 'fr' ? m.fr : m.en} ({m.unit})
                  </label>
                  <input
                    type="number" step="0.1"
                    value={form[m.id] ?? ''}
                    onChange={e => setForm(p => ({ ...p, [m.id]: e.target.value }))}
                    placeholder="--"
                    className="ios-input"
                    style={{ height: 44, fontSize: 15 }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || Object.values(form).every(v => !v)}
              className="ios-btn-primary"
            >
              {saving ? '...' : t('Enregistrer', 'Save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
