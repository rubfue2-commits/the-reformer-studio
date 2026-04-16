import { motion } from "framer-motion";
import { ChevronRight, Crown, Settings, Bell, HelpCircle, LogOut, Globe } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";

const Profile = () => {
  const { t, language, setLanguage } = useLanguage();

  const menuItems = [
    { icon: Bell, label: t.profile.notifications },
    { icon: Settings, label: t.profile.preferences },
    { icon: HelpCircle, label: t.profile.help },
  ];

  return (
    <MobileLayout>
      <div className="px-6 pt-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-light text-foreground">{t.profile.title}</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 rounded-3xl bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted font-display text-xl text-foreground">C</div>
            <div>
              <h2 className="font-display text-xl font-light text-foreground">Camille Laurent</h2>
              <p className="font-body text-xs text-muted-foreground">camille@email.com</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 rounded-3xl border border-gold/30 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-gold" />
            <span className="font-body text-xs tracking-widest uppercase text-gold">{t.profile.annualMember}</span>
          </div>
          <p className="mt-2 font-display text-lg font-light text-foreground">{t.profile.premiumSub}</p>
          <p className="mt-1 font-body text-xs text-muted-foreground">{t.profile.renews}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="rounded-full bg-gold/10 px-3 py-1"><span className="font-body text-[10px] font-medium text-gold">{t.profile.active}</span></div>
            <div className="rounded-full bg-muted px-3 py-1"><span className="font-body text-[10px] text-muted-foreground">{t.profile.unlimited}</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 flex gap-3">
          <div className="flex-1 rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-foreground">64</p>
            <p className="font-body text-[10px] text-muted-foreground">{t.profile.totalSessions}</p>
          </div>
          <div className="flex-1 rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-foreground">48h</p>
            <p className="font-body text-[10px] text-muted-foreground">{t.profile.timeInvested}</p>
          </div>
          <div className="flex-1 rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-foreground">12</p>
            <p className="font-body text-[10px] text-muted-foreground">{t.profile.dayStreak}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-4 rounded-3xl bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Globe size={18} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="font-body text-sm text-foreground">Language</span>
            </div>
            <div className="flex gap-2">
              {(["en", "fr"] as Language[]).map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)}
                  className={`rounded-full px-3 py-1 font-body text-xs transition-all ${language === lang ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {lang === "en" ? "EN" : "FR"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 rounded-3xl bg-card shadow-sm">
          {menuItems.map(({ icon: Icon, label }, i) => (
            <button key={label} className={`flex w-full items-center justify-between px-5 py-4 ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}>
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="font-body text-sm text-foreground">{label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
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
