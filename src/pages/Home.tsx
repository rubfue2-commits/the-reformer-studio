import { motion } from "framer-motion";
import { Play, Flame, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import heroWorkout from "@/assets/hero-workout.jpg";

const progressData = [
  { day: 1, value: 2 }, { day: 5, value: 4 }, { day: 10, value: 3 },
  { day: 15, value: 6 }, { day: 20, value: 5 }, { day: 25, value: 8 }, { day: 30, value: 7 },
];

const Home = () => {
  const { t } = useLanguage();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.home.morning : hour < 18 ? t.home.afternoon : t.home.evening;

  return (
    <MobileLayout>
      <div className="px-6 pt-14">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">{greeting}</p>
          <h1 className="mt-1 font-display text-3xl font-light text-foreground">Camille</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-card px-4 py-2 shadow-sm">
            <Flame size={14} className="text-gold" />
            <span className="font-body text-xs font-medium text-foreground">12 {t.home.streak}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-card px-4 py-2 shadow-sm">
            <TrendingUp size={14} className="text-gold" />
            <span className="font-body text-xs font-medium text-foreground">8 {t.home.sessions}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative mt-8 overflow-hidden rounded-3xl">
          <img src={heroWorkout} alt="Today's workout" className="h-64 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="mb-1 block font-body text-[10px] tracking-widest uppercase text-gold">{t.home.recommended}</span>
            <h2 className="font-display text-2xl font-light text-primary-foreground">Full Body Flow</h2>
            <p className="mt-1 font-body text-xs text-primary-foreground/70">45 min · Intermediate · Toning</p>
          </div>
        </motion.div>

        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} whileTap={{ scale: 0.98 }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium tracking-wide text-primary-foreground">
          <Play size={16} fill="currentColor" />
          {t.home.startSession}
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-8 mb-6 rounded-3xl bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-light text-foreground">{t.home.monthlyProgress}</h3>
            <span className="font-body text-xs text-muted-foreground">Feb 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={progressData}>
              <Line type="monotone" dataKey="value" stroke="hsl(40, 50%, 58%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex justify-between">
            <div className="text-center"><p className="font-display text-xl text-foreground">8</p><p className="font-body text-[10px] text-muted-foreground">{t.home.sessions_label}</p></div>
            <div className="text-center"><p className="font-display text-xl text-foreground">6h</p><p className="font-body text-[10px] text-muted-foreground">{t.home.totalTime}</p></div>
            <div className="text-center"><p className="font-display text-xl text-foreground">92%</p><p className="font-body text-[10px] text-muted-foreground">{t.home.completion}</p></div>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Home;
