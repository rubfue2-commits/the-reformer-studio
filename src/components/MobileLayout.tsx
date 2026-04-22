import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MobileLayout = ({ children, showNav = true }: MobileLayoutProps) => {
  return (
    // Fond page entière — gris neutre sur desktop pour faire ressortir l'app
    <div className="min-h-screen w-full flex items-start justify-center"
      style={{ background: "#E8E4DC" }}>

      {/* Conteneur iPhone — max 390px, centré, fond app */}
      <div
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: "390px",
          minHeight: "100svh",
          background: "hsl(var(--background))",
          boxShadow: "0 0 60px rgba(0,0,0,0.15)",
        }}
      >
        <main
          className={showNav ? "flex-1 overflow-y-auto pb-24" : "flex-1 overflow-y-auto"}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MobileLayout;
