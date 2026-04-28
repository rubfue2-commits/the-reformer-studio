import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "reset";

export default function Auth() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError(t("Remplissez tous les champs.", "Fill in all fields.")); return; }
    setError(""); setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(t("Email ou mot de passe incorrect.", "Wrong email or password."));
    else navigate("/home");
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email) { setError(t("Entrez votre email.", "Enter your email.")); return; }
    setError(""); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSuccess(t("Lien envoyé ! Vérifiez votre email.", "Link sent! Check your email."));
    setLoading(false);
  };

  const openSite = () => window.open("https://connectreformer.com", "_system");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    border: "1px solid rgba(28,27,25,0.12)",
    borderRadius: 12, backgroundColor: "white",
    fontSize: 15, color: "#1C1B19",
    outline: "none", boxSizing: "border-box",
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
          <div style={{ position: "relative", width: 32, height: 32 }}>
            <div style={{ position: "absolute", left: 4, top: 2, width: 9, height: 26, borderRadius: 5, backgroundColor: "#1C1B19", transform: "rotate(15deg)" }} />
            <div style={{ position: "absolute", left: 17, top: 4, width: 6, height: 22, borderRadius: 3, backgroundColor: "#B8973E", transform: "rotate(15deg)" }} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 300, color: "#1C1B19", margin: 0, lineHeight: 1 }}>Connect</p>
            <p style={{ fontSize: 18, fontWeight: 300, color: "#B8973E", margin: 0, lineHeight: 1 }}>Reformer</p>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#8B8578", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Pilates Reformer
        </p>
      </motion.div>

      {/* Card connexion */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ width: "100%", maxWidth: 380, backgroundColor: "white", borderRadius: 24, padding: "28px 24px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>

        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1C1B19", margin: "0 0 4px" }}>
          {mode === "login" ? t("Connexion", "Sign in") : t("Mot de passe oublié", "Forgot password")}
        </h2>
        <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 24px" }}>
          {mode === "login"
            ? t("Accédez à votre espace Connect Reformer", "Access your Connect Reformer space")
            : t("Nous vous enverrons un lien de réinitialisation", "We'll send you a reset link")}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Email */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, ...inputStyle, padding: 0 }}>
            <Mail size={16} color="#B8B0A6" style={{ marginLeft: 16, flexShrink: 0 }} />
            <input type="email" placeholder="email@exemple.fr" value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#1C1B19", padding: "14px 16px 14px 0", backgroundColor: "transparent", fontFamily: "inherit" }} />
          </div>

          {/* Mot de passe — uniquement en mode login */}
          {mode === "login" && (
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

          {error && <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>}
          {success && <p style={{ fontSize: 13, color: "#22C55E", margin: 0 }}>{success}</p>}

          {/* Bouton principal */}
          <button
            onClick={mode === "login" ? handleLogin : handleReset}
            disabled={loading}
            style={{ width: "100%", padding: "15px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
            {loading
              ? <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#1C1B19", animation: "spin 0.8s linear infinite" }} />
              : <>{mode === "login" ? t("Se connecter", "Sign in") : t("Envoyer le lien", "Send link")} <ArrowRight size={16} /></>
            }
          </button>

          {/* Liens */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginTop: 4 }}>
            {mode === "login" && (
              <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {t("Mot de passe oublié ?", "Forgot password?")}
              </button>
            )}
            {mode === "reset" && (
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                style={{ background: "none", border: "none", color: "#B8973E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {t("Retour à la connexion", "Back to sign in")}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Encart — Pas encore abonné */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ width: "100%", maxWidth: 380, marginTop: 16, padding: "20px", backgroundColor: "white", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.04)", border: "1px solid rgba(184,151,62,0.15)", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 12px", lineHeight: 1.55 }}>
          {t("Pas encore de machine Connect Reformer ?", "Don't have a Connect Reformer yet?")}
        </p>
        <button onClick={openSite}
          style={{ width: "100%", padding: "14px 16px", backgroundColor: "#1C1B19", color: "#FDFAF7", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          {t("Commander sur connectreformer.com", "Order on connectreformer.com")}
        </button>
        <p style={{ fontSize: 11, color: "#C4BDB5", margin: "10px 0 0" }}>
          {t("Choisissez votre formule, recevez votre machine,", "Choose your plan, receive your machine,")}
          <br />{t("puis connectez-vous ici.", "then sign in here.")}
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
