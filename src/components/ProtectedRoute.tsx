import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBiometrics } from "@/hooks/useBiometrics";
import { useEffect, useState } from "react";

type LockState = "checking" | "locked" | "unlocked";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { available, checking, authenticate } = useBiometrics();
  const location = useLocation();

  // État du verrou biométrique
  const [lockState, setLockState] = useState<LockState>("checking");
  const [bioDone, setBioDone] = useState(false);

  // Lancer Face ID dès que l'utilisateur est connecté et que biométrie est dispo
  useEffect(() => {
    if (loading || checking) return;
    if (!user) return;
    if (bioDone) return;

    if (available) {
      setLockState("locked");
      tryBiometric();
    } else {
      // Pas de Face ID disponible → accès direct
      setLockState("unlocked");
      setBioDone(true);
    }
  }, [loading, checking, user, available]);

  const tryBiometric = async () => {
    const result = await authenticate();
    if (result.authenticated) {
      setLockState("unlocked");
      setBioDone(true);
    } else {
      // Echec ou annulation → rester verrouillé mais afficher option manuelle
      setLockState("locked");
    }
  };

  // ── Phase de vérification session ────────────────────────
  if (loading || checking) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        backgroundColor: "#F5F3EE",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 28, fontWeight: 300, color: "#1C1B19", lineHeight: 1 }}>Connect</p>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 28, fontWeight: 300, color: "#B8973E", lineHeight: 1 }}>Reformer</p>
        </div>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Pas connecté → login ─────────────────────────────────
  if (!user) return <Navigate to="/auth" replace />;

  // ── Verrouillé par Face ID ───────────────────────────────
  if (lockState === "locked") {
    return (
      <div style={{
        position: "fixed", inset: 0,
        backgroundColor: "#F5F3EE",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 32px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ position: "relative", width: 36, height: 36 }}>
              <div style={{ position: "absolute", left: 4, top: 2, width: 10, height: 28, borderRadius: 5, backgroundColor: "#1C1B19", transform: "rotate(15deg)" }} />
              <div style={{ position: "absolute", left: 19, top: 4, width: 7, height: 23, borderRadius: 3.5, backgroundColor: "#B8973E", transform: "rotate(15deg)" }} />
            </div>
            <div>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, fontWeight: 300, color: "#1C1B19", margin: 0, lineHeight: 1 }}>Connect</p>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, fontWeight: 300, color: "#B8973E", margin: 0, lineHeight: 1 }}>Reformer</p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "#8B8578", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>Pilates Reformer</p>
        </div>

        {/* Icône Face ID */}
        <div style={{
          width: 80, height: 80,
          borderRadius: "50%",
          backgroundColor: "#1C1B19",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24,
          boxShadow: "0 8px 32px rgba(28,27,25,0.2)",
        }}>
          {/* Icône Face ID SVG */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="3" stroke="#B8973E" strokeWidth="2"/>
            <rect x="28" y="2" width="10" height="10" rx="3" stroke="#B8973E" strokeWidth="2"/>
            <rect x="2" y="28" width="10" height="10" rx="3" stroke="#B8973E" strokeWidth="2"/>
            <rect x="28" y="28" width="10" height="10" rx="3" stroke="#B8973E" strokeWidth="2"/>
            <circle cx="14" cy="15" r="2" fill="white"/>
            <circle cx="26" cy="15" r="2" fill="white"/>
            <path d="M14 25 C14 25 17 28 20 28 C23 28 26 25 26 25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 15 L20 21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <p style={{ fontSize: 17, fontWeight: 600, color: "#1C1B19", margin: "0 0 8px", textAlign: "center" }}>
          Déverrouillez avec Face ID
        </p>
        <p style={{ fontSize: 13, color: "#8B8578", margin: "0 0 32px", textAlign: "center", lineHeight: 1.5 }}>
          Regardez votre iPhone pour accéder à votre espace
        </p>

        {/* Bouton réessayer */}
        <button onClick={tryBiometric} style={{
          width: "100%", maxWidth: 300,
          padding: "15px",
          backgroundColor: "#B8973E",
          color: "#1C1B19",
          border: "none", borderRadius: 14,
          fontSize: 15, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
          marginBottom: 12,
        }}>
          Utiliser Face ID
        </button>

        {/* Accès par mot de passe */}
        <button onClick={() => { setLockState("unlocked"); setBioDone(true); }} style={{
          background: "none", border: "none",
          color: "#8B8578", fontSize: 13,
          cursor: "pointer", fontFamily: "inherit",
          padding: "8px",
        }}>
          Utiliser le mot de passe à la place
        </button>
      </div>
    );
  }

  // ── Déverrouillé ─────────────────────────────────────────
  return <>{children}</>;
}
