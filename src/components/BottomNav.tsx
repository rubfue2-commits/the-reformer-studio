import { useLocation, useNavigate } from "react-router-dom";
import { Home, Play, TrendingUp, Heart, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const TABS = [
  { path: "/home",     icon: Home,       labelFr: "Accueil",   labelEn: "Home"     },
  { path: "/library",  icon: Play,       labelFr: "Séances",   labelEn: "Sessions" },
  { path: "/programs", icon: TrendingUp, labelFr: "Programmes",   labelEn: "Programs" },
  { path: "/wellness", icon: Heart,      labelFr: "Bien-être", labelEn: "Bien-être" },
  { path: "/profile",  icon: User,       labelFr: "Profil",    labelEn: "Profile"  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isIPad = window.innerWidth >= 768;

  return (
    <nav style={{
      position: "absolute",
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      backgroundColor: "rgba(245, 243, 238, 0.97)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(28, 27, 25, 0.06)",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        height: isIPad ? 64 : 52,
        width: "100%",
        maxWidth: isIPad ? 680 : 430,
        margin: "0 auto",
      }}>
        {TABS.map(({ path, icon: Icon, labelFr, labelEn }) => {
          const active = location.pathname === path ||
            (path === "/library" && location.pathname.includes("library"));

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                border: "none",
                background: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                outline: "none",
                padding: "6px 0",
                position: "relative",
                minWidth: 0,
                minHeight: isIPad ? 64 : 52,
              }}
            >
              {/* Point doré sous l'icône active */}
              {active && (
                <div style={{
                  position: "absolute",
                  bottom: 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  backgroundColor: "#B8973E",
                }} />
              )}

              <Icon
                size={isIPad ? 24 : 21}
                strokeWidth={active ? 2 : 1.4}
                style={{
                  color: active ? "#1C1B19" : "#B8B0A6",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              />

              <span style={{
                fontSize: 10,
                lineHeight: 1,
                color: active ? "#1C1B19" : "#B8B0A6",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.02em",
                transition: "color 0.2s",
                whiteSpace: "nowrap",
              }}>
                {t(labelFr, labelEn)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Safe area home indicator — fine bande en dessous */}
      <div style={{
        height: "env(safe-area-inset-bottom, 0px)",
        backgroundColor: "rgba(245, 243, 238, 0.97)",
      }} />
    </nav>
  );
}
