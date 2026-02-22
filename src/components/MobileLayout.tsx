import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MobileLayout = ({ children, showNav = true }: MobileLayoutProps) => {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <div className={showNav ? "pb-24" : ""}>
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
