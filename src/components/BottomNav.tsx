import { useLocation, useNavigate } from "react-router-dom";
import { Home, Play, TrendingUp, Heart, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const TABS = [
  { path: "/home",    icon: Home,        labelFr: "Accueil",  labelEn: "Home"     },
  { path: "/library", icon: Play,        labelFr: "Séances",  labelEn: "Sessions" },
  { path: "/progress",icon: TrendingUp,  labelFr: "Progrès",  labelEn: "Progress" },
  { path: "/wellness",icon: Heart,       labelFr: "Bien-être",labelEn: "Wellness"  },
  { path: "/profile", icon: User,        labelFr: "Profil",   labelEn: "Profile"  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "rgba(245,243,238,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          height: 60,
          maxWidth: 430,
          margin: "0 auto",
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
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
                padding: "6px 0",
                border: "none",
                background: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                outline: "none",
                minHeight: 48,
              }}
            >
              {/* Barre active en haut */}
              <div style={{
                position: "absolute",
                top: 0,
                width: active ? 24 : 0,
                height: 2,
                borderRadius: 2,
                backgroundColor: "#B8973E",
                transition: "width 0.25s ease",
              }} />

              <Icon
                size={22}
                strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? "#B8973E" : "#9CA3AF", transition: "color 0.2s" }}
              />
              <span style={{
                fontSize: 10,
                fontFamily: "inherit",
                color: active ? "#B8973E" : "#9CA3AF",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.02em",
                transition: "color 0.2s",
              }}>
                {t(labelFr, labelEn)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
