import { ReactNode } from "react";

/**
 * MobileLayout — s'adapte à tous les iPhones automatiquement.
 * iPhone SE 375px → iPhone 16 Pro Max 430px
 * Gère : safe area, scroll tactile, footer fixe
 */
export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      justifyContent: "center",
      backgroundColor: "#F5F3EE",
      overflow: "hidden",
    }}>
      {/* Conteneur centré — s'adapte à la largeur de l'iPhone */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 430,          /* iPhone 16 Pro Max max */
        minWidth: 320,          /* iPhone SE min */
        height: "100%",
        height: "100dvh",       /* Dynamic viewport height */
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#F5F3EE",
      }}>
        {/* Zone scrollable — s'adapte à la hauteur disponible */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          /* Commence sous la notch */
          paddingTop: "var(--safe-top, env(safe-area-inset-top, 0px))",
          /* Espace pour le footer (nav + safe area bas) */
          paddingBottom: "var(--footer-height, calc(60px + env(safe-area-inset-bottom, 0px)))",
          /* Scroll snappy sur iOS */
          scrollBehavior: "smooth",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
