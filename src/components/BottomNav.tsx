import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Home, Play, Calendar, BarChart3, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { to: "/home", icon: Home, label: t.nav.home },
    { to: "/library", icon: Play, label: t.nav.library },
    { to: "/planner", icon: Calendar, label: t.nav.plan },
    { to: "/progress", icon: BarChart3, label: t.nav.progress },
    { to: "/profile", icon: User, label: t.nav.profile },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2 pb-6">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <RouterNavLink key={to} to={to} className="relative flex flex-col items-center gap-1 px-3 py-1">
              <Icon size={20} strokeWidth={1.5} className={isActive ? "text-foreground" : "text-muted-foreground"} />
              <span className={`text-[10px] font-body tracking-wide ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {isActive && <div className="absolute -top-[1px] h-[2px] w-8 rounded-full bg-gold" />}
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
