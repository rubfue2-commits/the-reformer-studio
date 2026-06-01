import { motion } from "framer-motion";
import { Clock, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function SubscriptionPending() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  const checkSubscription = async () => {
    setChecking(true);
    await refreshProfile();
    setTimeout(() => setChecking(false), 1500);
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#F5F3EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ position: "relative", width: 32, height: 32 }}>
            <div style={{ position: "absolute", left: 4, top: 2, width: 9, height: 26, borderRadius: 5, backgroundColor: "#1C1B19", transform: "rotate(15deg)" }} />
            <div style={{ position: "absolute", left: 17, top: 4, width: 6, height: 22, borderRadius: 3, backgroundColor: "#B8973E", transform: "rotate(15deg)" }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 16, fontWeight: 300, color: "#1C1B19", margin: 0 }}>Connect</p>
            <p style={{ fontSize: 16, fontWeight: 300, color: "#B8973E", margin: 0 }}>Reformer</p>
          </div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: 24, padding: "36px 24px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)", marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "#1C1B1910", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Clock size={32} color="#1C1B19" />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1C1B19", margin: "0 0 8px" }}>
            {profile?.first_name ? `Bonjour ${profile.first_name} !` : "Presque prêt !"}
          </h2>
          <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.6, margin: "0 0 24px" }}>
            Ton compte est créé. Pour accéder à l'app, finalise ton inscription sur notre site en complétant le paiement et la caution Swikly.
          </p>

          {/* Étapes */}
          {[
            { step: "1", label: "Créer ton compte", done: true },
            { step: "2", label: "Paiement de l'abonnement", done: false },
            { step: "3", label: "Caution Swikly (500€)", done: false },
            { step: "4", label: "Accès à l'application", done: false },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(28,27,25,0.06)" : "none", textAlign: "left" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: s.done ? "#10B981" : "#E5E0D8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.done ? <span style={{ color: "white", fontSize: 12 }}>✓</span> : <span style={{ color: "#8B8578", fontSize: 11, fontWeight: 700 }}>{s.step}</span>}
              </div>
              <p style={{ fontSize: 13, color: s.done ? "#10B981" : "#1C1B19", fontWeight: s.done ? 600 : 400, margin: 0 }}>{s.label}</p>
            </div>
          ))}

          <button onClick={() => window.open("https://connectreformer.com/inscription", "_system")}
            style={{ width: "100%", marginTop: 20, padding: "14px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            Finaliser mon inscription
            <ExternalLink size={15} />
          </button>

          <button onClick={checkSubscription} disabled={checking}
            style={{ width: "100%", padding: "14px", backgroundColor: "#1C1B19", color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: checking ? 0.7 : 1 }}>
            <RefreshCw size={15} style={{ animation: checking ? "spin 1s linear infinite" : "none" }} />
            {checking ? "Vérification..." : "J'ai finalisé, vérifier l'accès"}
          </button>
        </div>

        <button onClick={signOut} style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Se déconnecter
        </button>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
