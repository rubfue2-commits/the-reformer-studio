import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function EmailPending() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    await supabase.auth.resend({ type: "signup", email: user?.email || "" });
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#F5F3EE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
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
          <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "#B8973E20", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Mail size={32} color="#B8973E" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1C1B19", margin: "0 0 8px" }}>{t("Confirme ton email", "Confirm your email")}</h2>
          <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.6, margin: "0 0 8px" }}>{t("Un email de confirmation a été envoyé à", "A confirmation email was sent to")}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1B19", margin: "0 0 24px" }}>{user?.email}</p>
          <p style={{ fontSize: 13, color: "#8B8578", lineHeight: 1.6, margin: "0 0 24px" }}>
            Clique sur le lien dans l'email pour activer ton compte, puis reviens sur l'app.
          </p>
          {sent ? (
            <div style={{ backgroundColor: "#10B98115", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: "#10B981", fontWeight: 600, margin: 0 }}>✅ Email renvoyé !</p>
            </div>
          ) : (
            <button onClick={resend} disabled={loading}
              style={{ width: "100%", padding: "14px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12, opacity: loading ? 0.7 : 1 }}>
              <RefreshCw size={15} />{loading ? "Envoi..." : t("Renvoyer l'email", "Resend email")}
            </button>
          )}
          <button onClick={() => window.location.reload()}
            style={{ width: "100%", padding: "14px", backgroundColor: "#1C1B19", color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            J'ai confirmé mon email ✓
          </button>
        </div>
        <button onClick={signOut} style={{ background: "none", border: "none", color: "#8B8578", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{t("Se déconnecter", "Sign out")}</button>
      </motion.div>
    </div>
  );
}