import { useState } from "react";
import { Play, Lock, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

interface Program {
  id: string;
  slug: string;
  name_fr: string;
  description_fr: string;
  duration_minutes: number;
  difficulty: string;
  category: string;
  estimated_calories: number;
  is_free: boolean;
  is_premium: boolean;
  video_path: string | null;
  thumbnail_path: string | null;
  order_index: number;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     "Débutant",
  intermediate: "Intermédiaire",
  advanced:     "Avancé",
};

const CATEGORY_FILTERS = ["Tous", "Mobilite", "Full Body", "Force", "Cardio", "Tonification", "Etirements", "Abdos", "Bas du corps", "Haut du corps"];

const PROGRAM_CONFIG: Record<string, { emoji: string; color: string }> = {
  "mobility":  { emoji: "🌊", color: "#4A9B8E" },
  "full-body": { emoji: "⚡", color: "#B8973E" },
  "strong":    { emoji: "💪", color: "#8B6914" },
  "fire":      { emoji: "🔥", color: "#C4472A" },
  "pulse":     { emoji: "💫", color: "#7B5EA7" },
  "stretch":   { emoji: "🧘", color: "#4A9B8E" },
  "abs":       { emoji: "🎯", color: "#C4472A" },
  "booty":     { emoji: "✨", color: "#B8973E" },
  "arms":      { emoji: "💪", color: "#8B6914" },
};

export default function VideoLibrary() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Tous");

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("workouts")
      .select("*")
      .order("order_index", { ascending: true });
    setPrograms(data || []);
    setLoading(false);
  };

  const filtered = activeFilter === "Tous"
    ? programs
    : programs.filter(p => p.category === activeFilter || p.theme === activeFilter);

  const isLocked = (p: Program) => !p.is_free;

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-28">

        {/* Header */}
        <div className="mb-6">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Connect Reformer</p>
          <h1 className="font-display text-3xl font-light text-foreground leading-tight">Programmes</h1>
        </div>

        {/* Filtres */}
        <div className="mb-5 -mx-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 px-5" style={{ width: "max-content" }}>
            {CATEGORY_FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className="font-body text-xs font-medium px-4 py-1.5 rounded-full transition-all whitespace-nowrap"
                style={{
                  backgroundColor: activeFilter === f ? "#1C1B19" : "rgba(28,27,25,0.07)",
                  color: activeFilter === f ? "#FDFAF7" : "#6B6560",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(program => {
              const config = PROGRAM_CONFIG[program.slug] || { emoji: "▶", color: "#B8973E" };
              const locked = isLocked(program);
              const diff = DIFFICULTY_LABEL[program.difficulty] || program.difficulty;

              return (
                <div key={program.id}
                  className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm"
                  style={{ opacity: locked ? 0.92 : 1 }}>

                  {/* Bande couleur top */}
                  <div style={{ height: 3, backgroundColor: locked ? "rgba(28,27,25,0.08)" : config.color }} />

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Emoji + infos */}
                      <div className="flex items-center justify-center rounded-2xl flex-shrink-0"
                        style={{ width: 52, height: 52, backgroundColor: locked ? "rgba(28,27,25,0.05)" : config.color + "18", fontSize: 24 }}>
                        {config.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h3 className="font-display text-lg font-light text-foreground tracking-tight leading-none">
                            {program.name_fr}
                          </h3>
                          {/* Bouton play / lock */}
                          <div className="flex items-center justify-center rounded-full flex-shrink-0"
                            style={{ width: 36, height: 36, backgroundColor: locked ? "rgba(28,27,25,0.06)" : config.color }}>
                            {locked
                              ? <Lock size={14} className="text-muted-foreground" />
                              : <Play size={14} color="white" fill="white" />
                            }
                          </div>
                        </div>

                        {/* Description */}
                        <p className="font-body text-xs text-muted-foreground leading-relaxed mb-2"
                          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {program.description_fr}
                        </p>

                        {/* Méta */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="text-muted-foreground" />
                            <span className="font-body text-[11px] text-muted-foreground">{program.duration_minutes} min</span>
                          </div>
                          {program.estimated_calories && (
                            <span className="font-body text-[11px] text-muted-foreground">~{program.estimated_calories} kcal</span>
                          )}
                          <span className="font-body text-[11px] px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: program.difficulty === "beginner" ? "rgba(22,163,74,0.1)" : program.difficulty === "advanced" ? "rgba(239,68,68,0.1)" : "rgba(184,151,62,0.1)",
                              color: program.difficulty === "beginner" ? "#16A34A" : program.difficulty === "advanced" ? "#EF4444" : "#B8973E",
                              fontWeight: 600,
                            }}>
                            {diff}
                          </span>
                          {program.is_free && (
                            <span className="font-body text-[11px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: "rgba(184,151,62,0.12)", color: "#B8973E" }}>
                              Gratuit
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      <BottomNav />
    </MobileLayout>
  );
}
