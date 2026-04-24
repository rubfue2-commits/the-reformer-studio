import { useLocation, useNavigate } from "react-router-dom";
import { Home, Play, TrendingUp, Heart, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const TABS = [
  { path: "/home",     icon: Home,       labelFr: "Accueil",   labelEn: "Home"     },
  { path: "/library",  icon: Play,       labelFr: "Séances",   labelEn: "Sessions" },
  { path: "/progress", icon: TrendingUp, labelFr: "Progrès",   labelEn: "Progress" },
  { path: "/wellness", icon: Heart,      labelFr: "Bien-être", labelEn: "Wellness" },
  { path: "/profile",  icon: User,       labelFr: "Profil",    labelEn: "Profile"  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: "rgba(245, 243, 238, 0.96)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(28, 27, 25, 0.07)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{
        display: "flex", alignItems: "stretch", justifyContent: "space-around",
        height: 60, width: "100%", maxWidth: 430, margin: "0 auto",
      }}>
        {TABS.map(({ path, icon: Icon, labelFr, labelEn }) => {
          const active = location.pathname === path ||
            (path === "/library" && location.pathname.includes("library"));
          return (
            <button key={path} onClick={() => navigate(path)} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              border: "none", background: "none", cursor: "pointer",
              WebkitTapHighlightColor: "transparent", outline: "none",
              padding: "8px 0 4px", position: "relative", minWidth: 0,
            }}>
              {active && <div style={{
                position: "absolute", top: 0, left: "50%",
                transform: "translateX(-50%)",
                width: 24, height: 2.5, borderRadius: 2, backgroundColor: "#B8973E",
              }} />}
              <Icon size={22} strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? "#B8973E" : "#9CA3AF", transition: "color 0.2s", flexShrink: 0 }} />
              <span style={{
                fontSize: 10, lineHeight: 1,
                color: active ? "#B8973E" : "#9CA3AF",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.01em", transition: "color 0.2s", whiteSpace: "nowrap",
              }}>{t(labelFr, labelEn)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
