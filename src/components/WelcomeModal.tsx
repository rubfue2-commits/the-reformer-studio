import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Calendar, Heart, ChevronRight } from "lucide-react";
import AppIcon, { type IconName } from "@/components/AppIcon";

interface WelcomeModalProps {
  firstName?: string;
  onClose: () => void;
}

const STEPS = [
  {
    icon: "confetti" as IconName,
    title: "Bienvenue sur Connect Reformer !",
    description: "Votre espace Pilates personnel est prêt. Découvrez une expérience unique depuis chez vous.",
    color: "#B8973E",
  },
  {
    icon: "video" as IconName,
    title: "Des séances pour tous les niveaux",
    description: "Accédez à une bibliothèque complète de séances Pilates Reformer, du débutant à l'expert.",
    color: "#B8973E",
  },
  {
    icon: "calendar" as IconName,
    title: "Suivez votre progression",
    description: "Programmes structurés, journal bien-être et suivi de vos mensurations pour atteindre vos objectifs.",
    color: "#B8973E",
  },
  {
    icon: "heart" as IconName,
    title: "Commençons ensemble",
    description: "Votre machine est prête, vos séances vous attendent. Prenez soin de vous — chaque jour compte.",
    color: "#B8973E",
  },
];

export default function WelcomeModal({ firstName, onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) onClose();
    else setStep(s => s + 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0 0 40px",
        }}
        onClick={isLast ? onClose : undefined}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: 28,
            padding: "32px 28px 28px",
            width: "calc(100% - 40px)",
            maxWidth: 400,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Icône */}
          <motion.div
            key={step}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              width: 72, height: 72,
              borderRadius: "50%",
              backgroundColor: current.color + "15",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 36,
            }}
          >
            <AppIcon name={current.icon} size={40} />
          </motion.div>

          {/* Titre */}
          <motion.h2
            key={"title" + step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 20, fontWeight: 700, color: "#1C1B19",
              textAlign: "center", margin: "0 0 12px",
              fontFamily: "inherit",
            }}
          >
            {step === 0 && firstName ? `Bonjour ${firstName} !` : current.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            key={"desc" + step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              fontSize: 14, color: "#6B6560", textAlign: "center",
              lineHeight: 1.6, margin: "0 0 28px",
              fontFamily: "inherit",
            }}
          >
            {step === 0 && firstName
              ? `Votre espace Connect Reformer est prêt, ${firstName}. Bienvenue dans votre nouvelle routine Pilates !`
              : current.description}
          </motion.p>

          {/* Indicateurs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 6, height: 6,
                borderRadius: 3,
                backgroundColor: i === step ? current.color : "#E5E0D8",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>

          {/* Bouton */}
          <button
            onClick={next}
            style={{
              width: "100%", padding: "15px",
              backgroundColor: current.color,
              color: "#1C1B19",
              border: "none", borderRadius: 14,
              fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
            }}
          >
            {isLast ? "C'est parti !" : "Suivant"}
            {!isLast && <ChevronRight size={16} />}
          </button>

          {/* Passer */}
          {!isLast && (
            <button
              onClick={onClose}
              style={{
                width: "100%", marginTop: 10,
                padding: "10px",
                background: "none", border: "none",
                fontSize: 13, color: "#B8B0A6",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Passer
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
