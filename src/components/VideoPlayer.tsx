import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, ChevronLeft, Star, Clock, BarChart2, CheckCircle } from "lucide-react";

export type VideoSource = "youtube" | "vimeo";

export interface Video {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux";
  category: string;
  description: string;
  thumbnail: string;
  source: VideoSource;
  videoId: string;
  calories: number;
  equipment: string[];
  rating: number;
  reviews: number;
  featured?: boolean;
}

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

const VideoPlayer = ({ video, onClose }: VideoPlayerProps) => {
  const [liked, setLiked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const getEmbedUrl = () => {
    if (video.source === "youtube") {
      return `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`;
    }
    return `https://player.vimeo.com/video/${video.videoId}?autoplay=1&title=0&byline=0&portrait=0`;
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-black/80 backdrop-blur-sm">
        <button onClick={onClose} className="flex items-center gap-2 text-white/70">
          <ChevronLeft size={20} strokeWidth={1.5} />
          <span className="font-body text-sm">Retour</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLiked(!liked)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
          >
            <Heart
              size={16}
              strokeWidth={1.5}
              className={liked ? "fill-red-400 text-red-400" : "text-white/70"}
            />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Share2 size={16} strokeWidth={1.5} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Lecteur vidéo */}
      <div className="relative w-full bg-black" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={getEmbedUrl()}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        />
      </div>

      {/* Infos sous la vidéo */}
      <div className="flex-1 overflow-y-auto bg-background px-5 pt-5">

        {/* Titre + stats */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="font-display text-xl font-light text-foreground mb-1">{video.title}</h2>
              <p className="font-body text-sm text-muted-foreground">avec {video.instructor}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star size={13} className="text-gold" fill="#B8973E" />
              <span className="font-body text-sm font-medium text-foreground">{video.rating}</span>
              <span className="font-body text-xs text-muted-foreground">({video.reviews})</span>
            </div>
          </div>
        </div>

        {/* Métriques */}
        <div className="flex gap-3 mb-5">
          {[
            { icon: Clock, value: video.duration, label: "Durée" },
            { icon: BarChart2, value: video.level, label: "Niveau" },
            { icon: Heart, value: `${video.calories} kcal`, label: "Calories" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex-1 rounded-2xl bg-card p-3 text-center shadow-sm">
              <Icon size={14} className="text-gold mx-auto mb-1" strokeWidth={1.5} />
              <p className="font-body text-xs font-medium text-foreground leading-tight">{value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="font-display text-base font-light text-foreground mb-2">À propos</h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{video.description}</p>
        </div>

        {/* Équipement */}
        {video.equipment.length > 0 && (
          <div className="mb-5">
            <h3 className="font-display text-base font-light text-foreground mb-2">Équipement</h3>
            <div className="flex flex-wrap gap-2">
              {video.equipment.map((item) => (
                <span key={item} className="rounded-full border border-border bg-card px-3 py-1 font-body text-xs text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bouton terminé */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => { setCompleted(true); setTimeout(onClose, 800); }}
          className={`mb-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-body text-sm font-medium tracking-wide transition-all ${
            completed
              ? "bg-green-500 text-white"
              : "bg-primary text-primary-foreground"
          }`}
        >
          <CheckCircle size={16} strokeWidth={1.5} />
          {completed ? "Séance enregistrée !" : "Marquer comme terminé"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
