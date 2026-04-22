import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import Logo from "@/components/Logo";

const STEPS = [
  {
    id: "goal",
    emoji: "🎯",
    title: "Quel est ton objectif ?",
    options: ["Perdre du poids", "Tonifier mon corps", "Améliorer ma posture", "Récupérer après blessure", "Bien-être & relaxation"],
  },
  {
    id: "level",
    emoji: "💪",
    title: "Ton niveau en Pilates ?",
    options: ["Débutante — je commence", "Intermédiaire — quelques mois", "Avancée — je pratique régulièrement"],
  },
  {
    id: "frequency",
    emoji: "📅",
    title: "Combien de fois par semaine ?",
    options: ["1-2 fois", "3-4 fois", "5+ fois"],
  },
  {
    id: "measurements",
    emoji: "📏",
    title: "Tes mensurations de départ",
    isForm: true,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) { navigate("/home"); return; }
    setStep(s => s + 1);
  };

  const canNext = currentStep.isForm
    ? weight !== "" && height !== ""
    : !!selected[currentStep.id];

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#F5F0E8" }}>
      {/* Header logo */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <Logo size="sm" variant="full" />
        <button onClick={() => navigate("/home")}
          className="font-body text-xs underline-offset-2"
          style={{ color: "#888780" }}>
          Passer
        </button>
      </div>

      {/* Stepper */}
      <div className="flex gap-1.5 px-6 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ background: i <= step ? "#B8973E" : "#D3D1C7" }} />
        ))}
      </div>

      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>

            {/* Emoji + titre */}
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
                  Ces informations nous permettent de suivre tes progrès. Tu pourras les modifier à tout moment.
                </p>
                {[
                  { label: "Poids (kg)", value: weight, setter: setWeight, placeholder: "ex: 65" },
                  { label: "Taille (cm)", value: height, setter: setHeight, placeholder: "ex: 168" },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label className="font-body text-xs tracking-widest uppercase block mb-2"
                      style={{ color: "#888780" }}>{label}</label>
                    <input type="number" value={value} onChange={e => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-2xl border px-5 py-4 font-body text-base outline-none transition-all"
                      style={{ borderColor: "#D3D1C7", background: "#FFFFFF", color: "#1C1B19" }} />
                  </div>
                ))}
                <p className="font-body text-xs text-center mt-4" style={{ color: "#B4B2A9" }}>
                  Optionnel — tu peux sauter cette étape
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
            className="flex h-14 w-14 items-center justify-center rounded-2xl border transition-all"
            style={{ borderColor: "#D3D1C7", color: "#1C1B19" }}>
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
        )}
        <motion.button whileTap={{ scale: 0.98 }} onClick={handleNext}
          disabled={!canNext && !currentStep.isForm}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-body text-sm font-medium tracking-wide transition-all"
          style={{
            background: (canNext || currentStep.isForm) ? "#1C1B19" : "#D3D1C7",
            color: "#F5F0E8",
          }}>
          {isLast ? "Commencer mon parcours" : "Continuer"}
          <ChevronRight size={16} strokeWidth={1.5} />
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
