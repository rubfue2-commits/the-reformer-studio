import WelcomeModal from "@/components/WelcomeModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Flame, Clock, Trophy, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [streak, setStreak] = useState(0);
  const [weekSessions, setWeekSessions] = useState(0);
  const [monthSessions, setMonthSessions] = useState(0);
  const [monthMinutes, setMonthMinutes] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
      // Afficher le popup uniquement à la première connexion
      const key = `welcome_shown_${user.id}`;
      if (!localStorage.getItem(key)) {
        setTimeout(() => setShowWelcome(true), 800);
        localStorage.setItem(key, "true");
      }
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

      const [monthRes, weekRes, allRes] = await Promise.all([
        supabase.from("sessions").select("id, duration_minutes").eq("user_id", user!.id).gte("completed_at", startOfMonth),
        supabase.from("sessions").select("id").eq("user_id", user!.id).gte("completed_at", startOfWeek),
        supabase.from("sessions").select("completed_at").eq("user_id", user!.id).order("completed_at", { ascending: false }).limit(90),
      ]);

      const mSessions = monthRes.data || [];
      const totalMin = mSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

      // Calcul streak
      const dates = [...new Set((allRes.data || []).map(s => new Date(s.completed_at).toDateString()))];
      let s = 0;
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const diff = Math.round((today.getTime() - new Date(dates[i]).getTime()) / 86400000);
        if (diff === i || diff === i + 1) s++;
        else break;
      }

      const totalSessions = allRes.data?.length || 0;
      const lvl = Math.floor(totalSessions / 25) + 1;
      const comp = totalSessions > 0 ? Math.min(100, Math.round((mSessions.length / 20) * 100)) : 0;

      setStreak(s);
      setWeekSessions((weekRes.data || []).length);
      setMonthSessions(mSessions.length);
      setMonthMinutes(totalMin);
      setCompletion(comp);
      setLevel(lvl);
    } catch (e) {
      console.error("loadStats error:", e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Flame,  label: `${streak} jours`,    sublabel: "Streak",          color: "#B8973E" },
    { icon: Clock,  label: `${weekSessions} séances`, sublabel: "Cette semaine", color: "#8B5CF6" },
    { icon: Trophy, label: `${monthSessions}`,    sublabel: "Ce mois",         color: "#10B981" },
    { icon: Star,   label: `Niv.${level}`,        sublabel: "Niveau",          color: "#EC4899" },
  ];

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-32">

        {/* Header */}
        <div className="mb-8">
          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            {profile?.first_name ? `Bonjour, ${profile.first_name} 👋` : "Bonjour 👋"}
          </p>
          <h1 className="font-display text-3xl font-light text-foreground">Prête à bouger ?</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-card rounded-3xl p-4 border border-border shadow-sm">
              <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: s.color + "20", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <p className="font-body text-xl font-semibold text-foreground">{s.label}</p>
              <p className="font-body text-xs text-muted-foreground">{s.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Progrès du mois */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-body text-sm font-semibold text-foreground">Progrès du mois</h3>
            <button onClick={() => navigate("/wellness")} className="flex items-center gap-1 font-body text-[10px] text-gold">
              Détails <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex justify-between">
            {[
              { value: String(monthSessions),   label: "Séances" },
              { value: monthMinutes >= 60 ? Math.round(monthMinutes/60) + "h" : monthMinutes + "min", label: "Temps total" },
              { value: completion + "%",         label: "Complétion" },
              { value: `Niv.${level}`,           label: "Niveau" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="font-body text-lg font-semibold text-foreground">{item.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
          {/* Barre progression */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div style={{ width: completion + "%", height: "100%", backgroundColor: "#B8973E", borderRadius: 999, transition: "width 0.8s ease" }} />
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/library")} className="bg-foreground text-background rounded-3xl p-4 text-left">
            <p className="font-body text-sm font-semibold mb-1">Séances</p>
            <p className="font-body text-xs opacity-60">Bibliothèque complète</p>
          </button>
          <button onClick={() => navigate("/programs")} style={{ backgroundColor: "#B8973E" }} className="rounded-3xl p-4 text-left">
            <p className="font-body text-sm font-semibold text-foreground mb-1">Programmes</p>
            <p className="font-body text-xs text-foreground opacity-60">Suivre un plan</p>
          </button>
        </div>

      </div>
      <BottomNav />

      {/* Modal de bienvenue — première connexion */}
      {showWelcome && (
        <WelcomeModal
          firstName={profile?.first_name}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </MobileLayout>
  );
}
