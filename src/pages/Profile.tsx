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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl text-foreground">{t('Profil', 'Profile')}</h1>
        {!editing ? (
          <button onClick={startEdit} className="font-body text-sm text-primary">{t('Modifier', 'Edit')}</button>
        ) : (
          <button onClick={handleSave} className="font-body text-sm text-primary font-semibold">
            {saving ? '...' : t('OK', 'Done')}
          </button>
        )}
      </div>

      <div className="px-6 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-3">
            <span className="font-display text-3xl text-white">{initials}</span>
          </div>
          {editing ? (
            <div className="flex gap-2 w-full max-w-xs">
              <input className="input-field text-center" value={firstName}
                onChange={e => setFirstName(e.target.value)} placeholder={t('Prenom', 'First name')} />
              <input className="input-field text-center" value={lastName}
                onChange={e => setLastName(e.target.value)} placeholder={t('Nom', 'Last name')} />
            </div>
          ) : (
            <>
              <p className="font-display text-2xl text-foreground">
                {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || t('Ton nom', 'Your name')}
              </p>
              <p className="font-body text-sm text-muted-foreground">{profile?.email}</p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('Seances', 'Sessions'), value: stats.totalSessions },
            { label: t('Minutes', 'Minutes'),  value: stats.totalMinutes  },
            { label: t('Streak', 'Streak'),    value: stats.currentStreakDays },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-card border border-border p-4 text-center">
              <p className="font-display text-3xl text-foreground">{s.value}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Preferences */}
        {preferences && (
          <div className="rounded-3xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-sm font-semibold text-foreground">{t('Mes objectifs', 'My goals')}</p>
              <button onClick={() => navigate('/onboarding')} className="font-body text-xs text-primary">
                {t('Modifier', 'Edit')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(preferences.goals ?? []).map(g => (
                <span key={g} className="font-body text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1">
                  {g}
                </span>
              ))}
            </div>
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex justify-between">
                <span className="font-body text-sm text-muted-foreground">{t('Niveau', 'Level')}</span>
                <span className="font-body text-sm text-foreground">{preferences.experience_level ?? '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-sm text-muted-foreground">{t('Frequence', 'Frequency')}</span>
                <span className="font-body text-sm text-foreground">{preferences.weekly_frequency}x / {t('sem.', 'week')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Settings list */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border cursor-pointer" onClick={handleLangToggle}>
            <p className="font-body text-sm text-foreground">🌍 {t('Langue', 'Language')}</p>
            <p className="font-body text-sm text-muted-foreground">{language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'} ›</p>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border cursor-pointer" onClick={() => navigate('/progress')}>
            <p className="font-body text-sm text-foreground">📊 {t('Mes mesures', 'Measurements')}</p>
            <span className="text-muted-foreground">›</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border cursor-pointer" onClick={() => navigate('/subscription')}>
            <p className="font-body text-sm text-foreground">💳 {t('Abonnement', 'Subscription')}</p>
            <span className="text-muted-foreground">›</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setShowSignOut(true)}>
            <p className="font-body text-sm text-red-500">🚪 {t('Se deconnecter', 'Sign out')}</p>
            <span className="text-red-400">›</span>
          </div>
        </div>
      </div>

      {/* Sign out modal */}
      {showSignOut && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6"
          onClick={() => setShowSignOut(false)}>
          <div className="w-full max-w-sm bg-background rounded-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-foreground">{t('Se deconnecter ?', 'Sign out?')}</h2>
            <p className="font-body text-sm text-muted-foreground">
              {t('Tu pourras te reconnecter a tout moment.', 'You can sign back in anytime.')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSignOut(false)}
                className="flex-1 rounded-xl border border-border py-3 font-body text-sm text-muted-foreground">
                {t('Annuler', 'Cancel')}
              </button>
              <button onClick={async () => { await signOut(); navigate('/auth'); }}
                className="flex-1 rounded-xl bg-red-500 text-white py-3 font-body text-sm font-semibold">
                {t('Deconnecter', 'Sign out')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around px-4 py-3">
        {[
          { path: '/home',     label: t('Accueil','Home'),    active: false },
          { path: '/library',  label: t('Videos','Videos'),   active: false },
          { path: '/progress', label: t('Progres','Progress'),active: false },
          { path: '/profile',  label: t('Profil','Profile'),  active: true  },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 font-body text-[10px] uppercase tracking-wide ${item.active ? 'text-primary' : 'text-muted-foreground'}`}>
            <span className={`w-1 h-1 rounded-full ${item.active ? 'bg-primary' : 'bg-transparent'}`} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
