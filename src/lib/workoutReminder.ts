import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

const REMINDER_ID = 42;
const DAYS_BEFORE_REMINDER = 3;

/**
 * Programme un rappel de séance à J+3 (18h00).
 * Appelé à chaque ouverture de l'app : tant que la cliente revient,
 * le rappel est repoussé. Si elle n'ouvre plus l'app pendant 3 jours,
 * la notification part.
 */
export async function scheduleWorkoutReminder() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }

    // Annuler le rappel précédent et reprogrammer
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });

    const at = new Date();
    at.setDate(at.getDate() + DAYS_BEFORE_REMINDER);
    at.setHours(18, 0, 0, 0);

    await LocalNotifications.schedule({
      notifications: [{
        id: REMINDER_ID,
        title: "Ta séance t'attend 🧘‍♀️",
        body: "Cela fait quelques jours… Quelques minutes sur ton Reformer suffisent pour te faire du bien.",
        schedule: { at },
        sound: "default",
      }],
    });
  } catch (e) {
    console.warn("Reminder scheduling failed:", e);
  }
}
