import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

type Mode = "login" | "signup" | "reset";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();
  const { t } = useTranslation();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
        navigate("/home", { replace: true });
      } else if (mode === "signup") {
        await signUp(email, password, firstName, lastName);
        navigate("/home", { replace: true });
      } else if (mode === "reset") {
        await resetPassword(email);
        setSuccess(t("Email de réinitialisation envoyé !", "Reset email sent!"));
      }
    } catch (err: any) {
      setError(err.message || t("Une erreur est survenue", "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid #E8E4DC",
    fontSize: 15,
    fontFamily: "inherit",
    background: "#FAFAF8",
    color: "#1C1B19",
    outline: "none",
    marginBottom: 12,
    boxSizing: "border-box",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px",
    backgroundColor: "#B8922A",
    color: "#1C1B19",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    opacity: loading ? 0.7 : 1,
    marginTop: 4,
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #F2EDE4 0%, #E8E0D4 100%)",
      padding: "24px 20px",
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          style={{ width: "100%", maxWidth: 380 }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 4, color: "#B8922A", textTransform: "uppercase", marginBottom: 6 }}>
              Connect Reformer
            </div>
            <div style={{ fontSize: 22, color: "#B8922A", marginBottom: 4 }}>/ /</div>
          </div>

          {/* Carte */}
          <div style={{
            backgroundColor: "white",
            borderRadius: 24,
            padding: "36px 28px",
            boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1C1B19", marginBottom: 6, textAlign: "center" }}>
              {mode === "login" && t("Connexion", "Sign in")}
              {mode === "signup" && t("Créer un compte", "Create account")}
              {mode === "reset" && t("Réinitialiser", "Reset password")}
            </h2>
            <p style={{ fontSize: 13, color: "#8B8578", marginBottom: 24, textAlign: "center" }}>
              {mode === "login" && t("Accédez à votre espace", "Access your space")}
              {mode === "signup" && t("Rejoignez Connect Reformer", "Join Connect Reformer")}
              {mode === "reset" && t("Entrez votre email", "Enter your email")}
            </p>

            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder={t("Prénom", "First name")}
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder={t("Nom", "Last name")}
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </>
              )}

              <input
                style={inputStyle}
                type="email"
                placeholder={t("Adresse email", "Email address")}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              {mode !== "reset" && (
                <input
                  style={inputStyle}
                  type="password"
                  placeholder={t("Mot de passe", "Password")}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              )}

              {error && (
                <div style={{ color: "#E53935", fontSize: 13, marginBottom: 10, textAlign: "center" }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ color: "#2E7D32", fontSize: 13, marginBottom: 10, textAlign: "center" }}>
                  {success}
                </div>
              )}

              <button type="submit" style={btnStyle} disabled={loading}>
                {loading ? "..." : (
                  mode === "login" ? t("Se connecter", "Sign in") :
                  mode === "signup" ? t("Créer mon compte", "Create account") :
                  t("Envoyer", "Send")
                )}
              </button>
            </form>

            {/* Liens secondaires */}
            <div style={{ marginTop: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
              {mode === "login" && (
                <>
                  <button
                    onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                    style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {t("Mot de passe oublié ?", "Forgot password?")}
                  </button>
                  <button
                    onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
                    style={{ background: "none", border: "none", color: "#B8922A", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {t("Créer un compte", "Create account")}
                  </button>
                </>
              )}
              {(mode === "signup" || mode === "reset") && (
                <button
                  onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                  style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                >
                  {t("Retour à la connexion", "Back to sign in")}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #B8922A !important; }
      `}</style>
    </div>
  );
}