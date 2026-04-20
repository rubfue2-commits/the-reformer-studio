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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleLanguageToggle = async () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
    await updateProfile({ language: newLang });
  };

  const initials = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .map(s => s![0].toUpperCase())
    .join('') || '?';

  const difficultyLabel = (d: string | null) => {
    if (!d) return '—';
    if (language === 'fr') {
      return d === 'beginner' ? 'Débutante' : d === 'intermediate' ? 'Intermédiaire' : 'Avancée';
    }
    return d === 'beginner' ? 'Beginner' : d === 'intermediate' ? 'Intermediate' : 'Advanced';
  };

  const goalLabel = (g: string) => {
    const map: Record<string, [string, string]> = {
      weight_loss:    ['Perte de poids',  'Weight loss'],
      strength:       ['Renforcement',    'Strength'],
      flexibility:    ['Souplesse',       'Flexibility'],
      posture:        ['Posture',         'Posture'],
      rehabilitation: ['Rééducation',     'Rehabilitation'],
      relaxation:     ['Relaxation',      'Relaxation'],
    };
    const entry = map[g];
    return entry ? (language === 'fr' ? entry[0] : entry[1]) : g;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="font-display text-3xl text-foreground">
          {t('Mon profil', 'My profile')}
        </h1>
      </div>

      <div className="px-6 space-y-4">
        {/* Avatar + name card */}
        <div className="rounded-3xl bg-card border border-border p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
              <span className="font-display text-2xl text-black">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder={t('Prénom', 'First name')}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground"
                  />
                  <input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder={t('Nom', 'Last name')}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground"
                  />
                </div>
              ) : (
                <>
                  <p className="font-display text-xl text-foreground truncate">
                    {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || t('Sans nom', 'No name')}
                  </p>
                  <p className="font-body text-sm text-muted-foreground truncate">
                    {profile?.email ?? ''}
                  </p>
                </>
              )}
            </div>
          </div>

          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border border-border py-2 font-body text-sm text-muted-foreground"
              >
                {t('Annuler', 'Cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-yellow-500 text-black py-2 font-body text-sm font-semibold disabled:opacity-40"
              >
                {saving ? '...' : t('Enregistrer', 'Save')}
              </button>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="w-full rounded-xl border border-border py-2 font-body text-sm text-muted-foreground"
            >
              ✏️ {t('Modifier le profil', 'Edit profile')}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('Séances', 'Sessions'), value: stats.totalSessions },
            { label: t('Minutes', 'Minutes'),  value: stats.totalMinutes },
            { label: t('Streak', 'Streak'),    value: stats.currentStreakDays },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-card border border-border p-4 text-center">
              <p className="font-display text-3xl text-foreground">{s.value}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Objectives */}
        {preferences && (
          <div className="rounded-3xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-sm font-semibold text-foreground">
                {t('Mes objectifs', 'My goals')}
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="font-body text-xs text-yellow-500"
              >
                {t('Modifier', 'Edit')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(preferences.goals ?? []).map(g => (
                <span key={g} className="font-body text-xs bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 rounded-full px-3 py-1">
                  {goalLabel(g)}
                </span>
              ))}
              {(preferences.goals ?? []).length === 0 && (
                <span className="font-body text-xs text-muted-foreground">
                  {t('Aucun objectif défini', 'No goals set')}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="font-body text-sm text-muted-foreground">{t('Niveau', 'Level')}</p>
              <p className="font-body text-sm text-foreground">{difficultyLabel(preferences.experience_level)}</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="font-body text-sm text-muted-foreground">{t('Fréquence', 'Frequency')}</p>
              <p className="font-body text-sm text-foreground">
                {preferences.weekly_frequency}× / {t('semaine', 'week')}
              </p>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden">
          {/* Language toggle */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <p className="font-body text-sm text-foreground">
              {t('Langue', 'Language')}
            </p>
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-2 rounded-full bg-background border border-border px-4 py-1.5"
            >
              <span className="font-body text-sm text-foreground">
                {language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
              </span>
              <span className="font-body text-xs text-muted-foreground">
                → {language === 'fr' ? 'EN' : 'FR'}
              </span>
            </button>
          </div>

          {/* Progress link */}
          <button
            onClick={() => navigate('/progress')}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-border"
          >
            <p className="font-body text-sm text-foreground">
              📊 {t('Mes mesures', 'My measurements')}
            </p>
            <span className="text-muted-foreground">›</span>
          </button>

          {/* Sign out */}
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <p className="font-body text-sm text-red-400">
              {t('Se déconnecter', 'Sign out')}
            </p>
            <span className="text-red-400">›</span>
          </button>
        </div>
      </div>

      {/* Sign out confirmation */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6">
          <div className="w-full max-w-sm bg-background rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-2xl text-foreground">
              {t('Se déconnecter ?', 'Sign out?')}
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              {t('Tu pourras te reconnecter à tout moment.', 'You can sign back in at any time.')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 rounded-xl border border-border py-3 font-body text-sm text-muted-foreground"
              >
                {t('Annuler', 'Cancel')}
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 rounded-xl bg-red-500 text-white py-3 font-body text-sm font-semibold"
              >
                {t('Déconnecter', 'Sign out')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around px-4 py-3">
        {[
          { path: '/home',     label: t('Accueil','Home'),    active: false },
          { path: '/library',  label: t('Vidéos','Videos'),   active: false },
          { path: '/progress', label: t('Progrès','Progress'),active: false },
          { path: '/profile',  label: t('Profil','Profile'),  active: true  },
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
