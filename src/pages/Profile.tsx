import { motion } from "framer-motion";
import {
  ChevronRight, Crown, Settings, Bell, HelpCircle,
  LogOut, Globe, Gift, Award, Heart, Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";

const Profile = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Bell, label: t.profile.notifications, action: () => {} },
    { icon: Settings, label: t.profile.preferences, action: () => {} },
    { icon: HelpCircle, label: t.profile.help, action: () => {} },
  ];

  const quickLinks = [
    {
      icon: Award, label: "Badges & Achievements",
      sub: "9 obtenus · Niveau 3 · 1 525 XP",
      path: "/achievements", color: "#B8973E", bg: "#FAEEDA",
      extra: "🏅⭐🔥",
    },
    {
      icon: Heart, label: "Journal bien-être",
      sub: "Énergie, humeur, sommeil...",
      path: "/wellness", color: "#EC4899", bg: "#FDF2F8",
      extra: "😊💧🌙",
    },
    {
      icon: Layers, label: "Mes programmes",
      sub: "Débutante · Semaine 2/4",
      path: "/programs", color: "#6366F1", bg: "#EEF2FF",
      extra: "50% ▶",
    },
  ];

  return (
    <MobileLayout>
      <div className="px-6 pt-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-light text-foreground">{t.profile.title}</h1>
        </motion.div>

        {/* User card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-6 rounded-3xl bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted font-display text-xl text-foreground">C</div>
            <div>
              <h2 className="font-display text-xl font-light text-foreground">Camille Laurent</h2>
              <p className="font-body text-xs text-muted-foreground">camille@email.com</p>
            </div>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-4 rounded-3xl border border-gold/30 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-gold" />
            <span className="font-body text-xs tracking-widest uppercase text-gold">{t.profile.annualMember}</span>
          </div>
          <p className="mt-2 font-display text-lg font-light text-foreground">{t.profile.premiumSub}</p>
          <p className="mt-1 font-body text-xs text-muted-foreground">{t.profile.renews}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="rounded-full bg-gold/10 px-3 py-1">
              <span className="font-body text-[10px] font-medium text-gold">{t.profile.active}</span>
            </div>
            <div className="rounded-full bg-muted px-3 py-1">
              <span className="font-body text-[10px] text-muted-foreground">{t.profile.unlimited}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick links */}
        <div className="mt-4 space-y-3">
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

        {/* Parrainage CTA */}
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
          onClick={() => navigate("/referral")}
          className="mt-3 w-full rounded-3xl p-5 shadow-sm flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20">
              <Gift size={18} className="text-gold" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="font-body text-sm font-medium text-white">Inviter une amie</p>
              <p className="font-body text-[10px] text-white/50">Gagne 1 mois offert par parrainage</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/40" />
        </motion.button>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-4 flex gap-3">
          {[
            { value: "64", label: t.profile.totalSessions },
            { value: "48h", label: t.profile.timeInvested },
            { value: "12", label: t.profile.dayStreak },
          ].map(({ value, label }) => (
            <div key={label} className="flex-1 rounded-2xl bg-card p-4 text-center shadow-sm">
              <p className="font-display text-2xl text-foreground">{value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="mt-4 rounded-3xl bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Globe size={18} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-body text-sm text-foreground">Language</span>
            </div>
            <div className="flex gap-2">
              {(["en", "fr"] as Language[]).map((lang) => (
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
          className="mt-4 rounded-3xl bg-card shadow-sm">
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

        {/* Logout */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="mt-6 mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 font-body text-sm text-muted-foreground">
          <LogOut size={16} strokeWidth={1.5} />
          {t.profile.signOut}
        </motion.button>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Profile;
