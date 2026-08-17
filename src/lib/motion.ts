import type { Variants, Transition } from "framer-motion";

/**
 * Système d'animation central Connect Reformer.
 * Des courbes douces et cohérentes pour un ressenti premium et calme,
 * dans l'esprit des apps de bien-être haut de gamme.
 */

// Courbe d'accélération douce (ease-out raffiné), réutilisée partout
export const EASE_PREMIUM: Transition["ease"] = [0.22, 1, 0.36, 1];

// Transition de page : léger fondu + montée subtile
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export const pageTransition: Transition = {
  duration: 0.32,
  ease: EASE_PREMIUM,
};

// Conteneur de liste : fait apparaître les enfants en cascade (stagger)
export const listContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

// Élément de liste : apparition en fondu + légère montée
export const listItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_PREMIUM },
  },
};

// Apparition simple d'un bloc (fondu + montée)
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_PREMIUM },
  },
};

// Effet de pression tactile sur les éléments cliquables
export const tapScale = { scale: 0.97 };
export const tapTransition: Transition = { duration: 0.12, ease: EASE_PREMIUM };
