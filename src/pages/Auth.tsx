import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AppIcon, { type IconName } from "@/components/AppIcon";

type Mode = "login" | "signup" | "reset";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

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
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, last_name: lastName } },
        });
        if (err) throw err;
        navigate("/home", { replace: true });
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://connectreformer.com/reset-password',
        });
        if (err) throw err;
        setSuccess("Email envoyé ! Vérifiez votre boîte mail (et vos spams) pour réinitialiser votre mot de passe.");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Invalid login")) setError("Email ou mot de passe incorrect.");
      else if (msg.includes("Email not confirmed")) setError("Veuillez confirmer votre email avant de vous connecter.");
      else setError(msg || "Une erreur est survenue, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    border: "1.5px solid #E8E4DC", fontSize: 15, fontFamily: "inherit",
    background: "#FAFAF8", color: "#1C1B19", outline: "none",
    marginBottom: 12, boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
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
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: 4, color: "#B8922A", textTransform: "uppercase", marginBottom: 6 }}>
              Connect Reformer
            </div>
            <div style={{ fontSize: 22, color: "#B8922A" }}>/ /</div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: 24, padding: "36px 28px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1C1B19", marginBottom: 6, textAlign: "center" }}>
              {mode === "login" ? "Connexion" : mode === "signup" ? "Créer un compte" : "Mot de passe oublié"}
            </h2>
            <p style={{ fontSize: 13, color: "#8B8578", marginBottom: 24, textAlign: "center" }}>
              {mode === "login" ? "Accédez à votre espace" : mode === "signup" ? "Rejoignez Connect Reformer" : "Entrez votre email pour recevoir un lien de réinitialisation"}
            </p>

            {success ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ marginBottom: 16, display:"flex", justifyContent:"center" }}><AppIcon name="mail" size={40} /></div>
                <p style={{ color: "#2E7D32", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{success}</p>
                <button
                  onClick={() => { setMode("login"); setSuccess(""); setEmail(""); }}
                  style={{ background: "none", border: "none", color: "#B8922A", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Retour à la connexion →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <>
                    <input style={inp} type="text" placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                    <input style={inp} type="text" placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </>
                )}
                <input style={inp} type="email" placeholder="Adresse email" value={email} onChange={e => setEmail(e.target.value)} required />
                {mode !== "reset" && (
                  <input style={inp} type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
                )}
                {error && <div style={{ color: "#E53935", fontSize: 13, marginBottom: 10, textAlign: "center", lineHeight: 1.4 }}>{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: "15px", backgroundColor: "#B8922A", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1, marginTop: 4 }}
                >
                  {loading ? "..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
                </button>
              </form>
            )}

            {!success && (
              <div style={{ marginTop: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
                {mode === "login" && (
                  <>
                    <button onClick={() => { setMode("reset"); setError(""); }} style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      Mot de passe oublié ?
                    </button>
                    <button onClick={() => { setMode("signup"); setError(""); }} style={{ background: "none", border: "none", color: "#B8922A", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Créer un compte
                    </button>
                  </>
                )}
                {(mode === "signup" || mode === "reset") && (
                  <button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    Retour à la connexion
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}