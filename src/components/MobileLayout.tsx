import { ReactNode } from "react";

/**
 * MobileLayout — conteneur principal pour toutes les pages.
 * - Centré horizontalement, max 390px
 * - Prend toute la hauteur de l'écran iPhone (safe area incluse)
 * - Scroll fluide avec les doigts sur iOS
 * - Fond crème cohérent
 */
export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#F5F3EE",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 430,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#F5F3EE",
        }}
      >
        {/* Zone scrollable — toute la page sauf le footer */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch" as any,
            paddingTop: "env(safe-area-inset-top)",
            // Espace pour le footer fixe (68px + safe area bottom)
            paddingBottom: "calc(68px + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
