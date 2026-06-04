import { App } from "@capacitor/app";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";


export default function Auth() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const launched = useRef(false);

  useEffect(() => {
    // Bloquer tout second appel
    if (launched.current) return;
    launched.current = true;

    // Vérifier si on est sur un vrai iPhone
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (!isNative) {
      // Sur web/simulateur → formulaire directement
      setMode("login");
      return;
    }

    (async () => {
      try {

        if (!info.isAvailable) {
          setMode("login");
          return;
        }


        try {
          navigate("/home", { replace: true });
        } catch {
          setMode("login");
        }

      } catch {
        // Erreur inattendue → formulaire
        setMode("login");
      }
    })();
  }, []); // ← deps vide = une seule exécution au montage, jamais relancé

  // Écouter les deep links (Magic Link depuis email)
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (url.includes('access_token') || url.includes('token_hash')) {
        try {
          // Extraire les tokens du deep link
          const params = new URLSearchParams(url.split('?')[1] || url.split('#')[1] || '');
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken) {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            if (!error) {
              navigate("/home", { replace: true });
            }
          }
        } catch (e) {
          console.error("Deep link error:", e);
        }
      }
    };

    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      App.addListener('appUrlOpen', handleDeepLink);
      // Vérifier si l'app a été ouverte avec un deep link
      App.getLaunchUrl().then(({ url }) => { if (url) handleDeepLink({ url }); });
    }

    return () => { if (isNative) App.removeAllListeners(); };
  }, []);


    setError("");
    try {
      navigate("/home", { replace: true });
    } catch {
      setMode("login");
    }
  };

  // ── Connexion email/mot de passe ───────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Remplissez tous les champs.");
      return;
    }
    setError("");
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    if (error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      navigate("/home", { replace: true });
    }
    setLoading(false);
  };

  // ── Mot de passe oublié ────────────────────────────────────
  const handleReset = async () => {
    if (!email.trim()) {
      setError("Entrez votre email.");
      return;
    }
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) setError(error.message);
    else setSuccess("Lien envoyé ! Vérifiez votre email.");
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid rgba(28,27,25,0.12)",
    borderRadius: 12,
    backgroundColor: "white",
    fontSize: 15,
    color: "#1C1B19",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
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


        {/* ── Formulaire login / reset ── */}
        {(mode === "login" || mode === "reset") && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ width: "100%", maxWidth: 380 }}>

            <div style={{ backgroundColor: "white", borderRadius: 24, padding: "28px 24px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1C1B19", margin: "0 0 4px" }}>
                {mode === "login" ? "Connexion" : "Mot de passe oublié"}
              </h2>
              <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 20px" }}>
                {mode === "login" ? "Accédez à votre espace Connect Reformer" : "Nous vous enverrons un lien de réinitialisation"}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Email */}
                <div style={{ display: "flex", alignItems: "center", ...inputStyle, padding: 0 }}>
                  <Mail size={16} color="#B8B0A6" style={{ marginLeft: 16, flexShrink: 0 }} />
                  <input type="email" placeholder="email@exemple.fr" value={email} autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleReset())}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#1C1B19", padding: "14px 16px 14px 10px", backgroundColor: "transparent", fontFamily: "inherit" }} />
                </div>

                {/* Mot de passe */}
                {mode === "login" && (
                  <div style={{ display: "flex", alignItems: "center", ...inputStyle, padding: 0 }}>
                    <input type={showPass ? "text" : "password"} placeholder="Mot de passe" value={password} autoComplete="current-password"
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: "#1C1B19", padding: "14px 16px", backgroundColor: "transparent", fontFamily: "inherit" }} />
                    <button onClick={() => setShowPass(p => !p)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0 16px 0 0", color: "#B8B0A6" }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}

                {/* Messages */}
                {error && <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>}
                {success && <p style={{ fontSize: 13, color: "#22C55E", margin: 0 }}>{success}</p>}

                {/* Bouton principal */}
                <button onClick={mode === "login" ? handleLogin : handleReset} disabled={loading}
                  style={{ width: "100%", padding: "15px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
                  {loading
                    ? <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#1C1B19", animation: "spin 0.8s linear infinite" }} />
                    : <>{mode === "login" ? "Se connecter" : "Envoyer le lien"}<ArrowRight size={16} /></>
                  }
                </button>

                {/* Liens secondaires */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginTop: 4 }}>
                  {mode === "login" && (
                    <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                      style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      Mot de passe oublié ?
                    </button>
                  )}
                  {mode === "reset" && (
                    <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                      style={{ background: "none", border: "none", color: "#B8973E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      ← Retour à la connexion
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Encart commande */}
            <div style={{ backgroundColor: "white", borderRadius: 20, padding: "18px 20px", boxShadow: "0 2px 16px rgba(0,0,0,0.04)", border: "1px solid rgba(184,151,62,0.15)", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 10px", lineHeight: 1.5 }}>
                Pas encore de machine Connect Reformer ?
              </p>
              <button onClick={() => window.open("https://connectreformer.com", "_system")}
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
