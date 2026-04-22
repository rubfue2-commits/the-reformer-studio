import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MobileLayout = ({ children, showNav = true }: MobileLayoutProps) => {
  return (
    <div
      className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden"
      style={{ background: "hsl(var(--background))" }}
    >
      <main className={showNav ? "flex-1 overflow-y-auto pb-24" : "flex-1 overflow-y-auto"}>
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;
