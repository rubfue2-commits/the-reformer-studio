import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";

type Mode = "signin" | "signup" | "reset";

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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const clear = () => { setErrorMsg(null); setInfoMsg(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clear();
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

    // signup
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
  const btnPrimary = "w-full rounded-xl bg-foreground text-background font-body font-semibold py-3 disabled:opacity-40 cursor-pointer";
  const btnSecondary = "w-full rounded-xl border border-border bg-card text-foreground font-body text-sm py-3 flex items-center justify-center gap-2 cursor-pointer";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-foreground">The Reformer</h1>
          <p className="font-display text-3xl text-primary">Studio</p>
          <p className="font-body text-xs text-muted-foreground mt-2 tracking-widest uppercase">
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
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? "..." : fr ? "Envoyer le lien" : "Send link"}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              {([["signin", fr ? "Connexion" : "Sign in"], ["signup", fr ? "Inscription" : "Sign up"]] as [Mode, string][]).map(([m, label]) => (
                <button key={m} type="button" onClick={() => { setMode(m); clear(); }}
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

              {errorMsg && <p className="font-body text-xs text-red-500">{errorMsg}</p>}
              {infoMsg  && <p className="font-body text-xs text-green-600">{infoMsg}</p>}

              {mode === "signin" && (
                <button type="button" onClick={() => { setMode("reset"); clear(); }}
                  className="font-body text-xs text-muted-foreground text-right w-full">
                  {fr ? "Mot de passe oublie ?" : "Forgot password?"}
                </button>
              )}

              <button type="submit" disabled={loading} className={btnPrimary}>
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
              <button type="button" onClick={() => signInWithApple()} className={btnSecondary}>
                <span>🍎</span>{fr ? "Continuer avec Apple" : "Continue with Apple"}
              </button>
              <button type="button" onClick={() => signInWithGoogle()} className={btnSecondary}>
                <span>🔵</span>{fr ? "Continuer avec Google" : "Continue with Google"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
