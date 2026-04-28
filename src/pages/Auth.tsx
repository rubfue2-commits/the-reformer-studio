import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type Mode = "faceId" | "login" | "reset";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  const [mode, setMode] = useState<Mode>("faceId");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [biometryAvailable, setBiometryAvailable] = useState(false);

  // Vérifier si Face ID est disponible au chargement
  useEffect(() => {
    checkBiometry();
  }, []);

  const checkBiometry = async () => {
    try {
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
      if (!isNative) {
        // Sur web/simulateur — aller direct au formulaire
        setMode("login");
        return;
      }
      const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
      const info = await BiometricAuth.checkBiometry();
      if (info.isAvailable) {
        setBiometryAvailable(true);
        setMode("faceId");
        // Lancer Face ID automatiquement
        setTimeout(() => triggerFaceId(), 300);
      } else {
        setMode("login");
      }
    } catch {
      setMode("login");
    }
  };

  const triggerFaceId = async () => {
    setBioLoading(true);
    setError("");
    try {
      const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth");
      await BiometricAuth.authenticate({
        reason: "Accedez a votre espace Connect Reformer",
        cancelTitle: "Utiliser email et mot de passe",
        allowDeviceCredential: false,
        iosFallbackTitle: "Utiliser email et mot de passe",
      });
      // Face ID validé — naviguer vers l'app
      navigate("/home");
    } catch {
      // Face ID annulé ou echec — afficher le formulaire
      setMode("login");
    }
    setBioLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Remplissez tous les champs."); return; }
    setError(""); setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError("Email ou mot de passe incorrect.");
    else navigate("/home");
    setLoading(false);
  };

  const handleReset = async () => {
    if (!email) { setError("Entrez votre email."); return; }
    setError(""); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) setError(error.message);
    else setSuccess("Lien envoye ! Verifiez votre email.");
    setLoading(false);
  };

  const openSite = () => window.open("https://connectreformer.com", "_system");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    border: "1px solid rgba(28,27,25,0.12)", borderRadius: 12,
    backgroundColor: "white", fontSize: 15, color: "#1C1B19",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#F5F3EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 24px 48px" }}>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 36 }}>
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
        <p style={{ fontSize: 11, color: "#8B8578", letterSpacing: "0.15em", textTransform: "uppercase" }}>Pilates Reformer</p>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── Ecran Face ID ── */}
        {mode === "faceId" && (
          <motion.div key="faceId" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
            <div style={{ backgroundColor: "white", borderRadius: 24, padding: "36px 24px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              {/* Icone Face ID */}
              <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#1C1B19", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                {bioLoading ? (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.2)", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect x="2" y="2" width="9" height="9" rx="2.5" stroke="#B8973E" strokeWidth="2"/>
                    <rect x="29" y="2" width="9" height="9" rx="2.5" stroke="#B8973E" strokeWidth="2"/>
                    <rect x="2" y="29" width="9" height="9" rx="2.5" stroke="#B8973E" strokeWidth="2"/>
                    <rect x="29" y="29" width="9" height="9" rx="2.5" stroke="#B8973E" strokeWidth="2"/>
                    <circle cx="14" cy="16" r="2" fill="white"/>
                    <circle cx="26" cy="16" r="2" fill="white"/>
                    <path d="M14 26 C14 26 17 29 20 29 C23 29 26 26 26 26" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M20 16 L20 22" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </div>

              <p style={{ fontSize: 18, fontWeight: 600, color: "#1C1B19", margin: "0 0 6px" }}>
                {bioLoading ? "Verification..." : "Connexion avec Face ID"}
              </p>
              <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 24px", lineHeight: 1.5 }}>
                {bioLoading ? "Regardez votre iPhone" : "Utilisez Face ID pour acceder a votre espace"}
              </p>

              <button onClick={triggerFaceId} disabled={bioLoading}
                style={{ width: "100%", padding: "15px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: bioLoading ? 0.7 : 1 }}>
                {bioLoading ? "..." : "Utiliser Face ID"}
              </button>
            </div>

            {/* Lien vers formulaire */}
            <button onClick={() => setMode("login")}
              style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: "8px" }}>
              Utiliser mon email et mot de passe
            </button>
          </motion.div>
        )}

        {/* ── Formulaire email/mot de passe ── */}
        {(mode === "login" || mode === "reset") && (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ width: "100%", maxWidth: 380 }}>

            <div style={{ backgroundColor: "white", borderRadius: 24, padding: "28px 24px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1C1B19", margin: "0 0 4px" }}>
                {mode === "login" ? "Connexion" : "Mot de passe oublie"}
              </h2>
              <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 20px" }}>
                {mode === "login" ? "Accedez a votre espace Connect Reformer" : "Nous vous enverrons un lien de reinitialisation"}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Email */}
                <div style={{ display: "flex", alignItems: "center", ...inputStyle, padding: 0 }}>
                  <Mail size={16} color="#B8B0A6" style={{ marginLeft: 16, flexShrink: 0 }} />
                  <input type="email" placeholder="email@exemple.fr" value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#1C1B19", padding: "14px 16px 14px 10px", backgroundColor: "transparent", fontFamily: "inherit" }} />
                </div>

                {/* Mot de passe */}
                {mode === "login" && (
                  <div style={{ display: "flex", alignItems: "center", ...inputStyle, padding: 0 }}>
                    <input type={showPass ? "text" : "password"} placeholder="Mot de passe" value={password}
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

                <button onClick={mode === "login" ? handleLogin : handleReset} disabled={loading}
                  style={{ width: "100%", padding: "15px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
                  {loading
                    ? <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#1C1B19", animation: "spin 0.8s linear infinite" }} />
                    : <>{mode === "login" ? "Se connecter" : "Envoyer le lien"} <ArrowRight size={16} /></>
                  }
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                  {mode === "login" && (
                    <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                      style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      Mot de passe oublie ?
                    </button>
                  )}
                  {mode === "reset" && (
                    <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                      style={{ background: "none", border: "none", color: "#B8973E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Retour a la connexion
                    </button>
                  )}
                  {/* Retour Face ID si dispo */}
                  {biometryAvailable && mode === "login" && (
                    <button onClick={() => { setMode("faceId"); setTimeout(triggerFaceId, 200); }}
                      style={{ background: "none", border: "none", color: "#B8973E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Utiliser Face ID
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Encart commander */}
            <div style={{ backgroundColor: "white", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", border: "1px solid rgba(184,151,62,0.15)", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 10px", lineHeight: 1.5 }}>
                Pas encore de machine Connect Reformer ?
              </p>
              <button onClick={openSite}
                style={{ width: "100%", padding: "13px 16px", backgroundColor: "#1C1B19", color: "#FDFAF7", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ position: "relative", width: 20, height: 20, flexShrink: 0 }}>
                  <div style={{ position: "absolute", left: 2, top: 0, width: 7, height: 18, borderRadius: 3, backgroundColor: "#FFFFFF", transform: "rotate(15deg)" }} />
                  <div style={{ position: "absolute", left: 11, top: 2, width: 5, height: 15, borderRadius: 2, backgroundColor: "#B8973E", transform: "rotate(15deg)" }} />
                </div>
                Commandez votre machine
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
