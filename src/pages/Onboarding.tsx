import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import Logo from "@/components/Logo";

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const STEPS = [
    {
      id: "goal",
      emoji: "🎯",
      title: t("Quel est ton objectif ?", "What's your goal?"),
      options: [
        t("Perdre du poids", "Weight Loss"),
        t("Tonifier mon corps", "Toning"),
        t("Améliorer ma posture", "Posture"),
        t("Récupérer après blessure", "Recovery"),
        t("Bien-être & relaxation", "Relaxation"),
      ],
    },
    {
      id: "level",
      emoji: "💪",
      title: t("Ton niveau en Pilates ?", "Your Pilates level?"),
      options: [
        t("Débutante — je commence", "Beginner — just starting"),
        t("Intermédiaire — quelques mois", "Intermediate — a few months"),
        t("Avancée — je pratique régulièrement", "Advanced — I practice regularly"),
      ],
    },
    {
      id: "frequency",
      emoji: "📅",
      title: t("Combien de fois par semaine ?", "How often per week?"),
      options: [
        t("1-2 fois", "1-2 times"),
        t("3-4 fois", "3-4 times"),
        t("5+ fois", "5+ times"),
      ],
    },
    {
      id: "measurements",
      emoji: "📏",
      title: t("Tes mensurations de départ", "Your starting measurements"),
      isForm: true,
    },
  ];

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) { navigate("/home"); return; }
    setStep(s => s + 1);
  };

  const canNext = currentStep.isForm ? true : !!selected[currentStep.id];

  return (
    <div className="min-h-screen w-full flex items-start justify-center" style={{ background: "#E8E4DC" }}>
      <div className="relative w-full flex flex-col" style={{
        maxWidth: "390px", minHeight: "100svh",
        background: "#F5F0E8", boxShadow: "0 0 60px rgba(0,0,0,0.15)",
      }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-12 pb-6">
          <Logo size="sm" variant="full" />
          <button onClick={() => navigate("/home")}
            className="font-body text-xs" style={{ color: "#888780" }}>
            {t("Passer", "Skip")}
          </button>
        </div>

        {/* Stepper doré */}
        <div className="flex gap-1.5 px-6 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{ background: i <= step ? "#B8973E" : "#D3D1C7" }} />
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 px-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>

              <div className="mb-8">
                <span className="text-4xl mb-4 block">{currentStep.emoji}</span>
                <h1 className="font-display text-2xl font-light" style={{ color: "#1C1B19" }}>
                  {currentStep.title}
                </h1>
              </div>

              {/* Options */}
              {!currentStep.isForm && currentStep.options && (
                <div className="space-y-3">
                  {currentStep.options.map(opt => {
                    const isActive = selected[currentStep.id] === opt;
                    return (
                      <motion.button key={opt} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(prev => ({ ...prev, [currentStep.id]: opt }))}
                        className="w-full flex items-center justify-between rounded-2xl px-5 py-4 text-left transition-all"
                        style={{
                          background: isActive ? "#1C1B19" : "#FFFFFF",
                          color: isActive ? "#F5F0E8" : "#1C1B19",
                          border: isActive ? "none" : "1px solid #D3D1C7",
                        }}>
                        <span className="font-body text-sm">{opt}</span>
                        {isActive && (
                          <div className="h-5 w-5 rounded-full flex items-center justify-center"
                            style={{ background: "#B8973E" }}>
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Formulaire mensurations */}
              {currentStep.isForm && (
                <div className="space-y-4">
                  <p className="font-body text-sm mb-6" style={{ color: "#888780" }}>
                    {t("Ces informations nous permettent de suivre tes progrès. Tu pourras les modifier à tout moment.",
                       "This information helps us track your progress. You can change it anytime.")}
                  </p>
                  {[
                    { label: t("Poids (kg)", "Weight (kg)"), value: weight, setter: setWeight, placeholder: "ex: 65" },
                    { label: t("Taille (cm)", "Height (cm)"), value: height, setter: setHeight, placeholder: "ex: 168" },
                  ].map(({ label, value, setter, placeholder }) => (
                    <div key={label}>
                      <label className="font-body text-xs tracking-widest uppercase block mb-2"
                        style={{ color: "#888780" }}>{label}</label>
                      <input type="number" value={value} onChange={e => setter(e.target.value)}
                        placeholder={placeholder}
                        className="w-full rounded-2xl border px-5 py-4 font-body text-base outline-none"
                        style={{ borderColor: "#D3D1C7", background: "#FFFFFF", color: "#1C1B19" }} />
                    </div>
                  ))}
                  <p className="font-body text-xs text-center mt-4" style={{ color: "#B4B2A9" }}>
                    {t("Optionnel — tu peux sauter cette étape", "Optional — you can skip this step")}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 px-6 pb-12 pt-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border"
              style={{ borderColor: "#D3D1C7", color: "#1C1B19" }}>
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
          )}
          <motion.button whileTap={{ scale: 0.98 }} onClick={handleNext}
            disabled={!canNext}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-body text-sm font-medium tracking-wide"
            style={{
              background: canNext ? "#1C1B19" : "#D3D1C7",
              color: "#F5F0E8",
            }}>
            {isLast ? t("Commencer mon parcours", "Start my journey") : t("Continuer", "Continue")}
            <ChevronRight size={16} strokeWidth={1.5} />
          </motion.button>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
