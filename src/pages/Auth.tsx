import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

type Mode = 'signin' | 'signup' | 'reset';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const reset = () => { setError(null); setInfo(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);

    if (mode === 'reset') {
      const { error: err } = await resetPassword(email);
      setLoading(false);
      if (err) setError(err);
      else setInfo(t('Email envoyé !', 'Email sent!'));
      return;
    }

    if (mode === 'signin') {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) setError(t('Email ou mot de passe incorrect', 'Invalid email or password'));
      else navigate('/home');
      return;
    }

    if (password.length < 8) {
      setLoading(false);
      setError(t('Mot de passe trop court (8 car. min.)', 'Password too short (8 chars min)'));
      return;
    }
    const { error: err } = await signUp({ email, password, firstName, lastName, language });
    setLoading(false);
    if (err) setError(err);
    else {
      setInfo(t('Compte créé !', 'Account created!'));
      setTimeout(() => navigate('/onboarding'), 1200);
    }
  };

  const inputStyle = {
    width: '100%',
    height: 52,
    background: 'rgba(255,255,255,0.08)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 14,
    color: '#fff',
    fontFamily: 'DM Sans',
    fontSize: 16,
    padding: '0 16px',
    outline: 'none',
    WebkitAppearance: 'none' as const,
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--ios-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '48px 28px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: 'var(--ios-gold)', letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 8px' }}>
          THE REFORMER
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 48, fontWeight: 300, color: '#fff', margin: '0 0 4px', letterSpacing: -1 }}>
          Studio
        </h1>
        <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--ios-text-3)', margin: 0, letterSpacing: 1 }}>
          {t('Pilates · Bien-être', 'Pilates · Wellness')}
        </p>
      </div>

      {/* Tab selector (only for signin/signup) */}
      {mode !== 'reset' && (
        <div className="ios-segment" style={{ marginBottom: 24 }}>
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              className={`ios-segment-btn ${mode === m ? 'active' : ''}`}
              onClick={() => { setMode(m); reset(); }}
            >
              {m === 'signin' ? t('Connexion', 'Sign in') : t('Inscription', 'Sign up')}
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {mode === 'reset' && (
          <div style={{ marginBottom: 8 }}>
            <button type="button" onClick={() => { setMode('signin'); reset(); }}
              style={{ background: 'none', border: 'none', color: 'var(--ios-gold)', fontFamily: 'DM Sans', fontSize: 15, cursor: 'pointer', padding: '0 0 16px' }}>
              ← {t('Retour', 'Back')}
            </button>
            <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'var(--ios-text-2)', margin: 0 }}>
              {t('Saisis ton email pour recevoir un lien.', 'Enter your email to get a reset link.')}
            </p>
          </div>
        )}

        {mode === 'signup' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input style={inputStyle} placeholder={t('Prénom', 'First name')} value={firstName}
              onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
            <input style={inputStyle} placeholder={t('Nom', 'Last name')} value={lastName}
              onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
          </div>
        )}

        <input style={inputStyle} type="email" required placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} autoComplete="email" />

        {mode !== 'reset' && (
          <input style={inputStyle} type="password" required placeholder={t('Mot de passe', 'Password')}
            value={password} onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
        )}

        {error && (
          <div style={{ background: 'rgba(255,69,58,0.15)', border: '0.5px solid rgba(255,69,58,0.3)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#FF453A', margin: 0 }}>{error}</p>
          </div>
        )}
        {info && (
          <div style={{ background: 'rgba(48,209,88,0.15)', border: '0.5px solid rgba(48,209,88,0.3)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#30D158', margin: 0 }}>{info}</p>
          </div>
        )}

        {mode === 'signin' && (
          <button type="button" onClick={() => { setMode('reset'); reset(); }}
            style={{ background: 'none', border: 'none', color: 'var(--ios-gold)', fontFamily: 'DM Sans', fontSize: 13, cursor: 'pointer', textAlign: 'right', padding: '0 0 4px' }}>
            {t('Mot de passe oublié ?', 'Forgot password?')}
          </button>
        )}

        <button type="submit" disabled={loading} className="ios-btn-primary" style={{ marginTop: 4 }}>
          {loading ? '…' : mode === 'signin'
            ? t('Se connecter', 'Sign in')
            : mode === 'signup'
            ? t('Créer mon compte', 'Create account')
            : t('Envoyer le lien', 'Send link')}
        </button>

        {mode !== 'reset' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--ios-text-3)', textTransform: 'uppercase', letterSpacing: 1 }}>
                {t('ou', 'or')}
              </span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <button type="button" className="ios-btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span>🍎</span>
              <span>{t('Continuer avec Apple', 'Continue with Apple')}</span>
            </button>
          </>
        )}
      </form>

      <div style={{ height: 40 }} />
    </div>
  );
}
