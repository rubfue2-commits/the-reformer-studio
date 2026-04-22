import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const VIDEOS = [
  { id: 1, level: "beginner",     duration: 30, titleFr: "Pilates fondamentaux",      titleEn: "Fundamental Pilates"    },
  { id: 2, level: "beginner",     duration: 45, titleFr: "Alignement et posture",      titleEn: "Alignment & Posture"    },
  { id: 3, level: "intermediate", duration: 50, titleFr: "Renforcement du centre",     titleEn: "Core Strengthening"     },
  { id: 4, level: "intermediate", duration: 40, titleFr: "Souplesse et equilibre",     titleEn: "Flexibility & Balance"  },
  { id: 5, level: "advanced",     duration: 60, titleFr: "Reformer intensif",          titleEn: "Intensive Reformer"     },
  { id: 6, level: "advanced",     duration: 55, titleFr: "Fluidite avancee",           titleEn: "Advanced Flow"          },
];

const FILTERS = [
  { key: "all",          fr: "Toutes",         en: "All"          },
  { key: "beginner",     fr: "Debutant",       en: "Beginner"     },
  { key: "intermediate", fr: "Intermediaire",  en: "Intermediate" },
  { key: "advanced",     fr: "Avance",         en: "Advanced"     },
];

const LEVEL_COLOR: Record<string, string> = {
  beginner:     "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced:     "bg-red-100 text-red-700",
};

export default function VideoLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? VIDEOS : VIDEOS.filter(v => v.level === filter);

  const NAV = [
    { path: "/home",     labelFr: "Accueil",  labelEn: "Home"     },
    { path: "/library",  labelFr: "Seances",  labelEn: "Sessions" },
    { path: "/progress", labelFr: "Progres",  labelEn: "Progress" },
    { path: "/profile",  labelFr: "Profil",   labelEn: "Profile"  },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto px-4">

          {/* Header */}
          <div className="pt-12 pb-5">
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">Connect Reformer</p>
            <h1 className="font-display text-3xl text-foreground">{t("Seances", "Sessions")}</h1>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={"flex-shrink-0 px-4 py-2 rounded-full font-body text-sm font-medium transition-all " +
                  (filter === f.key
                    ? "bg-foreground text-background"
                    : "bg-card border border-border text-muted-foreground")}
              >
                {t(f.fr, f.en)}
              </button>
            ))}
          </div>

          {/* Video list */}
          <div className="space-y-3">
            {filtered.map(video => (
              <div key={video.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                {/* Thumbnail placeholder */}
                <div className="w-full h-44 bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-foreground ml-1">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{t("Bientot disponible", "Coming soon")}</p>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-foreground truncate">
                      {t(video.titleFr, video.titleEn)}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{video.duration} min</p>
                  </div>
                  <span className={"font-body text-xs font-medium px-3 py-1 rounded-full ml-3 " + LEVEL_COLOR[video.level]}>
                    {video.level === "beginner"     ? t("Debutant", "Beginner")     :
                     video.level === "intermediate" ? t("Intermediaire", "Intermediate") :
                                                     t("Avance", "Advanced")}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-pb">
        <div className="max-w-md mx-auto flex justify-around px-2 py-2">
          {NAV.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={"flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors " +
                  (active ? "text-foreground" : "text-muted-foreground")}
              >
                <span className={"w-1.5 h-1.5 rounded-full mb-0.5 " + (active ? "bg-primary" : "bg-transparent")} />
                <span className="font-body text-[10px] uppercase tracking-wide">{t(item.labelFr, item.labelEn)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
