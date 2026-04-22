import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import Logo from "@/components/Logo";

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8"
      style={{ background: "#F5F0E8" }}>

      {/* Logo Connect Reformer */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-16"
      >
        <Logo size="xl" variant="full" />
      </motion.div>

      {/* Sélection langue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-xs space-y-4"
      >
        <p className="mb-6 text-center font-body text-sm tracking-widest uppercase"
          style={{ color: "#888780" }}>
          Choisissez votre langue
        </p>

        {/* Français */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect("fr")}
          className="flex w-full items-center justify-between rounded-2xl px-6 py-4 shadow-sm transition-all"
          style={{ background: "#1C1B19", color: "#F5F0E8" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🇫🇷</span>
            <span className="font-body text-base font-light tracking-wide">Français</span>
          </div>
          <span className="font-body text-sm" style={{ color: "#B8973E" }}>→</span>
        </motion.button>

        {/* English */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect("en")}
          className="flex w-full items-center justify-between rounded-2xl border px-6 py-4 transition-all"
          style={{ background: "transparent", borderColor: "#C5BFA8", color: "#1C1B19" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🇬🇧</span>
            <span className="font-body text-base font-light tracking-wide">English</span>
          </div>
          <span className="font-body text-sm" style={{ color: "#B8973E" }}>→</span>
        </motion.button>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 font-body text-xs tracking-widest uppercase text-center"
        style={{ color: "#B4B2A9" }}
      >
        Pilates · Performance · Bien-être
      </motion.p>
    </div>
  );
};

export default LanguageSelect;
