import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import SessionReview, { SessionReviewData } from "@/components/SessionReview";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/lib/supabase";

// Vidéos de démonstration — affichées si la table workouts est vide
const DEMO_VIDEOS = [
  { id: 1, level: "beginner",     duration_minutes: 30, title: "Pilates fondamentaux",   title_en: "Fundamental Pilates",   video_url: null },
  { id: 2, level: "beginner",     duration_minutes: 45, title: "Alignement et posture",   title_en: "Alignment & Posture",   video_url: null },
  { id: 3, level: "intermediate", duration_minutes: 50, title: "Renforcement du centre",  title_en: "Core Strengthening",    video_url: null },
  { id: 4, level: "intermediate", duration_minutes: 40, title: "Souplesse et équilibre",  title_en: "Flexibility & Balance", video_url: null },
  { id: 5, level: "advanced",     duration_minutes: 60, title: "Reformer intensif",       title_en: "Intensive Reformer",    video_url: null },
  { id: 6, level: "advanced",     duration_minutes: 55, title: "Fluidité avancée",        title_en: "Advanced Flow",         video_url: null },
];

const FILTERS = [
  { key: "all",          fr: "Toutes",        en: "All"          },
  { key: "beginner",     fr: "Débutant",      en: "Beginner"     },
  { key: "intermediate", fr: "Intermédiaire", en: "Intermediate" },
  { key: "advanced",     fr: "Avancé",        en: "Advanced"     },
];

const LEVEL_STYLE: Record<string, string> = {
  beginner:     "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced:     "bg-red-100 text-red-700",
};

const LEVEL_LABEL = (level: string, t: (fr: string, en: string) => string) =>
  level === "beginner" ? t("Débutant","Beginner") :
  level === "intermediate" ? t("Intermédiaire","Intermediate") :
  t("Avancé","Advanced");

export default function VideoLibrary() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [reviewVideo, setReviewVideo] = useState<any | null>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les vrais workouts depuis Supabase
  useEffect(() => {
    supabase
      .from('workouts')
      .select('id, title, title_en, level, duration_minutes, video_url, thumbnail_url, description')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        // Si la table est vide, utiliser les démos
        setWorkouts(data && data.length > 0 ? data : DEMO_VIDEOS as any[]);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "all" ? workouts : workouts.filter(v => v.level === filter);

  const handleReviewSubmit = (data: SessionReviewData) => {
    // TODO: sauvegarder dans Supabase quand les vidéos sont connectées
    console.log("Review submitted:", data);
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        <div className="mb-5">
          <p className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-1">
            Connect Reformer
          </p>
          <h1 className="font-display text-3xl font-light text-foreground">
            {t("Séances", "Sessions")}
          </h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={"flex-shrink-0 px-4 py-2 rounded-full font-body text-xs font-medium transition-all border " +
                (filter === f.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-muted-foreground")}>
              {t(f.fr, f.en)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {filtered.map(video => (
              <div key={video.id} className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">

                {/* Miniature ou vraie vidéo */}
                <div className="w-full h-40 bg-muted flex items-center justify-center overflow-hidden">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title}
                      className="w-full h-full object-cover" />
                  ) : video.video_url ? (
                    <video src={video.video_url} className="w-full h-full object-cover"
                      controls={false} preload="metadata" />
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-2">
                        <Play size={18} className="text-foreground ml-1" fill="currentColor" strokeWidth={0} />
                      </div>
                      <p className="font-body text-xs text-muted-foreground">{t("Bientôt disponible","Coming soon")}</p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-foreground truncate">
                        {t(video.title, video.title_en ?? video.title)}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{video.duration_minutes} min</p>
                    </div>
                    <span className={"font-body text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 " + LEVEL_STYLE[video.level]}>
                      {LEVEL_LABEL(video.level, t)}
                    </span>
                  </div>

                  <button onClick={() => setReviewVideo(video)}
                    className="w-full py-2.5 rounded-xl border border-border font-body text-xs text-muted-foreground hover:bg-muted transition-colors">
                    {t("Terminer et évaluer la séance","Complete & rate session")}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {reviewVideo && (
        <SessionReview
          sessionTitle={t(reviewVideo.title, reviewVideo.title_en ?? reviewVideo.title)}
          onClose={() => setReviewVideo(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      <BottomNav />
    </MobileLayout>
  );
}
