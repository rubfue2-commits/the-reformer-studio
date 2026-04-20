import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { usePreferences } from '@/hooks/usePreferences';
import { useSessions } from '@/hooks/useSessions';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { preferences } = usePreferences();
  const { stats } = useSessions();
  const { language, setLanguage } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const initials = [profile?.first_name, profile?.last_name]
    .filter(Boolean).map(s => s![0].toUpperCase()).join('') || '?';

  const startEdit = () => {
    setFirstName(profile?.first_name ?? '');
    setLastName(profile?.last_name ?? '');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ first_name: firstName, last_name: lastName });
    setSaving(false);
    setEditing(false);
  };

  const handleLangToggle = async () => {
    const nl = language === 'fr' ? 'en' : 'fr';
    setLanguage(nl);
    await updateProfile({ language: nl });
  };

  const diffLabel = (d: string | null) => {
    if (!d) return '—';
    return language === 'fr'
      ? d === 'beginner' ? 'Débutante' : d === 'intermediate' ? 'Intermédiaire' : 'Avancée'
      : d === 'beginner' ? 'Beginner' : d === 'intermediate' ? 'Intermediate' : 'Advanced';
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '0.5px solid var(--ios-separator)',
    cursor: 'pointer' as const,
  };

  return (
    <div className="ios-page">
      {/* Nav */}
      <div className="ios-nav" style={{ top: 44 }}>
        <span className="ios-nav-title">{t('Profil', 'Profile')}</span>
        {!editing ? (
          <button className="ios-nav-btn" onClick={startEdit}>{t('Modifier', 'Edit')}</button>
        ) : (
          <button className="ios-nav-btn" onClick={handleSave} style={{ fontWeight: 600 }}>
            {saving ? '...' : t('OK', 'Done')}
          </button>
        )}
      </div>

      <div style={{ paddingTop: 12 }}>
        {/* Avatar section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px 24px' }}>
          <div style={{
            width: 88, height: 88,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C4963A, #8B6B2A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
            boxShadow: '0 0 0 4px rgba(196,150,58,0.2)',
          }}>
            <span style={{ fontFamily: 'Cormorant Garamond', fontSize: 36, color: '#000', fontWeight: 400 }}>
              {initials}
            </span>
          </div>

          {editing ? (
            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 260 }}>
              <input className="ios-input" style={{ height: 42, fontSize: 15, textAlign: 'center' }}
                value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder={t('Prénom', 'First name')} />
              <input className="ios-input" style={{ height: 42, fontSize: 15, textAlign: 'center' }}
                value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder={t('Nom', 'Last name')} />
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'Cormorant Garamond', fontSize: 26, color: '#fff', margin: '0 0 3px', letterSpacing: -0.3 }}>
                {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || t('Ton nom', 'Your name')}
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--ios-text-3)', margin: 0 }}>
                {profile?.email}
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '0 16px 20px' }}>
          {[
            { label: t('Séances', 'Sessions'), value: stats.totalSessions },
            { label: t('Minutes', 'Minutes'), value: stats.totalMinutes },
            { label: t('Streak', 'Streak'), value: stats.currentStreakDays },
          ].map(s => (
            <div key={s.label} className="ios-stat">
              <div className="ios-stat-value">{s.value}</div>
              <div className="ios-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Preferences */}
        {preferences && (
          <>
            <div className="ios-section-header">{t('Mes objectifs', 'My goals')}</div>
            <div className="ios-list" style={{ margin: '0 16px 16px' }}>
              <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--ios-separator)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(preferences.goals ?? []).map(g => (
                    <span key={g} style={{ background: 'var(--ios-gold-light)', color: 'var(--ios-gold)', fontFamily: 'DM Sans', fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 20, border: '0.5px solid rgba(196,150,58,0.3)' }}>
                      {g}
                    </span>
                  ))}
                  {!preferences.goals?.length && (
                    <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--ios-text-3)' }}>
                      {t('Aucun objectif', 'No goals')}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ ...rowStyle, cursor: 'default' }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--ios-text)' }}>{t('Niveau', 'Level')}</span>
                <span style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--ios-text-3)' }}>{diffLabel(preferences.experience_level)}</span>
              </div>
              <div style={{ ...rowStyle, borderBottom: 'none', cursor: 'default' }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--ios-text)' }}>{t('Fréquence', 'Frequency')}</span>
                <span style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--ios-text-3)' }}>
                  {preferences.weekly_frequency}× / {t('sem.', 'week')}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Settings */}
        <div className="ios-section-header">{t('Réglages', 'Settings')}</div>
        <div className="ios-list" style={{ margin: '0 16px 16px' }}>
          {/* Language */}
          <div style={rowStyle} onClick={handleLangToggle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="ios-list-icon" style={{ background: '#2C2C2E' }}>🌍</div>
              <span style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--ios-text)' }}>{t('Langue', 'Language')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--ios-text-3)' }}>
                {language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
              </span>
              <span className="ios-list-chevron">›</span>
            </div>
          </div>

          {/* Progress */}
          <div style={rowStyle} onClick={() => navigate('/progress')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="ios-list-icon" style={{ background: '#2C2C2E' }}>📊</div>
              <span style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--ios-text)' }}>{t('Mes mesures', 'Measurements')}</span>
            </div>
            <span className="ios-list-chevron">›</span>
          </div>

          {/* Subscription */}
          <div style={rowStyle} onClick={() => navigate('/subscription')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="ios-list-icon" style={{ background: '#2C2C2E' }}>💳</div>
              <span style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--ios-text)' }}>{t('Abonnement', 'Subscription')}</span>
            </div>
            <span className="ios-list-chevron">›</span>
          </div>

          {/* Sign out */}
          <div style={{ ...rowStyle, borderBottom: 'none' }} onClick={() => setShowSignOut(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="ios-list-icon" style={{ background: 'rgba(255,69,58,0.15)' }}>🚪</div>
              <span style={{ fontFamily: 'DM Sans', fontSize: 15, color: '#FF453A' }}>{t('Se déconnecter', 'Sign out')}</span>
            </div>
            <span style={{ color: '#FF453A' }}>›</span>
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Sign out sheet */}
      {showSignOut && (
        <div onClick={() => setShowSignOut(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#1C1C1E', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 24px' }} />
            <p style={{ fontFamily: 'Cormorant Garamond', fontSize: 26, color: '#fff', margin: '0 0 8px' }}>
              {t('Se déconnecter ?', 'Sign out?')}
            </p>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--ios-text-3)', margin: '0 0 24px' }}>
              {t('Tu pourras te reconnecter à tout moment.', 'You can sign back in at any time.')}
            </p>
            <button onClick={async () => { await signOut(); navigate('/auth'); }}
              style={{ width: '100%', height: 54, background: 'rgba(255,69,58,0.15)', border: '0.5px solid rgba(255,69,58,0.3)', borderRadius: 14, color: '#FF453A', fontFamily: 'DM Sans', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
              {t('Déconnecter', 'Sign out')}
            </button>
            <button onClick={() => setShowSignOut(false)} className="ios-btn-secondary">
              {t('Annuler', 'Cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
