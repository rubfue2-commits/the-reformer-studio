import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Bell, BellOff, Flame, Trophy,
  Calendar, Heart, Clock, ChevronRight, Check,
  Sparkles, TrendingUp, Gift
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotifSetting {
  id: string;
  icon: any;
  color: string;
  title: string;
  desc: string;
  enabled: boolean;
  time?: string;
  days?: string[];
}

interface NotifHistory {
  id: string;
  icon: any;
  color: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "reminder" | "achievement" | "tip" | "promo";
}

// ─── Données ──────────────────────────────────────────────────────────────────

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const DAYS_FULL = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const TIMES = ["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

const HISTORY: NotifHistory[] = [
  { id: "n1", icon: Flame,     color: "#B8973E", title: "Série en danger ! 🔥",              body: "Tu as une série de 12 jours — ne la brise pas aujourd'hui.",           time: "Il y a 2h",   read: false, type: "reminder"    },
  { id: "n2", icon: Trophy,    color: "#6366F1", title: "Nouveau badge débloqué ! 🏅",       body: "Tu viens d'obtenir le badge '7 jours d'affilée'. +200 XP !",           time: "Hier, 09:00", read: false, type: "achievement" },
  { id: "n3", icon: Calendar,  color: "#B8973E", title: "Ta séance t'attend 💪",             body: "Full Body Flow · 45 min est planifié aujourd'hui à 18h.",               time: "Hier, 08:00", read: true,  type: "reminder"    },
  { id: "n4", icon: Heart,     color: "#EC4899", title: "Bilan bien-être du jour",           body: "Comment tu te sens aujourd'hui ? Remplis ton journal pour garder le fil.", time: "Hier, 20:00", read: true,  type: "tip"         },
  { id: "n5", icon: TrendingUp,color: "#4CAF50", title: "Progression impressionnante ! 📈",  body: "Tu as perdu 2.2 kg depuis le début. Continue comme ça !",               time: "Il y a 3j",   read: true,  type: "achievement" },
  { id: "n6", icon: Sparkles,  color: "#F59E0B", title: "Conseil de la semaine ✨",          body: "Pour maximiser le Teaser, active le transverse avant de lever les jambes.", time: "Il y a 4j",  read: true,  type: "tip"         },
  { id: "n7", icon: Gift,      color: "#B8973E", title: "Sophie a rejoint via ton code 🎁",  body: "1 mois offert a été crédité sur ton compte. Merci !",                   time: "Il y a 5j",   read: true,  type: "promo"       },
  { id: "n8", icon: Calendar,  color: "#B8973E", title: "Ta séance t'attend 💪",             body: "Core & Abs Pilates · 20 min est planifié aujourd'hui à 07h30.",          time: "Il y a 6j",   read: true,  type: "reminder"    },
];

// ─── Toggle switch ────────────────────────────────────────────────────────────

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!enabled)}
    className="relative flex-shrink-0 h-7 w-12 rounded-full transition-all duration-200"
    style={{ backgroundColor: enabled ? "#B8973E" : "hsl(27,8%,82%)" }}
  >
    <motion.div
      className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
      animate={{ left: enabled ? "calc(100% - 26px)" : "2px" }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);

// ─── Page Notifications ───────────────────────────────────────────────────────

const Notifications = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"reglages" | "historique">("reglages");
  const [globalEnabled, setGlobalEnabled] = useState(true);

  const [settings, setSettings] = useState<NotifSetting[]>([
    {
      id: "rappel",
      icon: Calendar,
      color: "#B8973E",
      title: "Rappels de séance",
      desc: "Notification avant chaque séance planifiée",
      enabled: true,
      time: "08:00",
      days: ["L", "M", "J"],
    },
    {
      id: "serie",
      icon: Flame,
      color: "#EF4444",
      title: "Série en danger",
      desc: "Alert si tu risques de briser ta série",
      enabled: true,
      time: "20:00",
    },
    {
      id: "badges",
      icon: Trophy,
      color: "#6366F1",
      title: "Nouveaux badges",
      desc: "Félicitations quand tu débloques un achievement",
      enabled: true,
    },
    {
      id: "bienetre",
      icon: Heart,
      color: "#EC4899",
      title: "Journal bien-être",
      desc: "Rappel pour remplir ton bilan quotidien",
      enabled: true,
      time: "21:00",
    },
    {
      id: "progression",
      icon: TrendingUp,
      color: "#4CAF50",
      title: "Rapports de progression",
      desc: "Bilan hebdomadaire de tes progrès",
      enabled: true,
    },
    {
      id: "conseils",
      icon: Sparkles,
      color: "#F59E0B",
      title: "Conseils & astuces",
      desc: "Tips pilates et bien-être personnalisés",
      enabled: false,
    },
    {
      id: "offres",
      icon: Gift,
      color: "#B8973E",
      title: "Offres & parrainage",
      desc: "Nouvelles récompenses et codes promo",
      enabled: false,
    },
  ]);

  const [history, setHistory] = useState(HISTORY);
  const [expandedSetting, setExpandedSetting] = useState<string | null>(null);

  const unreadCount = history.filter(n => !n.read).length;

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const updateTime = (id: string, time: string) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, time } : s));
  };

  const toggleDay = (settingId: string, day: string) => {
    setSettings(prev => prev.map(s => {
      if (s.id !== settingId || !s.days) return s;
      const days = s.days.includes(day) ? s.days.filter(d => d !== day) : [...s.days, day];
      return { ...s, days };
    }));
  };

  const markAllRead = () => setHistory(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setHistory(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/profile")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border">
            <ChevronLeft size={18} strokeWidth={1.5} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-light text-foreground">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="font-body text-[10px] text-gold underline-offset-2">
              Tout lire
            </button>
          )}
        </motion.div>

        {/* Global toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="mb-5 flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${globalEnabled ? "bg-gold/10" : "bg-muted"}`}>
              {globalEnabled
                ? <Bell size={18} className="text-gold" strokeWidth={1.5} />
                : <BellOff size={18} className="text-muted-foreground" strokeWidth={1.5} />
              }
            </div>
            <div>
              <p className="font-body text-sm font-medium text-foreground">Toutes les notifications</p>
              <p className="font-body text-[10px] text-muted-foreground">
                {globalEnabled ? "Activées" : "Désactivées"}
              </p>
            </div>
          </div>
          <Toggle enabled={globalEnabled} onChange={setGlobalEnabled} />
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-5">
          {([
            { id: "reglages",   label: "Réglages" },
            { id: "historique", label: `Historique${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
          ] as { id: typeof tab; label: string }[]).map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 pb-3 font-body text-xs transition-all ${
                tab === id ? "border-b-2 border-gold text-foreground -mb-[1px]" : "text-muted-foreground"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {/* ─── RÉGLAGES ─── */}
            {tab === "reglages" && (
              <div className="space-y-3 pb-6">
                {!globalEnabled && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl border border-dashed border-border p-4 text-center">
                    <BellOff size={24} className="text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                    <p className="font-body text-sm text-muted-foreground">
                      Toutes les notifications sont désactivées
                    </p>
                  </motion.div>
                )}

                {settings.map((setting, i) => {
                  const Icon = setting.icon;
                  const isExpanded = expandedSetting === setting.id;

                  return (
                    <motion.div key={setting.id} initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`rounded-2xl bg-card shadow-sm overflow-hidden ${!globalEnabled ? "opacity-40 pointer-events-none" : ""}`}>

                      {/* Ligne principale */}
                      <div className="flex items-center gap-3 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: setting.color + "15" }}>
                          <Icon size={16} strokeWidth={1.5} style={{ color: setting.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-foreground">{setting.title}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{setting.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {setting.enabled && (setting.time || setting.days) && (
                            <button onClick={() => setExpandedSetting(isExpanded ? null : setting.id)}
                              className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                              {setting.time && (
                                <span className="font-body text-[10px] text-muted-foreground">{setting.time}</span>
                              )}
                              <ChevronRight size={10} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                          )}
                          <Toggle enabled={setting.enabled} onChange={() => toggleSetting(setting.id)} />
                        </div>
                      </div>

                      {/* Panneau étendu */}
                      <AnimatePresence>
                        {isExpanded && setting.enabled && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
                            <div className="p-4 space-y-4">

                              {/* Heure */}
                              {setting.time && (
                                <div>
                                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                                    Heure
                                  </p>
                                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {TIMES.map(t => (
                                      <button key={t} onClick={() => updateTime(setting.id, t)}
                                        className={`shrink-0 rounded-full px-3 py-1.5 font-body text-xs transition-all ${
                                          setting.time === t
                                            ? "text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                        style={setting.time === t ? { backgroundColor: setting.color } : {}}>
                                        {t}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Jours */}
                              {setting.days && (
                                <div>
                                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
                                    Jours
                                  </p>
                                  <div className="flex gap-2">
                                    {DAYS.map((day, di) => {
                                      const active = setting.days!.includes(day);
                                      return (
                                        <button key={`${day}-${di}`}
                                          onClick={() => toggleDay(setting.id, day)}
                                          className={`flex-1 rounded-xl py-2 font-body text-xs transition-all ${
                                            active ? "text-white" : "bg-muted text-muted-foreground"
                                          }`}
                                          style={active ? { backgroundColor: setting.color } : {}}>
                                          {day}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* Info iOS */}
                <div className="rounded-2xl border border-border p-4 text-center">
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    Pour recevoir les notifications, autorise l'app dans <strong>Réglages iOS → Notifications → The Reformer Studio</strong>
                  </p>
                </div>
              </div>
            )}

            {/* ─── HISTORIQUE ─── */}
            {tab === "historique" && (
              <div className="pb-6">
                {unreadCount > 0 && (
                  <p className="font-body text-[10px] text-muted-foreground mb-3">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
                <div className="rounded-3xl bg-card shadow-sm overflow-hidden">
                  {history.map((notif, i) => {
                    const Icon = notif.icon;
                    return (
                      <button key={notif.id} onClick={() => markRead(notif.id)}
                        className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-all ${
                          i < history.length - 1 ? "border-b border-border" : ""
                        } ${!notif.read ? "bg-gold/5" : ""}`}>

                        {/* Icône */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: notif.color + "15" }}>
                          <Icon size={16} strokeWidth={1.5} style={{ color: notif.color }} />
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-body text-sm ${!notif.read ? "font-medium text-foreground" : "text-foreground"}`}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <div className="h-2 w-2 shrink-0 rounded-full bg-gold mt-1.5" />
                            )}
                          </div>
                          <p className="font-body text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {notif.body}
                          </p>
                          <p className="font-body text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {history.every(n => n.read) && (
                  <div className="mt-4 text-center">
                    <Check size={20} className="text-green-500 mx-auto mb-1" strokeWidth={2} />
                    <p className="font-body text-xs text-muted-foreground">Tout est lu ✓</p>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Notifications;
