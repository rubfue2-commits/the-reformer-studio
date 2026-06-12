import { describe, it, expect } from "vitest";

// Ce test détecte les erreurs au CHARGEMENT des modules (constantes top-level
// invalides, références non définies hors composant). C'est exactement le type
// de bug qui rend l'app entièrement blanche au démarrage.
const modules = import.meta.glob(["../pages/*.tsx", "../components/*.tsx", "../hooks/*.ts", "../lib/*.ts"]);

describe("Tous les modules se chargent sans crash", () => {
  for (const [path, loader] of Object.entries(modules)) {
    it(`charge ${path}`, async () => {
      await expect(loader()).resolves.toBeDefined();
    });
  }
});
