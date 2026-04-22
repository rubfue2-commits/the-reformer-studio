import { motion } from "framer-motion";
import {
  ChevronRight, Crown, Settings, Bell, HelpCircle,
  LogOut, Globe, Gift, Award, Heart, Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageContext";

type Language = "fr" | "en";

const Profile = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Bell, label: t("Notifications", "Notifications"), action: () => navigate("/notifications") },
    { icon: Settings, label: t("Préférences", "Preferences"), action: () => {} },
    { icon: HelpCircle, label: t("Aide", "Help"), action: () => {} },
  ];

  const quickLinks = [
    {
      icon: Award, label: "Badges & Achievements",
      sub: t("9 obtenus · Niveau 3 · 1 525 XP", "9 earned · Level 3 · 1,525 XP"),
      path: "/achievements", color: "#B8973E", bg: "#FAEEDA",
      extra: "🏅⭐🔥",
    },
    {
      icon: Heart, label: t("Journal bien-être", "Wellness journal"),
      sub: t("Énergie, humeur, sommeil...", "Energy, mood, sleep..."),
      path: "/wellness", color: "#EC4899", bg: "#FDF2F8",
      extra: "😊💧🌙",
    },
    {
      icon: Layers, label: t("Mes programmes", "My programs"),
      sub: t("Débutante · Semaine 2/4", "Beginner · Week 2/4"),
      path: "/programs", color: "#6366F1", bg: "#EEF2FF",
      extra: "50% ▶",
    },
  ];

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header avec logo Connect Reformer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-6">
          <Logo size="md" variant="full" />
          <button onClick={() => navigate("/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm">
            <Bell size={18} strokeWidth={1.5} className="text-muted-foreground" />
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-gold border-2 border-background" />
          </button>
        </motion.div>

        {/* User card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full font-display text-xl text-primary-foreground"
              style={{ background: "linear-gradient(135deg, #1C1B19, #B8973E)" }}>
              C
            </div>
            <div>
              <h2 className="font-display text-xl font-light text-foreground">Camille Laurent</h2>
              <p className="font-body text-xs text-muted-foreground">camille@email.com</p>
            </div>
          </div>
        </motion.div>

        {/* Abonnement */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-3 rounded-3xl border border-gold/30 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-gold" />
            <span className="font-body text-xs tracking-widest uppercase text-gold">{t("Membre annuel", "Annual member")}</span>
          </div>
          <p className="mt-2 font-display text-lg font-light text-foreground">{t("Abonnement Premium", "Premium subscription")}</p>
          <p className="mt-1 font-body text-xs text-muted-foreground">{t("Renouvellement le 15 mars 2026", "Renews March 15, 2026")}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="rounded-full bg-gold/10 px-3 py-1">
              <span className="font-body text-[10px] font-medium text-gold">{t("Actif", "Active")}</span>
            </div>
            <div className="rounded-full bg-muted px-3 py-1">
              <span className="font-body text-[10px] text-muted-foreground">{t("Illimité", "Unlimited")}</span>
            </div>
          </div>
        </motion.div>

        {/* Raccourcis rapides */}
        <div className="mt-3 space-y-2.5">
          {quickLinks.map(({ icon: Icon, label, sub, path, color, bg, extra }, i) => (
            <motion.button key={path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.05 }}
              onClick={() => navigate(path)}
              className="w-full rounded-2xl bg-card p-4 shadow-sm flex items-center justify-between border border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: bg }}>
                  <Icon size={18} strokeWidth={1.5} style={{ color }} />
                </div>
                <div className="text-left">
                  <p className="font-body text-sm font-medium text-foreground">{label}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-muted-foreground">{extra}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Parrainage */}
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
          onClick={() => navigate("/referral")}
          className="mt-2.5 w-full rounded-3xl p-5 shadow-sm flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20">
              <Gift size={18} className="text-gold" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="font-body text-sm font-medium text-white">{t("Inviter une amie", "Invite a friend")}</p>
              <p className="font-body text-[10px] text-white/50">{t("Gagne 1 mois offert par parrainage", "Get 1 free month per referral")}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/40" />
        </motion.button>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-3 flex gap-3">
          {[
            { value: "64", label: t("Séances totales", "Total sessions") },
            { value: "48h", label: t("Temps investi", "Time invested") },
            { value: "12", label: t("Jours consécutifs", "Day streak") },
          ].map(({ value, label }) => (
            <div key={label} className="flex-1 rounded-2xl bg-card p-4 text-center shadow-sm">
              <p className="font-display text-2xl text-foreground">{value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Langue */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="mt-3 rounded-3xl bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Globe size={18} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-body text-sm text-foreground">{t("Langue", "Language")}</span>
            </div>
            <div className="flex gap-2">
              {(["en", "fr"] as Language[]).map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)}
                  className={`rounded-full px-3 py-1 font-body text-xs transition-all ${
                    language === lang ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                  {lang === "en" ? "EN" : "FR"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Menu */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-3 rounded-3xl bg-card shadow-sm">
          {menuItems.map(({ icon: Icon, label, action }, i) => (
            <button key={label} onClick={action}
              className={`flex w-full items-center justify-between px-5 py-4 ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              }`}>
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="font-body text-sm text-foreground">{label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        {/* Déconnexion */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="mt-4 mb-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 font-body text-sm text-muted-foreground">
          <LogOut size={16} strokeWidth={1.5} />
          {t("prof.signout")}
        </motion.button>

      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Profile;