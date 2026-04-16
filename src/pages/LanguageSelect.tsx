import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import MobileLayout from "@/components/MobileLayout";

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    navigate("/auth");
  };

  return (
    <MobileLayout showNav={false}>
      <div className="flex min-h-screen flex-col items-center justify-center px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
            The Reformer Studio
          </p>
          <h1 className="font-display text-4xl font-light text-foreground leading-tight">
            Choose your<br />language
          </h1>
          <div className="mt-3 mx-auto h-[1px] w-12 bg-gold" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full space-y-4"
        >
          <button
            onClick={() => handleSelect("en")}
            className="group w-full rounded-2xl border border-border bg-card px-6 py-5 text-left transition-all hover:border-gold active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1">English</p>
                <p className="font-display text-2xl font-light text-foreground">English</p>
              </div>
              <span className="text-3xl">🇬🇧</span>
            </div>
          </button>

          <button
            onClick={() => handleSelect("fr")}
            className="group w-full rounded-2xl border border-border bg-card px-6 py-5 text-left transition-all hover:border-gold active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Français</p>
                <p className="font-display text-2xl font-light text-foreground">Français</p>
              </div>
              <span className="text-3xl">🇫🇷</span>
            </div>
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 font-body text-xs text-muted-foreground text-center"
        >
          You can change this later in your profile
        </motion.p>
      </div>
    </MobileLayout>
  );
};

export default LanguageSelect;
