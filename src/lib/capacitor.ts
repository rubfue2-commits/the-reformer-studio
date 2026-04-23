/**
 * capacitor.ts
 * Utilitaires Capacitor — détection de plateforme et accès aux plugins natifs.
 * Toutes les fonctions sont safe à appeler dans le navigateur (fallback no-op).
 */

import { Capacitor } from '@capacitor/core';

// ─────────────────────────────────────────
// Détection de plateforme
// ─────────────────────────────────────────

/** true si l'app tourne dans Capacitor (iOS ou Android) */
export const isNative = Capacitor.isNativePlatform();

/** true si iOS natif */
export const isIOS = Capacitor.getPlatform() === 'ios';

/** true si Android natif */
export const isAndroid = Capacitor.getPlatform() === 'android';

/** true si navigateur web classique */
export const isWeb = !isNative;

// ─────────────────────────────────────────
// Haptics (vibrations tactiles iOS)
// ─────────────────────────────────────────

/**
 * Vibration légère — à utiliser sur les boutons importants
 * (ex: démarrer une séance, valider une note)
 */
export async function hapticLight() {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}

/**
 * Vibration moyenne — actions importantes
 * (ex: enregistrement bien-être, ajout mesure)
 */
export async function hapticMedium() {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}

/**
 * Vibration succès — confirmation
 * (ex: journal enregistré, parrainage validé)
 */
export async function hapticSuccess() {
  if (!isNative) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

/**
 * Vibration erreur
 */
export async function hapticError() {
  if (!isNative) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Error });
  } catch {}
}

// ─────────────────────────────────────────
// Status Bar
// ─────────────────────────────────────────

/** Cacher la status bar (ex: page de langue ou onboarding) */
export async function hideStatusBar() {
  if (!isNative) return;
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.hide();
  } catch {}
}

/** Afficher la status bar */
export async function showStatusBar() {
  if (!isNative) return;
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.show();
  } catch {}
}

// ─────────────────────────────────────────
// Keyboard
// ─────────────────────────────────────────

/** Fermer le clavier programmatiquement */
export async function hideKeyboard() {
  if (!isNative) return;
  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    await Keyboard.hide();
  } catch {}
}

// ─────────────────────────────────────────
// App lifecycle
// ─────────────────────────────────────────

/**
 * Écouter le bouton retour Android (no-op sur iOS)
 * Retourne une fonction de cleanup à appeler dans useEffect
 */
export function onBackButton(handler: () => void): () => void {
  if (!isAndroid) return () => {};
  const listener = { remove: () => {} };
  import('@capacitor/app').then(({ App }) => {
    App.addListener('backButton', handler).then(l => {
      Object.assign(listener, l);
    });
  });
  return () => listener.remove();
}

// ─────────────────────────────────────────
// Safe area insets iOS
// ─────────────────────────────────────────

/**
 * Retourne la hauteur de la safe area en bas (home indicator iPhone X+)
 * Utilisé pour ajuster la bottom nav
 */
export function getSafeAreaBottom(): number {
  if (!isNative) return 0;
  // Capacitor expose les safe areas via CSS env() — on les lit via JS
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:env(safe-area-inset-bottom,0px);height:0;pointer-events:none;';
  document.body.appendChild(el);
  const bottom = parseInt(getComputedStyle(el).bottom) || 0;
  document.body.removeChild(el);
  return bottom;
}
