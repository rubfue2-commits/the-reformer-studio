import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, Trash2, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import { getStoredTheme, setTheme, type Theme } from "@/lib/theme";

const Preferences = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState<Theme>(getStoredTheme());

  const chooseTheme = (next: Theme) => {
    setTheme(next);
    setThemeState(next);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">{t("Mon compte", "My account")}</p>
            <h1 className="font-display text-2xl font-light text-foreground">{t("Préférences", "Preferences")}</h1>
          </div>
        </div>

        {/* Apparence */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1">{t("Apparence", "Appearance")}</p>
          <div className="rounded-2xl bg-card p-2 shadow-sm border border-border flex gap-2">
            <button onClick={() => chooseTheme("light")}
              className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1.5 transition-colors"
              style={theme === "light"
                ? { backgroundColor: "rgba(184,151,62,0.12)", border: "1px solid rgba(184,151,62,0.4)" }
                : { border: "1px solid transparent" }}>
              <Sun size={20} strokeWidth={1.5} style={{ color: theme === "light" ? "#B8973E" : undefined }} className={theme === "light" ? "" : "text-muted-foreground"} />
              <span className="font-body text-xs font-medium" style={{ color: theme === "light" ? "#B8973E" : undefined }}>{t("Clair", "Light")}</span>
            </button>
            <button onClick={() => chooseTheme("dark")}
              className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1.5 transition-colors"
              style={theme === "dark"
                ? { backgroundColor: "rgba(184,151,62,0.12)", border: "1px solid rgba(184,151,62,0.4)" }
                : { border: "1px solid transparent" }}>
              <Moon size={20} strokeWidth={1.5} style={{ color: theme === "dark" ? "#B8973E" : undefined }} className={theme === "dark" ? "" : "text-muted-foreground"} />
              <span className="font-body text-xs font-medium" style={{ color: theme === "dark" ? "#B8973E" : undefined }}>{t("Sombre", "Dark")}</span>
            </button>
          </div>
          <p className="font-body text-[10px] text-muted-foreground mt-2 px-1">{t("Le mode sombre est idéal pour les séances du soir.", "Dark mode is ideal for evening sessions.")}</p>
        </motion.div>

        {/* Légal */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1">{t("Légal", "Legal")}</p>
          <button onClick={() => navigate("/cgv")}
            className="w-full rounded-2xl bg-card p-4 shadow-sm flex items-center justify-between border border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(184,151,62,0.1)" }}>
                <FileText size={18} strokeWidth={1.5} style={{ color: "#B8973E" }} />
              </div>
              <div className="text-left">
                <p className="font-body text-sm font-medium text-foreground">{t("Conditions Générales de Vente", "Terms of Sale")}</p>
                <p className="font-body text-[10px] text-muted-foreground">{t("Abonnement, caution, résiliation…", "Subscription, deposit, termination…")}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
          </button>
        </motion.div>

        {/* Compte */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1">{t("Compte", "Account")}</p>
          <button onClick={() => navigate("/delete-account")}
            className="w-full rounded-2xl bg-card p-4 shadow-sm flex items-center justify-between"
            style={{ border: "1px solid rgba(239,68,68,0.25)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.08)" }}>
                <Trash2 size={18} strokeWidth={1.5} style={{ color: "#EF4444" }} />
              </div>
              <div className="text-left">
                <p className="font-body text-sm font-medium" style={{ color: "#EF4444" }}>{t("Supprimer mon compte", "Delete my account")}</p>
                <p className="font-body text-[10px] text-muted-foreground">{t("Suppression définitive de tes données (RGPD)", "Permanent deletion of your data (GDPR)")}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
          </button>
          <p className="font-body text-[10px] text-muted-foreground mt-2 px-1 leading-relaxed">
            {t("La suppression du compte ne vaut pas résiliation de l'abonnement — voir les CGV.",
               "Deleting your account does not terminate your subscription — see Terms of Sale.")}
          </p>
        </motion.div>

        {/* Version */}
        <p className="font-body text-[10px] text-muted-foreground text-center">Connect Reformer · v1.0</p>

      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Preferences;
