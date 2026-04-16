import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import onboardingBg from "@/assets/onboarding-bg.jpg";

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    if (step === 0) return selectedGoal !== "";
    if (step === 1) return selectedLevel !== "";
    if (step === 2) return selectedFrequency !== "";
    if (step === 3) return weight !== "" && height !== "";
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else navigate("/home");
  };

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  return (
    <MobileLayout showNav={false}>
      <div className="flex min-h-screen flex-col px-6 pt-14 pb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">
            {t.onboarding.step} {step + 1} {t.onboarding.of} {totalSteps}
          </span>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="font-body text-xs text-muted-foreground">
              {t.onboarding.back}
            </button>
          )}
        </div>
        <div className="mb-10 h-[2px] w-full overflow-hidden rounded-full bg-muted">
          <motion.div className="h-full bg-gold" animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }} className="flex flex-1 flex-col">
            {step === 0 && (
              <>
                <h1 className="mb-2 font-display text-3xl font-light text-foreground">{t.onboarding.goal.title}</h1>
                <p className="mb-8 font-body text-sm text-muted-foreground">{t.onboarding.goal.sub}</p>
                <div className="space-y-3">
                  {t.onboarding.goal.options.map((goal) => (
                    <button key={goal} onClick={() => setSelectedGoal(goal)}
                      className={`w-full rounded-2xl border px-5 py-4 text-left font-body text-sm transition-all ${selectedGoal === goal ? "border-gold bg-card shadow-sm" : "border-border bg-transparent hover:bg-card"}`}>
                      {goal}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className="mb-2 font-display text-3xl font-light text-foreground">{t.onboarding.level.title}</h1>
                <p className="mb-8 font-body text-sm text-muted-foreground">{t.onboarding.level.sub}</p>
                <div className="space-y-3">
                  {t.onboarding.level.options.map((level, i) => (
                    <button key={level} onClick={() => setSelectedLevel(level)}
                      className={`w-full rounded-2xl border px-5 py-5 text-left font-body text-sm transition-all ${selectedLevel === level ? "border-gold bg-card shadow-sm" : "border-border bg-transparent hover:bg-card"}`}>
                      <span className="block font-medium">{level}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{t.onboarding.level.descriptions[i]}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="mb-2 font-display text-3xl font-light text-foreground">{t.onboarding.frequency.title}</h1>
                <p className="mb-8 font-body text-sm text-muted-foreground">{t.onboarding.frequency.sub}</p>
                <div className="space-y-3">
                  {t.onboarding.frequency.options.map((freq) => (
                    <button key={freq} onClick={() => setSelectedFrequency(freq)}
                      className={`w-full rounded-2xl border px-5 py-5 text-left font-body text-sm transition-all ${selectedFrequency === freq ? "border-gold bg-card shadow-sm" : "border-border bg-transparent hover:bg-card"}`}>
                      {freq}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h1 className="mb-2 font-display text-3xl font-light text-foreground">{t.onboarding.body.title}</h1>
                <p className="mb-8 font-body text-sm text-muted-foreground">{t.onboarding.body.sub}</p>
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block font-body text-xs tracking-widest uppercase text-muted-foreground">{t.onboarding.body.weight}</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={t.onboarding.body.weightPlaceholder}
                      className="w-full rounded-2xl border border-border bg-card px-5 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-xs tracking-widest uppercase text-muted-foreground">{t.onboarding.body.height}</label>
                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={t.onboarding.body.heightPlaceholder}
                      className="w-full rounded-2xl border border-border bg-card px-5 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
                  </div>
                </div>
                <div className="mt-8 overflow-hidden rounded-2xl">
                  <img src={onboardingBg} alt="Pilates studio" className="h-32 w-full object-cover opacity-60" />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.button onClick={handleNext} disabled={!canProceed()} whileTap={{ scale: 0.98 }}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium tracking-wide text-primary-foreground transition-opacity disabled:opacity-30">
          {step === totalSteps - 1 ? t.onboarding.getStarted : t.onboarding.continue}
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </MobileLayout>
  );
};

export default Onboarding;
