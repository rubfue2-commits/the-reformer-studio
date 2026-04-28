import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/lib/supabase";

export default function Auth() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"apple" | "google" | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Connexion email ──────────────────────────────
  const handleSubmit = async () => {
    setError(""); setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(t("Email ou mot de passe incorrect", "Wrong email or password"));
      else navigate("/home");
    } else if (mode === "register") {
      const { error } = await signUp({ email, password, firstName, lastName, language: "fr", referralCode: referralCode || undefined });
      if (error) setError(error.message);
      else setSuccess(t("Vérifiez votre email pour activer votre compte", "Check your email to activate your account"));
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) setError(error.message);
      else setSuccess(t("Lien de réinitialisation envoyé !", "Reset link sent!"));
    }
    setLoading(false);
  };

  // ── Connexion Apple ──────────────────────────────
  const handleApple = async () => {
    setSocialLoading("apple");
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: "connectreformer://auth/callback",
        scopes: "name email",
      },
    });
    if (error) setError(t("Erreur Apple Sign In", "Apple Sign In error"));
    setSocialLoading(null);
  };

  // ── Connexion Google ─────────────────────────────
  const handleGoogle = async () => {
    setSocialLoading("google");
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "connectreformer://auth/callback",
        scopes: "openid email profile",
      },
    });
    if (error) setError(t("Erreur Google Sign In", "Google Sign In error"));
    setSocialLoading(null);
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid rgba(28,27,25,0.12)",
    borderRadius: 12,
    backgroundColor: "white",
    fontSize: 15,
    color: "#1C1B19",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100dvh",
      backgroundColor: "#F5F3EE",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 24px 48px",
    }}>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          {/* Logo barres */}
          <div style={{ position: "relative", width: 32, height: 32 }}>
            <div style={{
              position: "absolute", left: 4, top: 2, width: 9, height: 26,
              borderRadius: 5, backgroundColor: "#1C1B19",
              transform: "rotate(15deg)",
            }} />
            <div style={{
              position: "absolute", left: 17, top: 4, width: 6, height: 22,
              borderRadius: 3, backgroundColor: "#B8973E",
              transform: "rotate(15deg)",
            }} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 300, color: "#1C1B19", margin: 0, lineHeight: 1 }}>Connect</p>
            <p style={{ fontSize: 18, fontWeight: 300, color: "#B8973E", margin: 0, lineHeight: 1 }}>Reformer</p>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#8B8578", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {t("Pilates Reformer", "Pilates Reformer")}
        </p>
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          width: "100%", maxWidth: 380,
          backgroundColor: "white",
          borderRadius: 24,
          padding: "28px 24px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
        }}>

        {/* Titre */}
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1C1B19", margin: "0 0 4px" }}>
          {mode === "login" ? t("Connexion", "Sign in") :
           mode === "register" ? t("Créer un compte", "Create account") :
           t("Mot de passe oublié", "Forgot password")}
        </h2>
        <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 24px" }}>
          {mode === "login"
            ? t("Bienvenue ! Connectez-vous pour continuer", "Welcome back!")
            : mode === "register"
            ? t("Rejoignez la communauté Connect Reformer", "Join Connect Reformer")
            : t("Nous vous enverrons un lien de réinitialisation", "We'll send you a reset link")}
        </p>

        {/* ── Boutons sociaux (login + register) ── */}
        {mode !== "reset" && (
          <>
            {/* Apple */}
            <button onClick={handleApple} disabled={!!socialLoading}
              style={{
                width: "100%", padding: "13px 16px", marginBottom: 10,
                backgroundColor: "#1C1B19", color: "white",
                border: "none", borderRadius: 12, fontSize: 15, fontWeight: 500,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                opacity: socialLoading === "apple" ? 0.7 : 1,
                fontFamily: "inherit",
              }}>
              {socialLoading === "apple" ? (
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.44c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.54 3.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              {t("Continuer avec Apple", "Continue with Apple")}
            </button>

            {/* Google */}
            <button onClick={handleGoogle} disabled={!!socialLoading}
              style={{
                width: "100%", padding: "13px 16px", marginBottom: 20,
                backgroundColor: "white", color: "#1C1B19",
                border: "1px solid rgba(28,27,25,0.12)", borderRadius: 12, fontSize: 15, fontWeight: 500,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                opacity: socialLoading === "google" ? 0.7 : 1,
                fontFamily: "inherit",
              }}>
              {socialLoading === "google" ? (
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.1)", borderTopColor: "#4285F4", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {t("Continuer avec Google", "Continue with Google")}
            </button>

            {/* Séparateur */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(28,27,25,0.08)" }} />
              <span style={{ fontSize: 12, color: "#B8B0A6" }}>{t("ou", "or")}</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(28,27,25,0.08)" }} />
            </div>
          </>
        )}

        {/* ── Formulaire email ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {mode === "register" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input placeholder={t("Prénom", "First name")} value={firstName}
                onChange={e => setFirstName(e.target.value)} style={inputStyle} />
              <input placeholder={t("Nom", "Last name")} value={lastName}
                onChange={e => setLastName(e.target.value)} style={inputStyle} />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, ...inputStyle, padding: 0 }}>
            <Mail size={16} color="#B8B0A6" style={{ marginLeft: 16, flexShrink: 0 }} />
            <input type="email" placeholder="email@exemple.fr" value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#1C1B19", padding: "14px 16px 14px 0", backgroundColor: "transparent", fontFamily: "inherit" }} />
          </div>

          {mode !== "reset" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, ...inputStyle, padding: 0 }}>
              <input type={showPass ? "text" : "password"} placeholder={t("Mot de passe", "Password")} value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#1C1B19", padding: "14px 16px", backgroundColor: "transparent", fontFamily: "inherit" }} />
              <button onClick={() => setShowPass(!showPass)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0 16px 0 0", color: "#B8B0A6" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {/* Champ code parrainage */}
          {mode === "register" && (
            <div style={{ position: "relative" }}>
              <input
                placeholder={t("Code parrainage (optionnel)", "Referral code (optional)")}
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                style={{ ...inputStyle, paddingLeft: 42, letterSpacing: referralCode ? "0.08em" : "normal", textTransform: "uppercase" }}
              />
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#B8973E" }}>✦</span>
              {referralCode.length > 0 && (
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#22C55E", fontWeight: 600 }}>
                  {t("Code appliqué", "Code applied")} ✓
                </span>
              )}
            </div>
          )}

          {/* Case à cocher CGV — obligatoire à l'inscription */}
          {mode === "register" && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 14px",
              border: cgvAccepted ? "1px solid rgba(184,151,62,0.4)" : "1px solid rgba(28,27,25,0.1)",
              borderRadius: 12,
              backgroundColor: cgvAccepted ? "rgba(184,151,62,0.04)" : "white",
              cursor: "pointer",
              transition: "all 0.2s",
            }} onClick={() => setCgvAccepted(!cgvAccepted)}>
              {/* Checkbox custom */}
              <div style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                border: cgvAccepted ? "none" : "1.5px solid rgba(28,27,25,0.2)",
                backgroundColor: cgvAccepted ? "#B8973E" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                {cgvAccepted && (
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <p style={{ fontSize: 12, color: "#6B6560", lineHeight: 1.55, margin: 0, userSelect: "none" }}>
                {t("J'ai lu et j'accepte les", "I have read and accept the")}{" "}
                <span
                  onClick={e => { e.stopPropagation(); /* navigate vers CGV */ }}
                  style={{ color: "#B8973E", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>
                  {t("Conditions Générales de Vente", "Terms and Conditions")}
                </span>
                {" "}{t("de Connect Reformer, incluant l'engagement de 12 mois et la caution de 500€.", "of Connect Reformer, including the 12-month commitment and 500€ deposit.")}
              </p>
            </div>
          )}

          {error && <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>}
          {success && <p style={{ fontSize: 13, color: "#22C55E", margin: 0 }}>{success}</p>}

          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", padding: "15px",
              backgroundColor: "#B8973E", color: "#1C1B19",
              border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: loading ? 0.7 : 1, fontFamily: "inherit", marginTop: 4,
            }}>
            {loading ? (
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#1C1B19", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <>
                {mode === "login" ? t("Se connecter", "Sign in") :
                 mode === "register" ? t("Créer mon compte", "Create account") :
                 t("Envoyer le lien", "Send link")}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Links */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("reset"); setError(""); }}
                style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {t("Mot de passe oublié ?", "Forgot password?")}
              </button>
              <button onClick={() => { setMode("register"); setError(""); }}
                style={{ background: "none", border: "none", color: "#B8973E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {t("Pas encore de compte ? S'inscrire", "No account? Sign up")}
              </button>
            </>
          )}
          {mode !== "login" && (
            <button onClick={() => { setMode("login"); setError(""); }}
              style={{ background: "none", border: "none", color: "#B8973E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {t("Déjà un compte ? Se connecter", "Already have an account? Sign in")}
            </button>
          )}
        </div>

        {/* Encart redirection site — visible en mode login et register */}
        {mode !== "reset" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: 20,
              padding: "16px",
              borderRadius: 16,
              border: "1px solid rgba(184,151,62,0.2)",
              backgroundColor: "rgba(184,151,62,0.04)",
              textAlign: "center",
            }}>
            <p style={{ fontSize: 12, color: "#8B8578", margin: "0 0 10px", lineHeight: 1.5 }}>
              {t(
                "Vous n'avez pas encore de machine Connect Reformer ?",
                "Don't have a Connect Reformer yet?"
              )}
            </p>
            <button
              onClick={() => window.open("https://connectreformer.com", "_system")}
              style={{
                width: "100%",
                padding: "13px 16px",
                backgroundColor: "#B8973E",
                color: "#1C1B19",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {t("Commander sur connectreformer.com", "Order on connectreformer.com")}
            </button>
          </motion.div>
        )}

      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #B8B0A6; }
      `}</style>
    </div>
  );
}
