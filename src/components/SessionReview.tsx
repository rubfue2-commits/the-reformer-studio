import { useState } from "react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface SessionReviewProps {
  sessionTitle: string;
  onClose: () => void;
  onSubmit: (review: SessionReviewData) => void;
}

export interface SessionReviewData {
  liked: boolean | null;
  relevance: number;      // Pertinence 1-5
  difficulty: number;     // Difficulte 1-5
  explanations: number;   // Qualite des explications 1-5
  comment: string;
}

function StarRow({ label, value, onChange }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <p className="font-body text-sm text-foreground">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-transform active:scale-90"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={star <= value ? "#B8973E" : "none"}
              stroke={star <= value ? "#B8973E" : "#D1C5A0"} strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SessionReview({ sessionTitle, onClose, onSubmit }: SessionReviewProps) {
  const { t } = useLanguage();
  const [liked, setLiked] = useState<boolean | null>(null);
  const [relevance, setRelevance] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [explanations, setExplanations] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = liked !== null && relevance > 0 && difficulty > 0 && explanations > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ liked, relevance, difficulty, explanations, comment });
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="bg-background rounded-t-3xl w-full max-w-md pb-8 overflow-y-auto"
        style={{ maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          /* Confirmation */
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <p className="font-display text-xl text-foreground mb-1">{t("Merci !", "Thank you!")}</p>
            <p className="font-body text-sm text-muted-foreground text-center">
              {t("Votre avis nous aide à améliorer les séances.", "Your feedback helps us improve sessions.")}
            </p>
          </div>
        ) : (
          <>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-4 pb-5">
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t("Fin de séance", "Session complete")}
                </p>
                <h2 className="font-display text-xl text-foreground">{sessionTitle}</h2>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center ml-3 flex-shrink-0">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>

            <div className="px-6 space-y-5">

              {/* Liked / Pas aimé */}
              <div>
                <p className="font-body text-sm font-semibold text-foreground mb-3">
                  {t("Avez-vous aimé cette séance ?", "Did you enjoy this session?")}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLiked(true)}
                    className={"flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all " +
                      (liked === true
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-border bg-card text-muted-foreground")}
                  >
                    <ThumbsUp size={20} />
                    <span className="font-body text-sm font-medium">{t("Aimé", "Liked")}</span>
                  </button>
                  <button
                    onClick={() => setLiked(false)}
                    className={"flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all " +
                      (liked === false
                        ? "border-red-400 bg-red-50 text-red-600"
                        : "border-border bg-card text-muted-foreground")}
                  >
                    <ThumbsDown size={20} />
                    <span className="font-body text-sm font-medium">{t("Pas aimé", "Didn't like")}</span>
                  </button>
                </div>
              </div>

              {/* Notes par critère */}
              <div className="bg-card border border-border rounded-2xl px-4">
                <p className="font-body text-xs text-muted-foreground uppercase tracking-widest pt-4 pb-2">
                  {t("Évaluez la séance", "Rate the session")}
                </p>
                <StarRow
                  label={t("Pertinence", "Relevance")}
                  value={relevance}
                  onChange={setRelevance}
                />
                <StarRow
                  label={t("Difficulté", "Difficulty")}
                  value={difficulty}
                  onChange={setDifficulty}
                />
                <StarRow
                  label={t("Qualité des explications", "Explanation quality")}
                  value={explanations}
                  onChange={setExplanations}
                />
              </div>

              {/* Commentaire libre */}
              <div>
                <p className="font-body text-sm font-semibold text-foreground mb-2">
                  {t("Un commentaire ? (optionnel)", "A comment? (optional)")}
                </p>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t("Ce que vous avez aimé, ce qui pourrait être amélioré...", "What you liked, what could improve...")}
                  rows={3}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-primary"
                />
              </div>

              {/* Bouton */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={"w-full py-4 rounded-2xl font-body font-semibold text-sm transition-all " +
                  (canSubmit
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground cursor-not-allowed")}
              >
                {t("Envoyer mon avis", "Submit my review")}
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
