import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

type Mode = "signin" | "signup" | "reset";

// Page CGV — a creer dans src/pages/CGV.tsx ou remplacer par une URL externe
const CGV_URL = "/cgv";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithApple, signInWithGoogle, resetPassword } = useAuth();
  const { language } = useLanguage();
  const fr = language === "fr";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const clear = () => { setErrorMsg(null); setInfoMsg(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clear();

    // Validation CGV uniquement a l inscription
    if (mode === "signup" && !cgvAccepted) {
      setErrorMsg(fr
        ? "Veuillez accepter les conditions generales de vente pour continuer."
        : "Please accept the terms and conditions to continue.");
      return;
    }

    setLoading(true);

    if (mode === "reset") {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) setErrorMsg(error);
      else setInfoMsg(fr ? "Email envoye !" : "Email sent!");
      return;
    }

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) setErrorMsg(fr ? "Email ou mot de passe incorrect" : "Invalid email or password");
      else navigate("/home");
      return;
    }

    // Signup
    if (password.length < 8) {
      setLoading(false);
      setErrorMsg(fr ? "Mot de passe trop court (8 min)" : "Password too short (8 chars min)");
      return;
    }
    const { error } = await signUp({ email, password, firstName, lastName, language });
    setLoading(false);
    if (error) setErrorMsg(error);
    else {
      setInfoMsg(fr ? "Compte cree !" : "Account created!");
      setTimeout(() => navigate("/onboarding"), 1000);
    }
  };

  const inputCls = "w-full rounded-xl border border-border bg-card text-foreground font-body text-sm px-4 py-3 outline-none focus:border-primary placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-body text-xs text-primary tracking-widest uppercase mb-1">CONNECT</p>
          <h1 className="font-display text-5xl text-foreground font-light" style={{ letterSpacing: '-1px' }}>Reformer</h1>
          <div className="w-10 h-px bg-primary mx-auto mt-3 mb-2" />
          <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
            {fr ? "Pilates · Bien-etre" : "Pilates · Wellness"}
          </p>
        </div>

        {mode === "reset" ? (
          <div className="space-y-4">
            <button type="button" onClick={() => { setMode("signin"); clear(); }}
              className="font-body text-sm text-muted-foreground">
              &larr; {fr ? "Retour" : "Back"}
            </button>
            <h2 className="font-display text-2xl text-foreground">
              {fr ? "Reinitialiser le mot de passe" : "Reset password"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="email" required className={inputCls} placeholder="Email"
                value={email} onChange={e => setEmail(e.target.value)} />
              {errorMsg && <p className="font-body text-xs text-red-500">{errorMsg}</p>}
              {infoMsg  && <p className="font-body text-xs text-green-600">{infoMsg}</p>}
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-foreground text-background font-body font-semibold py-3 disabled:opacity-40">
                {loading ? "..." : fr ? "Envoyer le lien" : "Send link"}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              {([["signin", fr ? "Connexion" : "Sign in"], ["signup", fr ? "Inscription" : "Sign up"]] as [Mode, string][]).map(([m, label]) => (
                <button key={m} type="button" onClick={() => { setMode(m); clear(); setCgvAccepted(false); }}
                  className={`flex-1 pb-3 font-body text-sm ${mode === m ? "border-b-2 border-primary text-foreground -mb-px font-medium" : "text-muted-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} placeholder={fr ? "Prenom" : "First name"}
                    value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
                  <input className={inputCls} placeholder={fr ? "Nom" : "Last name"}
                    value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
                </div>
              )}

              <input type="email" required className={inputCls} placeholder="Email"
                value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              <input type="password" required className={inputCls}
                placeholder={fr ? "Mot de passe" : "Password"}
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"} />

              {/* ── CGV CHECKBOX (seulement a l inscription) ── */}
              {mode === "signup" && (
                <div
                  onClick={() => setCgvAccepted(v => !v)}
                  className={`flex items-start gap-3 rounded-xl p-3 border cursor-pointer transition-colors ${
                    cgvAccepted ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  {/* Checkbox custom */}
                  <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    cgvAccepted ? "border-primary bg-primary" : "border-muted-foreground bg-background"
                  }`}>
                    {cgvAccepted && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  {/* Label */}
                  <p className="font-body text-sm text-foreground leading-relaxed select-none">
                    {fr ? "J'accepte les" : "I accept the"}{" "}
                    <a
                      href={CGV_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-primary underline underline-offset-2 font-medium"
                    >
                      {fr ? "conditions generales de vente" : "terms and conditions"}
                    </a>
                    {fr ? " de Connect Reformer." : " of Connect Reformer."}
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <p className="font-body text-xs text-red-600">{errorMsg}</p>
                </div>
              )}
              {infoMsg && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <p className="font-body text-xs text-green-700">{infoMsg}</p>
                </div>
              )}

              {mode === "signin" && (
                <button type="button" onClick={() => { setMode("reset"); clear(); }}
                  className="font-body text-xs text-muted-foreground text-right w-full pt-1">
                  {fr ? "Mot de passe oublie ?" : "Forgot password?"}
                </button>
              )}

              <button
                type="submit"
                disabled={loading || (mode === "signup" && !cgvAccepted)}
                className="w-full rounded-xl bg-foreground text-background font-body font-semibold py-3 disabled:opacity-40 transition-opacity"
              >
                {loading ? "..."
                  : mode === "signin" ? (fr ? "Se connecter" : "Sign in")
                  : (fr ? "Creer mon compte" : "Create account")}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="font-body text-xs text-muted-foreground">{fr ? "ou" : "or"}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              <button type="button" onClick={() => signInWithApple()}
                className="w-full rounded-xl border border-border bg-card text-foreground font-body text-sm py-3 flex items-center justify-center gap-2">
                <span>🍎</span>{fr ? "Continuer avec Apple" : "Continue with Apple"}
              </button>
              <button type="button" onClick={() => signInWithGoogle()}
                className="w-full rounded-xl border border-border bg-card text-foreground font-body text-sm py-3 flex items-center justify-center gap-2">
                <span>🔵</span>{fr ? "Continuer avec Google" : "Continue with Google"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
