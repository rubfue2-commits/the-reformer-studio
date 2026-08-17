/**
 * Gestion du thème clair / sombre.
 * Choix manuel mémorisé dans le stockage local (persiste entre les sessions).
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "cr-theme";

export function getStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch { /* ignore */ }
  return "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function setTheme(theme: Theme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  applyTheme(theme);
}

/** À appeler au démarrage de l'app pour restaurer le choix mémorisé. */
export function initTheme() {
  applyTheme(getStoredTheme());
}
