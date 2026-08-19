import { useMemo } from 'react';
import { useWellness } from '@/hooks/useWellness';
import { useSessions } from '@/hooks/useSessions';

export interface DayScore {
  score: number | null;       // null = pas de journal aujourd'hui
  hasJournal: boolean;        // journal rempli aujourd'hui
  wellnessScore: number;      // 0-60
  activityScore: number;      // 0-40
  label: string;
  advice: string;
  color: string;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function useScore(isDemo = false): DayScore {
  const { entries } = useWellness();
  const { stats, sessions } = useSessions();

  return useMemo(() => {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    // --- Données démo ---
    if (isDemo) {
      return {
        score: 82, hasJournal: true,
        wellnessScore: 48, activityScore: 34,
        label: "Optimal",
        advice: "Ton corps est prêt. C'est le bon moment pour une séance intense.",
        color: "#22C55E",
      };
    }

    // --- Journal du jour ---
    const todayEntry = entries.find(e => e.entry_date === today);
    const hasJournal = !!todayEntry;

    if (!hasJournal) {
      return {
        score: null, hasJournal: false,
        wellnessScore: 0, activityScore: 0,
        label: "", advice: "", color: "#B8973E",
      };
    }

    // --- Score bien-être (60 pts max) ---
    // Chaque critère sur 5 → 12 pts max
    const stressInverted = 6 - todayEntry.stress; // 5=zen → 5pts, 1=stressé → 1pt
    const wellnessRaw = todayEntry.energy + todayEntry.mood + todayEntry.body + todayEntry.sleep + stressInverted;
    // wellnessRaw entre 5 et 25 → on ramène sur 60
    const wellnessScore = Math.round(((wellnessRaw - 5) / 20) * 60);

    // --- Score activité (40 pts max) ---
    const sessionsList = sessions || [];
    const didToday     = sessionsList.some((s: any) => s.completed_at?.startsWith(today));
    const didYesterday = sessionsList.some((s: any) => s.completed_at?.startsWith(yesterday));
    const streakBonus  = stats.currentStreakDays >= 3 ? 5 : 0;

    let activityScore = 0;
    if (didToday) activityScore = 40;
    else if (didYesterday) activityScore = 20;
    activityScore = Math.min(activityScore + streakBonus, 40);

    const score = Math.min(Math.round(wellnessScore + activityScore), 100);

    // --- Label et couleur ---
    let label = "", advice = "", color = "#EF4444";
    if (score >= 80) {
      label = "Optimal"; color = "#22C55E";
      advice = "Ton corps est prêt. C'est le bon moment pour une séance intense.";
    } else if (score >= 60) {
      label = "Bon"; color = "#B8973E";
      advice = "Bonne forme générale. Une séance modérée sera idéale aujourd'hui.";
    } else if (score >= 40) {
      label = "Correct"; color = "#B8973E";
      advice = "Journée correcte. Écoute ton corps avant de choisir ta séance.";
    } else {
      label = "Repos"; color = "#EF4444";
      advice = "Prends soin de toi aujourd'hui. Une séance douce ou du repos s'impose.";
    }

    return { score, hasJournal, wellnessScore, activityScore, label, advice, color };
  }, [entries, sessions, stats, isDemo]);
}
