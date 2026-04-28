import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Bell, BellOff, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

// ── Types ────────────────────────────────────────────────────
type NotifKey = "session_reminder" | "streak_alert" | "badge_notification" | "wellness_reminder" | "progress_report";
type TimeKey = "session_reminder_time" | "streak_alert_time" | "wellness_reminder_time";

interface NotifConfig {
  key: NotifKey;
  timeKey?: TimeKey;
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  desc: string;
}

const NOTIF_CONFIG: NotifConfig[] = [
  { key: "session_reminder",  timeKey: "session_reminder_time",  icon: "🗓", iconBg: "#FFF7ED", iconColor: "#B8973E", label: "Rappels de séance",      desc: "Notification avant chaque séance planifiée" },
  { key: "streak_alert",      timeKey: "streak_alert_time",      icon: "🔥", iconBg: "#FFF1F0", iconColor: "#EF4444", label: "Série en danger",        desc: "Alert si tu risques de briser ta série" },
  { key: "badge_notification",                                    icon: "🏆", iconBg: "#F3F0FF", iconColor: "#7C3AED", label: "Nouveaux badges",        desc: "Félicitations quand tu débloqucs un achievement" },
  { key: "wellness_reminder", timeKey: "wellness_reminder_time", icon: "💛", iconBg: "#FFF0F5", iconColor: "#EC4899", label: "Journal bien-être",      desc: "Rappel pour remplir ton bilan quotidien" },
  { key: "progress_report",                                       icon: "📈", iconBg: "#F0FFF4", iconColor: "#16A34A", label: "Rapports de progression", desc: "Bilan hebdomadaire de tes progrès" },
];

// ── Composant sélecteur d'heure ───────────────────────────────
function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];
  const [h, m] = value.split(":");

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <select value={h} onChange={e => onChange(e.target.value + ":" + m)}
        style={{ padding: "6px 8px", border: "1px solid rgba(28,27,25,0.12)", borderRadius: 8, fontSize: 14, color: "#1C1B19", backgroundColor: "white", fontFamily: "inherit", appearance: "none", WebkitAppearance: "none" }}>
        {hours.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span style={{ fontSize: 14, color: "#8B8578", fontWeight: 600 }}>:</span>
      <select value={m} onChange={e => onChange(h + ":" + e.target.value)}
        style={{ padding: "6px 8px", border: "1px solid rgba(28,27,25,0.12)", borderRadius: 8, fontSize: 14, color: "#1C1B19", backgroundColor: "white", fontFamily: "inherit", appearance: "none", WebkitAppearance: "none" }}>
        {minutes.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
}

// ── Toggle switch ─────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: value ? "#B8973E" : "#D1CCC5", cursor: "pointer", position: "relative", transition: "background-color 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 24 : 3, width: 22, height: 22, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function Notifications() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { settings, loading, saving, permissionGranted, requestPermission, saveSettings } = useNotifications();
  const [openTime, setOpenTime] = useState<TimeKey | null>(null);
  const [saved, setSaved] = useState(false);

  const handleToggle = async (key: NotifKey, value: boolean) => {
    // Si activation → demander la permission push si pas encore accordée
    if (value && !permissionGranted) {
      await requestPermission();
    }
    await saveSettings({ [key]: value });
    showSaved();
  };

  const handleTimeChange = async (timeKey: TimeKey, value: string) => {
    await saveSettings({ [timeKey]: value });
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <MobileLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex-1">
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Paramètres</p>
            <h1 className="font-display text-2xl font-light text-foreground">Notifications</h1>
          </div>
          {/* Indicateur sauvegarde */}
          <AnimatePresence>
            {(saving || saved) && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, backgroundColor: saved ? "rgba(34,197,94,0.1)" : "rgba(184,151,62,0.1)" }}>
                {saved
                  ? <><Check size={12} color="#22C55E" /><span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>Sauvegardé</span></>
                  : <><div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(184,151,62,0.3)", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} /><span style={{ fontSize: 11, color: "#B8973E" }}>Sauvegarde...</span></>
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bannière permission push si pas accordée */}
        {!permissionGranted && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 20, backgroundColor: "rgba(184,151,62,0.08)", border: "1px solid rgba(184,151,62,0.2)", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <BellOff size={18} color="#B8973E" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1B19", margin: "0 0 3px" }}>Notifications désactivées</p>
              <p style={{ fontSize: 12, color: "#8B8578", margin: "0 0 10px", lineHeight: 1.5 }}>
                Autorisez les notifications pour recevoir vos rappels.
              </p>
              <button onClick={requestPermission}
                style={{ padding: "8px 16px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Autoriser les notifications
              </button>
            </div>
          </motion.div>
        )}

        {/* Liste des notifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {NOTIF_CONFIG.map((notif, i) => {
            const isOn = settings[notif.key] as boolean;
            const timeValue = notif.timeKey ? settings[notif.timeKey] as string : null;
            const isTimeOpen = notif.timeKey && openTime === notif.timeKey;

            return (
              <motion.div key={notif.key}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ backgroundColor: "white", borderRadius: 20, border: "1px solid rgba(28,27,25,0.07)", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>

                {/* Ligne principale */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                  {/* Icône */}
                  <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: notif.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {notif.icon}
                  </div>

                  {/* Texte */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1B19", margin: 0, lineHeight: 1.2 }}>{notif.label}</p>
                    <p style={{ fontSize: 12, color: "#8B8578", margin: "2px 0 0", lineHeight: 1.4 }}>{notif.desc}</p>
                  </div>

                  {/* Heure + Toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {/* Bouton heure — uniquement si la notif a une heure et est activée */}
                    {notif.timeKey && isOn && timeValue && (
                      <button onClick={() => setOpenTime(isTimeOpen ? null : notif.timeKey!)}
                        style={{ padding: "5px 10px", border: "1px solid rgba(28,27,25,0.1)", borderRadius: 8, backgroundColor: isTimeOpen ? "#1C1B19" : "#F5F3EE", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isTimeOpen ? "white" : "#1C1B19" }}>
                          {timeValue}
                        </span>
                        <span style={{ fontSize: 10, color: isTimeOpen ? "#B8973E" : "#8B8578" }}>›</span>
                      </button>
                    )}
                    <Toggle value={isOn} onChange={v => handleToggle(notif.key, v)} />
                  </div>
                </div>

                {/* Sélecteur d'heure — dépliable */}
                <AnimatePresence>
                  {isTimeOpen && notif.timeKey && timeValue && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(28,27,25,0.05)" }}>
                        <p style={{ fontSize: 11, color: "#8B8578", margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Heure de notification
                        </p>
                        <TimePicker value={timeValue} onChange={v => { handleTimeChange(notif.timeKey!, v); }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Info bas de page */}
        <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 14, backgroundColor: "rgba(184,151,62,0.05)", border: "1px solid rgba(184,151,62,0.12)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Bell size={14} color="#B8973E" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "#8B8578", margin: 0, lineHeight: 1.6 }}>
              Les modifications sont sauvegardées automatiquement et synchronisées sur tous vos appareils.
            </p>
          </div>
        </div>

      </div>
      <BottomNav />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MobileLayout>
  );
}
