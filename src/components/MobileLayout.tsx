import { ReactNode } from "react";

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
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 430,
        minWidth: 320,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#F5F3EE",
      }}>
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
          scrollBehavior: "smooth",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
