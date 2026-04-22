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
    // Fond page — gris pour desktop
    <div className="min-h-screen w-full flex items-start justify-center" style={{ background: "#E8E4DC" }}>
      {/* Conteneur iPhone 390px */}
      <div className="relative w-full flex flex-col items-center justify-center"
        style={{
          maxWidth: "390px",
          minHeight: "100svh",
          background: "#F5F0E8",
          boxShadow: "0 0 60px rgba(0,0,0,0.15)",
        }}>

        <div className="flex flex-col items-center justify-center flex-1 px-8 w-full">
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
            className="w-full space-y-4"
          >
            <p className="mb-6 text-center font-body text-sm tracking-widest uppercase"
              style={{ color: "#888780" }}>
              Choisissez votre langue
            </p>

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
      </div>
    </div>
  );
};

export default LanguageSelect;
