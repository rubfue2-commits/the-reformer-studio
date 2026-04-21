import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

type Mode = 'signin' | 'signup' | 'reset';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithApple, signInWithGoogle, resetPassword } = useAuth();
  const { language } = useLanguage();
  const t = (fr: string, en: string) => language === 'fr' ? fr : en;

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const resetMessages = () => { setErrorMsg(null); setInfoMsg(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    if (mode === 'reset') {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) setErrorMsg(error);
      else setInfoMsg(t('Email envoye !', 'Email sent!'));
      return;
    }

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) { setErrorMsg(t('Email ou mot de passe incorrect', 'Invalid email or password')); return; }
      navigate('/home');
      return;
    }

    if (password.length < 8) {
      setLoading(false);
      setErrorMsg(t('Mot de passe trop court (8 car. min.)', 'Password too short (8 chars min)'));
      return;
    }
    const { error } = await signUp({ email, password, firstName, lastName, language });
    setLoading(false);
    if (error) { setErrorMsg(error); return; }
    setInfoMsg(t('Compte cree !', 'Account created!'));
    setTimeout(() => navigate('/onboarding'), 1200);
  };

  const TABS: { id: Mode; fr: string; en: string }[] = [
    { id: 'signin', fr: 'Connexion', en: 'Sign in' },
    { id: 'signup', fr: 'Inscription', en: 'Sign up' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-foreground">The Reformer</h1>
          <p className="font-display text-3xl text-primary">Studio</p>
          <p className="font-body text-sm text-muted-foreground mt-2 tracking-widest uppercase">
            {t('Pilates · Bien-etre', 'Pilates · Wellness')}
          </p>
        </div>

        {mode !== 'reset' ? (
          <>
            <div className="flex border-b border-border mb-6">
              {TABS.map(tab => (
                <button key={tab.id} type="button"
                  onClick={() => { setMode(tab.id); resetMessages(); }}
                  className={`flex-1 pb-3 font-body text-sm ${mode === tab.id ? 'border-b-2 border-primary text-foreground -mb-px' : 'text-muted-foreground'}`}>
                  {language === 'fr' ? tab.fr : tab.en}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder={t('Prenom', 'First name')} value={firstName}
                    onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
                  <input className="input-field" placeholder={t('Nom', 'Last name')} value={lastName}
                    onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
                </div>
              )}
              <input type="email" required className="input-field" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} autoComplete="email" />
              <input type="password" required className="input-field"
                placeholder={t('Mot de passe', 'Password')} value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />

              {errorMsg && <p className="font-body text-sm text-red-500">{errorMsg}</p>}
              {infoMsg  && <p className="font-body text-sm text-green-600">{infoMsg}</p>}

              {mode === 'signin' && (
                <button type="button" onClick={() => { setMode('reset'); resetMessages(); }}
                  className="font-body text-xs text-muted-foreground text-right w-full">
                  {t('Mot de passe oublie ?', 'Forgot password?')}
                </button>
              )}

              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-foreground text-background font-body py-3 disabled:opacity-50">
                {loading ? '...' : mode === 'signin' ? t('Se connecter', 'Sign in') : t('Creer mon compte', 'Create account')}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="font-body text-xs text-muted-foreground uppercase tracking-widest">{t('ou', 'or')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              <button type="button" onClick={() => signInWithApple()}
                className="w-full rounded-xl border border-border bg-card py-3 font-body text-sm text-foreground flex items-center justify-center gap-2">
                <span>🍎</span>{t('Continuer avec Apple', 'Continue with Apple')}
              </button>
              <button type="button" onClick={() => signInWithGoogle()}
                className="w-full rounded-xl border border-border bg-card py-3 font-body text-sm text-foreground flex items-center justify-center gap-2">
                <span>🔵</span>{t('Continuer avec Google', 'Continue with Google')}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button type="button" onClick={() => { setMode('signin'); resetMessages(); }}
              className="font-body text-sm text-muted-foreground mb-2">
              &larr; {t('Retour', 'Back')}
            </button>
            <h2 className="font-display text-2xl text-foreground">
              {t('Reinitialiser le mot de passe', 'Reset password')}
            </h2>
            <input type="email" required className="input-field" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} />
            {errorMsg && <p className="font-body text-xs text-red-500">{errorMsg}</p>}
            {infoMsg  && <p className="font-body text-xs text-green-600">{infoMsg}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-foreground text-background font-body py-3 disabled:opacity-50">
              {loading ? '...' : t('Envoyer le lien', 'Send link')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
