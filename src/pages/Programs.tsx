import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { Play, ChevronRight, CheckCircle, Circle, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

interface Program {
  id: string; slug: string; name_fr: string; description_fr: string;
  duration_weeks: number; level: string; order_index: number; is_published: boolean;
}
interface UserProgress { program_id: string; completed_sessions: number; is_completed: boolean; }

const LEVEL_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  beginner:     { label_fr: "Débutant", label_en: "Beginner", color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
  intermediate: { label_fr: "Intermédiaire", label_en: "Intermediate", color: "#B8973E", bg: "rgba(184,151,62,0.08)" },
  advanced:     { label_fr: "Avancé", label_en: "Advanced", color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
};

export default function Programs() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [programSessions, setProgramSessions] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPrograms(); }, []);

  const loadPrograms = async () => {
    setLoading(true);
    const { data } = await supabase.from("programs").select("*").eq("is_published", true).order("order_index");
    setPrograms(data || []);
    if (user && data?.length) {
      const { data: progress } = await supabase.from("user_program_progress").select("*").eq("user_id", user.id);
      if (progress) { const map: Record<string, UserProgress> = {}; progress.forEach(p => { map[p.program_id] = p; }); setUserProgress(map); }
    }
    setLoading(false);
  };


  const loadProgramSessions = async (programId: string) => {
    if (programSessions[programId]) {
      setExpandedId(expandedId === programId ? null : programId);
      return;
    }
    const { data } = await supabase
      .from("program_sessions")
      .select("*, workouts(name_fr, duration_minutes, difficulty)")
      .eq("program_id", programId)
      .order("order_index", { ascending: true });
    setProgramSessions(prev => ({ ...prev, [programId]: data || [] }));
    setExpandedId(programId);
  };
  const startProgram = async (programId: string) => {
    if (!user) return;
    await supabase.from("user_program_progress").upsert({ user_id: user.id, program_id: programId, started_at: new Date().toISOString() }, { onConflict: "user_id,program_id" });
    setUserProgress(prev => ({ ...prev, [programId]: { program_id: programId, completed_sessions: 0, is_completed: false } }));
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-28">
        <div className="mb-6">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">{t("Connect Reformer", "Connect Reformer")}</p>
          <h1 className="font-display text-3xl font-light text-foreground">{t("Programmes", "Programs")}</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">{t("Des parcours complets pour progresser", "Complete courses to progress")}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : programs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(184,151,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1B19", marginBottom: 6 }}>{t("Programmes à venir", "Upcoming programs")}</p>
            <p style={{ fontSize: 13, color: "#8B8578", lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>
              Tes premiers programmes seront disponibles dès que les séances vidéo seront prêtes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {programs.map((program, i) => {
              const lvl = LEVEL_STYLE[program.level] || LEVEL_STYLE.beginner;
              const progress = userProgress[program.id];
              const isStarted = !!progress;

              return (
                <motion.div key={program.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm">
                  <div style={{ height: 3, background: "linear-gradient(90deg, #B8973E, #D4B56A)" }} />
                  <div className="p-5">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <h3 className="font-display text-xl font-light text-foreground">{program.name_fr}</h3>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, backgroundColor: lvl.bg, color: lvl.color, flexShrink: 0, marginLeft: 8 }}>
                        {t(lvl.label_fr, lvl.label_en)}
                      </span>
                    </div>
                    {program.description_fr && (
                      <p className="font-body text-xs text-muted-foreground leading-relaxed mb-3">{program.description_fr}</p>
                    )}
                    <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                      <span style={{ fontSize: 12, color: "#8B8578" }}>📅 {program.duration_weeks} semaines</span>
                    </div>

                    {/* Barre de progression si démarré */}
                    {isStarted && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ height: 4, backgroundColor: "rgba(28,27,25,0.06)", borderRadius: 2, marginBottom: 6 }}>
                          <div style={{ height: "100%", backgroundColor: "#B8973E", borderRadius: 2, width: `${Math.min(100, ((progress.completed_sessions || 0) / (program.duration_weeks * 3)) * 100)}%`, transition: "width 0.4s" }} />
                        </div>
                        <p style={{ fontSize: 11, color: "#8B8578" }}>{progress.completed_sessions || 0} séances complétées</p>
                      </div>
                    )}

                    {/* Bouton voir séances */}
                    <button onClick={() => loadProgramSessions(program.id)}
                      style={{ width: "100%", padding: "10px", border: "1px solid rgba(28,27,25,0.1)", borderRadius: 10, backgroundColor: "transparent", fontSize: 13, color: "#6B6560", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                      <span>{expandedId === program.id ? "▲" : "▼"}</span>
                      {expandedId === program.id ? "Masquer les séances" : "Voir les séances"}
                    </button>

                    {/* Liste des séances */}
                    {expandedId === program.id && programSessions[program.id] && (
                      <div style={{ backgroundColor: "rgba(28,27,25,0.03)", borderRadius: 12, padding: "8px 12px", marginBottom: 8 }}>
                        {programSessions[program.id].length === 0 ? (
                          <p style={{ fontSize: 12, color: "#8B8578", textAlign: "center", padding: "8px 0" }}>{t("Séances à venir", "Upcoming sessions")}</p>
                        ) : (
                          programSessions[program.id].map((ps, i) => (
                            <div key={ps.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < programSessions[program.id].length - 1 ? "1px solid rgba(28,27,25,0.05)" : "none" }}>
                              <span style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "#B8973E22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#B8973E", flexShrink: 0 }}>{i+1}</span>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "#1C1B19", margin: 0 }}>{ps.workouts?.name_fr || "Séance"}</p>
                                <p style={{ fontSize: 11, color: "#8B8578", margin: 0 }}>{ps.workouts?.duration_minutes || 0} min · Sem. {ps.week_number}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <button onClick={() => !isStarted && startProgram(program.id)}
                      style={{ width: "100%", padding: "12px", border: isStarted ? "1px solid rgba(28,27,25,0.1)" : "none", borderRadius: 12, backgroundColor: isStarted ? "transparent" : "#1C1B19", color: isStarted ? "#1C1B19" : "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {isStarted ? <><CheckCircle size={14} color="#B8973E" /> Continuer le programme</> : <><Play size={14} fill="white" /> Démarrer ce programme</>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </MobileLayout>
  );
}
