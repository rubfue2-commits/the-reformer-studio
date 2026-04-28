import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Lock, Clock, Flame, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useVideos } from "@/hooks/useVideos";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

// ── Config visuelle par programme ─────────────────────────────
const PROGRAM_STYLE: Record<string, { emoji: string; bg: string; accent: string; tag: string }> = {
  "mobility-on":  { emoji: "🌊", bg: "#F0EDE8", accent: "#B8973E", tag: "Souplesse" },
  "full-body-on": { emoji: "⚡", bg: "#1C1B19", accent: "#B8973E", tag: "Complet" },
  "strong-on":    { emoji: "💪", bg: "#1C1B19", accent: "#B8973E", tag: "Force" },
  "fire-on":      { emoji: "🔥", bg: "#1C1B19", accent: "#EF4444", tag: "Cardio" },
  "pulse-on":     { emoji: "💫", bg: "#1C1B19", accent: "#B8973E", tag: "Tonification" },
  "stretch-on":   { emoji: "🧘", bg: "#F0EDE8", accent: "#B8973E", tag: "Détente" },
  "abs-on":       { emoji: "🎯", bg: "#1C1B19", accent: "#B8973E", tag: "Abdos" },
  "booty-on":     { emoji: "✨", bg: "#1C1B19", accent: "#B8973E", tag: "Bas du corps" },
  "arms-on":      { emoji: "🏋️", bg: "#1C1B19", accent: "#B8973E", tag: "Haut du corps" },
};

const DIFFICULTY_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  beginner:     { label: "Débutant",      color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  intermediate: { label: "Intermédiaire", color: "#B8973E", bg: "rgba(184,151,62,0.1)" },
  advanced:     { label: "Avancé",        color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

const FILTERS = ["Tous", "Mobilite", "Full Body", "Force", "Cardio", "Tonification", "Etirements", "Abdos", "Bas du corps", "Haut du corps"];

export default function VideoLibrary() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { videos, loading } = useVideos();
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const filtered = activeFilter === "Tous" ? videos : videos.filter(v => v.theme === activeFilter);

  if (loading) {
    return (
      <MobileLayout>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 13, color: "#8B8578" }}>Chargement des programmes...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="pt-12 pb-4">

        {/* Header */}
        <div className="px-5 mb-5">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Connect Reformer</p>
          <h1 className="font-display text-3xl font-light text-foreground">Programmes</h1>
        </div>

        {/* Filtres horizontaux */}
        <div style={{ overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          <div style={{ display: "flex", gap: 8, padding: "0 20px", width: "max-content" }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: activeFilter === f ? 600 : 400, whiteSpace: "nowrap", transition: "all 0.2s",
                  backgroundColor: activeFilter === f ? "#1C1B19" : "#F0EDE8",
                  color: activeFilter === f ? "#FDFAF7" : "#6B6560",
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grille des programmes */}
        <div style={{ padding: "16px 20px 80px", display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🎬</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1B19", marginBottom: 4 }}>Vidéos à venir</p>
              <p style={{ fontSize: 13, color: "#8B8578", lineHeight: 1.5 }}>Les vidéos de ce programme arrivent très bientôt !</p>
            </div>
          ) : filtered.map((video, i) => {
            const slug = video.video_path?.split('/')[0] || '';
            const style = PROGRAM_STYLE[video.id] || PROGRAM_STYLE["full-body-on"];
            const diff = DIFFICULTY_LABEL[video.level] || DIFFICULTY_LABEL.intermediate;
            const isLocked = !video.is_free && !video.video_url;
            const isDark = style.bg === "#1C1B19";

            return (
              <motion.div key={video.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !isLocked && setSelectedVideo(video.id)}
                style={{ borderRadius: 20, overflow: "hidden", cursor: isLocked ? "default" : "pointer", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>

                {/* Card */}
                <div style={{ backgroundColor: style.bg, padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Emoji icône */}
                      <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(28,27,25,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                        {style.emoji}
                      </div>
                      <div>
                        {/* Tag catégorie */}
                        <div style={{ display: "inline-flex", padding: "3px 8px", borderRadius: 6, backgroundColor: isDark ? "rgba(184,151,62,0.2)" : "rgba(184,151,62,0.12)", marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: style.accent, letterSpacing: "0.06em" }}>{style.tag.toUpperCase()}</span>
                        </div>
                        {/* Titre */}
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: isDark ? "#FDFAF7" : "#1C1B19", margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>
                          {video.title}
                        </h3>
                      </div>
                    </div>

                    {/* Bouton play / lock */}
                    <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: isLocked ? "rgba(255,255,255,0.1)" : style.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isLocked
                        ? <Lock size={16} color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)"} />
                        : <Play size={16} color="#1C1B19" fill="#1C1B19" />
                      }
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.55)" : "#6B6560", margin: "0 0 14px", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {video.description}
                  </p>

                  {/* Infos bas */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} color={isDark ? "rgba(255,255,255,0.4)" : "#8B8578"} />
                      <span style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.4)" : "#8B8578" }}>{video.duration_minutes} min</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Flame size={12} color={isDark ? "rgba(255,255,255,0.4)" : "#8B8578"} />
                      <span style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.4)" : "#8B8578" }}>~{(video as any).estimated_calories || "—"} cal</span>
                    </div>
                    {/* Badge difficulté */}
                    <div style={{ marginLeft: "auto", padding: "3px 8px", borderRadius: 6, backgroundColor: diff.bg }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: diff.color }}>{diff.label}</span>
                    </div>
                  </div>
                </div>

                {/* Barre dorée en bas si disponible */}
                {!isLocked && (
                  <div style={{ height: 3, backgroundColor: style.accent }} />
                )}
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Modal vidéo (placeholder — à connecter au player) */}
      {selectedVideo && (
        <div onClick={() => setSelectedVideo(null)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#1C1B19", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Lecteur vidéo</p>
            <p style={{ fontSize: 15, color: "white", fontWeight: 600, marginBottom: 20 }}>
              {videos.find(v => v.id === selectedVideo)?.title}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Uploader la vidéo dans Supabase Storage pour l'activer.
            </p>
            <button onClick={() => setSelectedVideo(null)}
              style={{ padding: "12px 24px", backgroundColor: "#B8973E", color: "#1C1B19", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <BottomNav />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </MobileLayout>
  );
}
