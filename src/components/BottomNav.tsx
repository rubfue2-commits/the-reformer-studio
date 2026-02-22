import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Home, Play, Calendar, BarChart3, User } from "lucide-react";

const navItems = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/library", icon: Play, label: "Library" },
  { to: "/planner", icon: Calendar, label: "Plan" },
  { to: "/progress", icon: BarChart3, label: "Progress" },
  { to: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2 pb-6">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <RouterNavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className={isActive ? "text-foreground" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] font-body tracking-wide ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute -top-[1px] h-[2px] w-8 rounded-full bg-gold" />
              )}
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
