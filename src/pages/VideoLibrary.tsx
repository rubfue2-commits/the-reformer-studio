import { useState } from "react";
import { Play } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import SessionReview, { SessionReviewData } from "@/components/SessionReview";
import { useLanguage } from "@/i18n/LanguageContext";

const VIDEOS = [
  { id: 1, level: "beginner",     duration: 30, titleFr: "Pilates fondamentaux",   titleEn: "Fundamental Pilates"   },
  { id: 2, level: "beginner",     duration: 45, titleFr: "Alignement et posture",   titleEn: "Alignment & Posture"   },
  { id: 3, level: "intermediate", duration: 50, titleFr: "Renforcement du centre",  titleEn: "Core Strengthening"    },
  { id: 4, level: "intermediate", duration: 40, titleFr: "Souplesse et equilibre",  titleEn: "Flexibility & Balance" },
  { id: 5, level: "advanced",     duration: 60, titleFr: "Reformer intensif",       titleEn: "Intensive Reformer"    },
  { id: 6, level: "advanced",     duration: 55, titleFr: "Fluidite avancee",        titleEn: "Advanced Flow"         },
];

const FILTERS = [
  { key: "all",          fr: "Toutes",        en: "All"          },
  { key: "beginner",     fr: "Debutant",      en: "Beginner"     },
  { key: "intermediate", fr: "Intermediaire", en: "Intermediate" },
  { key: "advanced",     fr: "Avance",        en: "Advanced"     },
];

const LEVEL_STYLE: Record<string, string> = {
  beginner:     "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced:     "bg-red-100 text-red-700",
};

export default function VideoLibrary() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [reviewVideo, setReviewVideo] = useState<typeof VIDEOS[0] | null>(null);

  const filtered = filter === "all" ? VIDEOS : VIDEOS.filter(v => v.level === filter);

  const handleReviewSubmit = (data: SessionReviewData) => {
    // TODO: save to Supabase when videos are connected
    console.log("Review submitted:", data);
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <div className="mb-5">
          <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-1">
            Connect Reformer
          </p>
          <h1 className="font-display text-3xl font-light text-foreground">
            {t("Séances", "Sessions")}
          </h1>
        </div>

        {/* Filtre chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={"flex-shrink-0 px-4 py-2 rounded-full font-body text-xs font-medium transition-all border " +
                (filter === f.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-muted-foreground")}
            >
              {t(f.fr, f.en)}
            </button>
          ))}
        </div>

        {/* Liste vidéos */}
        <div className="space-y-3 pb-6">
          {filtered.map(video => (
            <div key={video.id} className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">

              {/* Miniature */}
              <div className="w-full h-40 bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-2">
                    <Play size={18} className="text-foreground ml-1" fill="currentColor" strokeWidth={0} />
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{t("Bientot disponible", "Coming soon")}</p>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-foreground truncate">
                      {t(video.titleFr, video.titleEn)}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{video.duration} min</p>
                  </div>
                  <span className={"font-body text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 " + LEVEL_STYLE[video.level]}>
                    {video.level === "beginner"
                      ? t("Debutant", "Beginner")
                      : video.level === "intermediate"
                      ? t("Intermediaire", "Intermediate")
                      : t("Avance", "Advanced")}
                  </span>
                </div>

                {/* Bouton terminer la séance */}
                <button
                  onClick={() => setReviewVideo(video)}
                  className="w-full py-2.5 rounded-xl border border-border font-body text-xs text-muted-foreground hover:bg-muted transition-colors"
                >
                  {t("Terminer et évaluer la séance", "Complete & rate session")}
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Modal review */}
      {reviewVideo && (
        <SessionReview
          sessionTitle={t(reviewVideo.titleFr, reviewVideo.titleEn)}
          onClose={() => setReviewVideo(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      <BottomNav />
    </MobileLayout>
  );
}
