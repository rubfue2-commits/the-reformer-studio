import { motion } from "framer-motion";
import { ChevronRight, Crown, Settings, Bell, HelpCircle, LogOut } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

const menuItems = [
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Preferences" },
  { icon: HelpCircle, label: "Help & Support" },
];

const Profile = () => {
  return (
    <MobileLayout>
      <div className="px-6 pt-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-light text-foreground">Profile</h1>
        </motion.div>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-3xl bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted font-display text-xl text-foreground">
              C
            </div>
            <div>
              <h2 className="font-display text-xl font-light text-foreground">Camille Laurent</h2>
              <p className="font-body text-xs text-muted-foreground">camille@email.com</p>
            </div>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 rounded-3xl border border-gold/30 bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-gold" />
            <span className="font-body text-xs tracking-widest uppercase text-gold">
              Annual Member
            </span>
          </div>
          <p className="mt-2 font-display text-lg font-light text-foreground">
            Premium Subscription
          </p>
          <p className="mt-1 font-body text-xs text-muted-foreground">
            Renews March 15, 2027
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="rounded-full bg-gold/10 px-3 py-1">
              <span className="font-body text-[10px] font-medium text-gold">Active</span>
            </div>
            <div className="rounded-full bg-muted px-3 py-1">
              <span className="font-body text-[10px] text-muted-foreground">Unlimited access</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4 flex gap-3"
        >
          <div className="flex-1 rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-foreground">64</p>
            <p className="font-body text-[10px] text-muted-foreground">Total sessions</p>
          </div>
          <div className="flex-1 rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-foreground">48h</p>
            <p className="font-body text-[10px] text-muted-foreground">Time invested</p>
          </div>
          <div className="flex-1 rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-foreground">12</p>
            <p className="font-body text-[10px] text-muted-foreground">Day streak</p>
          </div>
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-3xl bg-card shadow-sm"
        >
          {menuItems.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              className={`flex w-full items-center justify-between px-5 py-4 ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
                <span className="font-body text-sm text-foreground">{label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 font-body text-sm text-muted-foreground"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </motion.button>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Profile;
