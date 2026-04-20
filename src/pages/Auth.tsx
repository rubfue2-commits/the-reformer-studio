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
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  const [infoMsg, setInfoMsg]     = useState<string | null>(null);

  const resetMessages = () => { setErrorMsg(null); setInfoMsg(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    if (mode === 'reset') {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) setErrorMsg(error);
      else setInfoMsg(t(
        'Email envoyé ! Vérifie ta boîte mail.',
        'Email sent! Check your inbox.'
      ));
      return;
    }

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(t('Email ou mot de passe incorrect.', 'Invalid email or password.'));
        return;
      }
      navigate('/home');
      return;
    }

    // signup
    if (password.length < 8) {
      setLoading(false);
      setErrorMsg(t('Le mot de passe doit faire au moins 8 caractères.', 'Password must be at least 8 characters.'));
      return;
    }
    const { error } = await signUp({ email, password, firstName, lastName, language });
    setLoading(false);
    if (error) { setErrorMsg(error); return; }
    setInfoMsg(t(
      'Compte créé ! Vérifie ta boîte mail pour confirmer.',
      'Account created! Check your inbox to confirm.'
    ));
    // If email confirmation is disabled in Supabase, navigate directly
    setTimeout(() => navigate('/onboarding'), 1500);
  };

  const oauthLogin = async (provider: 'apple' | 'google') => {
    resetMessages();
    const fn = provider === 'apple' ? signInWithApple : signInWithGoogle;
    const { error } = await fn();
    if (error) setErrorMsg(error);
  };

  const TABS: { id: Mode; fr: string; en: string }[] = [
    { id: 'signin', fr: 'Connexion',  en: 'Sign in'   },
    { id: 'signup', fr: 'Inscription', en: 'Sign up'  },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-foreground">The Reformer</h1>
          <p className="font-display text-4xl text-yellow-500">Studio</p>
          <p className="font-body text-sm text-muted-foreground mt-2">
            {t('Pilates · Bien-être · Transformation', 'Pilates · Wellness · Transformation')}
          </p>
        </div>

        {mode !== 'reset' ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setMode(tab.id); resetMessages(); }}
                  className={`flex-1 pb-3 font-body text-sm transition-colors ${
                    mode === tab.id
                      ? 'border-b-2 border-yellow-500 text-foreground -mb-[1px]'
                      : 'text-muted-foreground'
                  }`}
                >
                  {language === 'fr' ? tab.fr : tab.en}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={t('Prénom', 'First name')}
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="bg-card border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground w-full"
                  />
                  <input
                    type="text"
                    placeholder={t('Nom', 'Last name')}
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="bg-card border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground w-full"
                  />
                </div>
              )}

              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground"
              />

              <input
                type="password"
                required
                minLength={mode === 'signup' ? 8 : 1}
                placeholder={t('Mot de passe', 'Password')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground"
              />

              {errorMsg && <p className="font-body text-xs text-red-400">{errorMsg}</p>}
              {infoMsg  && <p className="font-body text-xs text-green-500">{infoMsg}</p>}

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => { setMode('reset'); resetMessages(); }}
                  className="font-body text-xs text-muted-foreground hover:text-foreground text-right w-full"
                >
                  {t('Mot de passe oublié ?', 'Forgot password?')}
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-foreground text-background font-body py-3.5 text-sm font-semibold disabled:opacity-50 mt-1"
              >
                {loading ? '...' : mode === 'signin'
                  ? t('Se connecter', 'Sign in')
                  : t('Créer mon compte', 'Create account')}
              </button>
            </form>

            {/* OAuth divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">
                {t('ou', 'or')}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => oauthLogin('apple')}
                className="w-full rounded-xl border border-border bg-card py-3 font-body text-sm text-foreground flex items-center justify-center gap-2"
              >
                <span>🍎</span>
                {t('Continuer avec Apple', 'Continue with Apple')}
              </button>
              <button
                type="button"
                onClick={() => oauthLogin('google')}
                className="w-full rounded-xl border border-border bg-card py-3 font-body text-sm text-foreground flex items-center justify-center gap-2"
              >
                <span>🔵</span>
                {t('Continuer avec Google', 'Continue with Google')}
              </button>
            </div>
          </>
        ) : (
          /* Reset password form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => { setMode('signin'); resetMessages(); }}
              className="font-body text-sm text-muted-foreground mb-2"
            >
              ← {t('Retour', 'Back')}
            </button>
            <h2 className="font-display text-2xl text-foreground">
              {t('Réinitialiser le mot de passe', 'Reset password')}
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              {t(
                'Entre ton email pour recevoir un lien de réinitialisation.',
                'Enter your email to receive a reset link.'
              )}
            </p>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground"
            />
            {errorMsg && <p className="font-body text-xs text-red-400">{errorMsg}</p>}
            {infoMsg  && <p className="font-body text-xs text-green-500">{infoMsg}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-foreground text-background font-body py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? '...' : t('Envoyer le lien', 'Send reset link')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
