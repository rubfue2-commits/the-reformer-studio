import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Mail, Copy, Check, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";

const SUPPORT_EMAIL = "hello@connectreformer.com";

const Support = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback très anciens webviews
      const ta = document.createElement("textarea");
      ta.value = SUPPORT_EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">{t("On est là pour toi", "We're here for you")}</p>
            <h1 className="font-display text-2xl font-light text-foreground">{t("Aide & support", "Help & support")}</h1>
          </div>
        </div>

        {/* Discuter avec nous — chat en direct */}
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/support-chat")}
          className="w-full rounded-3xl p-5 mb-4 flex items-center gap-3"
          style={{ backgroundColor: "rgba(184,151,62,0.08)", border: "0.5px solid rgba(184,151,62,0.3)", cursor: "pointer" }}>
          <div className="flex h-11 w-11 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(184,151,62,0.15)" }}>
            <MessageCircle size={20} strokeWidth={1.5} style={{ color: "#B8973E" }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-body text-sm font-medium text-foreground">{t("Discuter avec nous", "Chat with us")}</p>
            <p className="font-body text-[11px] text-muted-foreground">{t("Tous les jours de 9h à 18h", "Every day from 9:00 to 18:00")}</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </motion.button>

        {/* Carte contact */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card p-5 shadow-sm border border-border mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(184,151,62,0.1)" }}>
              <MessageCircle size={18} strokeWidth={1.5} style={{ color: "#B8973E" }} />
            </div>
            <div>
              <p className="font-body text-sm font-medium text-foreground">{t("Une question ? Un souci ?", "A question? An issue?")}</p>
              <p className="font-body text-[11px] text-muted-foreground">{t("Réponse sous 24h ouvrées", "Reply within 24 business hours")}</p>
            </div>
          </div>

          {/* Email visible */}
          <div className="rounded-2xl px-4 py-3 mb-3" style={{ backgroundColor: "rgba(28,27,25,0.04)" }}>
            <p className="font-body text-sm text-foreground text-center" style={{ wordBreak: "break-all" }}>{SUPPORT_EMAIL}</p>
          </div>

          {/* Écrire un email — lien natif, délégué à iOS */}
          <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Connect Reformer — demande d'aide")}`}
            style={{ textDecoration: "none" }}>
            <div className="flex items-center justify-center gap-2 rounded-2xl py-3.5 mb-2"
              style={{ backgroundColor: "#B8973E", cursor: "pointer" }}>
              <Mail size={16} color="#1C1B19" strokeWidth={2} />
              <span className="font-body text-sm font-semibold" style={{ color: "#1C1B19" }}>{t("Écrire un email", "Write an email")}</span>
            </div>
          </a>

          {/* Copier l'adresse — marche dans 100% des cas */}
          <button onClick={copyEmail}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 border border-border"
            style={{ backgroundColor: "transparent" }}>
            {copied
              ? <><Check size={16} strokeWidth={2} style={{ color: "#16A34A" }} /><span className="font-body text-sm font-medium" style={{ color: "#16A34A" }}>{t("Adresse copiée !", "Address copied!")}</span></>
              : <><Copy size={16} strokeWidth={1.5} className="text-muted-foreground" /><span className="font-body text-sm font-medium text-muted-foreground">{t("Copier l'adresse", "Copy address")}</span></>}
          </button>
        </motion.div>

        <p className="font-body text-[10px] text-muted-foreground text-center leading-relaxed px-4">
          {t("Si le bouton email ne s'ouvre pas, copie l'adresse et écris-nous depuis ta boîte mail habituelle.",
             "If the email button doesn't open, copy the address and write to us from your usual mailbox.")}
        </p>

      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Support;
