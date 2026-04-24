import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export default function LanguageSelect() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const handleSelect = (lang: "fr" | "en") => {
    setLanguage(lang);
    navigate("/auth");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden"
      style={{ backgroundColor: "#F5F3EE" }}>

      {/* Fond décoratif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #B8973E 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #B8973E 0%, transparent 70%)" }} />
      </div>

      {/* Header — Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center w-full px-8 pt-16">

        {/* Badge catégorie */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10">
          <p className="font-body text-xs tracking-[0.25em] uppercase text-gold font-medium">
            Pilates Reformer
          </p>
        </motion.div>

        {/* Nom app — police droite sans italique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center mb-4">
          <h1 className="font-body leading-tight"
            style={{ fontSize: 52, fontWeight: 300, color: "#1C1B19", letterSpacing: "-0.01em" }}>
            Connect
          </h1>
          <h1 className="font-body leading-tight"
            style={{ fontSize: 52, fontWeight: 300, color: "#B8973E", letterSpacing: "-0.01em" }}>
            Reformer
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-body text-sm text-center max-w-xs"
          style={{ color: "#8B8578", lineHeight: 1.6 }}>
          Votre studio de Pilates,{" "}
          <span style={{ color: "#1C1B19", fontWeight: 500 }}>partout avec vous</span>
        </motion.p>

      </motion.div>

      {/* Sélection langue */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full px-6 pb-12 space-y-3">

        <p className="font-body text-xs text-center tracking-widest uppercase mb-4"
          style={{ color: "#B8B0A6" }}>
          Choisissez votre langue
        </p>

        {/* Bouton Français */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect("fr")}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all"
          style={{ backgroundColor: "#1C1B19", boxShadow: "0 8px 32px rgba(28,27,25,0.25)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: "#2D2A22" }}>
            <span style={{ fontSize: 22 }}>🇫🇷</span>
          </div>
          <div className="flex-1 text-left">
            <p className="font-body text-base font-medium text-white" style={{ fontStyle: "normal" }}>
              Français
            </p>
            <p className="font-body text-xs" style={{ color: "#8B8578", fontStyle: "normal" }}>
              Continuer en français
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
            style={{ backgroundColor: "#B8973E" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.button>

        {/* Bouton English */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect("en")}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all"
          style={{ backgroundColor: "white", borderColor: "#E8E4DE", boxShadow: "0 2px 12px rgba(28,27,25,0.06)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: "#F5F3EE" }}>
            <span style={{ fontSize: 22 }}>🇬🇧</span>
          </div>
          <div className="flex-1 text-left">
            <p className="font-body text-base font-medium" style={{ color: "#1C1B19", fontStyle: "normal" }}>
              English
            </p>
            <p className="font-body text-xs" style={{ color: "#B8B0A6", fontStyle: "normal" }}>
              Continue in English
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
            style={{ backgroundColor: "#F5F3EE" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="#B8973E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.button>

        {/* Note */}
        <p className="font-body text-[11px] text-center pt-2" style={{ color: "#C4BDB5" }}>
          Vous pourrez changer la langue dans votre profil
        </p>

      </motion.div>
    </div>
  );
}
