import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";

export interface NotificationSettings {
  session_reminder: boolean;
  session_reminder_time: string;
  streak_alert: boolean;
  streak_alert_time: string;
  badge_notification: boolean;
  wellness_reminder: boolean;
  wellness_reminder_time: string;
  progress_report: boolean;
  push_token: string | null;
}

const DEFAULTS: NotificationSettings = {
  session_reminder: true,
  session_reminder_time: "08:00",
  streak_alert: true,
  streak_alert_time: "20:00",
  badge_notification: true,
  wellness_reminder: true,
  wellness_reminder_time: "21:00",
  progress_report: true,
  push_token: null,
};

export function useNotifications() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (user) { loadSettings(); checkPermission(); }
  }, [user]);

  // ── Vérifier la permission push ──────────────────────────
  const checkPermission = async () => {
    try {
      const result = await PushNotifications.checkPermissions();
      setPermissionGranted(result.receive === "granted");
    } catch { setPermissionGranted(false); }
  };

  // ── Demander la permission push ──────────────────────────
  const requestPermission = async (): Promise<boolean> => {
    try {
      const result = await PushNotifications.requestPermissions();
      if (result.receive === "granted") {
        setPermissionGranted(true);
        await PushNotifications.register();
        return true;
      }
      return false;
    } catch { return false; }
  };

  // ── Charger les paramètres depuis Supabase ───────────────
  const loadSettings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          session_reminder: data.session_reminder ?? true,
          session_reminder_time: data.session_reminder_time?.substring(0,5) ?? "08:00",
          streak_alert: data.streak_alert ?? true,
          streak_alert_time: data.streak_alert_time?.substring(0,5) ?? "20:00",
          badge_notification: data.badge_notification ?? true,
          wellness_reminder: data.wellness_reminder ?? true,
          wellness_reminder_time: data.wellness_reminder_time?.substring(0,5) ?? "21:00",
          progress_report: data.progress_report ?? true,
          push_token: data.push_token ?? null,
        });
      } else {
        // Créer les paramètres par défaut
        await supabase.from("notification_settings").insert({ user_id: user.id, ...DEFAULTS });
      }
    } catch (e) { console.error("loadSettings error:", e); }
    finally { setLoading(false); }
  };

  // ── Sauvegarder ──────────────────────────────────────────
  const saveSettings = async (updated: Partial<NotificationSettings>) => {
    if (!user) return;
    setSaving(true);
    const newSettings = { ...settings, ...updated };
    setSettings(newSettings);

    try {
      await supabase.from("notification_settings").upsert({
        user_id: user.id,
        ...newSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // Replanifier les notifications locales
      await scheduleLocalNotifications(newSettings);
    } catch (e) { console.error("saveSettings error:", e); }
    finally { setSaving(false); }
  };

  // ── Notifications locales iOS ─────────────────────────────
  const scheduleLocalNotifications = async (s: NotificationSettings) => {
    try {
      // Annuler toutes les notifications existantes
      await LocalNotifications.cancel({ notifications: [
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 },
      ]});

      const toSchedule = [];

      if (s.session_reminder) {
        const [h, m] = s.session_reminder_time.split(":").map(Number);
        toSchedule.push({
          id: 1,
          title: "Connect Reformer",
          body: "C'est l'heure de ta séance ! Prête à bouger ?",
          schedule: { every: "day" as const, on: { hour: h, minute: m } },
          sound: "default",
        });
      }

      if (s.streak_alert) {
        const [h, m] = s.streak_alert_time.split(":").map(Number);
        toSchedule.push({
          id: 2,
          title: "Ta série est en danger",
          body: "Il te reste peu de temps pour maintenir ta série. Fais une séance !",
          schedule: { every: "day" as const, on: { hour: h, minute: m } },
          sound: "default",
        });
      }

      if (s.wellness_reminder) {
        const [h, m] = s.wellness_reminder_time.split(":").map(Number);
        toSchedule.push({
          id: 3,
          title: "Journal bien-être",
          body: "N'oublie pas de remplir ton bilan du jour pour voir ton score !",
          schedule: { every: "day" as const, on: { hour: h, minute: m } },
          sound: "default",
        });
      }

      if (s.progress_report) {
        toSchedule.push({
          id: 4,
          title: "Ton bilan de la semaine",
          body: "Découvre tes progrès et statistiques de la semaine !",
          schedule: { every: "week" as const, on: { weekday: 1, hour: 9, minute: 0 } },
          sound: "default",
        });
      }

      if (toSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: toSchedule });
      }
    } catch (e) { console.error("scheduleLocalNotifications error:", e); }
  };

  return { settings, loading, saving, permissionGranted, requestPermission, saveSettings, reload: loadSettings };
}
