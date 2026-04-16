import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import heroWorkout from "@/assets/hero-workout.jpg";
import onboardingBg from "@/assets/onboarding-bg.jpg";

const videos = [
  { id: 1, title: "Lower Body Sculpt", duration: "30 min", level: "Intermediate", image: heroWorkout },
  { id: 2, title: "Core Foundations", duration: "20 min", level: "Beginner", image: onboardingBg },
  { id: 3, title: "Posture Correction", duration: "25 min", level: "All Levels", image: heroWorkout },
  { id: 4, title: "Full Body Reformer", duration: "45 min", level: "Advanced", image: onboardingBg },
  { id: 5, title: "Arm & Shoulder Tone", duration: "20 min", level: "Intermediate", image: heroWorkout },
  { id: 6, title: "Relaxation Flow", duration: "30 min", level: "Beginner", image: onboardingBg },
];

const VideoLibrary = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState(t.library.filters[0]);

  return (
    <MobileLayout>
      <div className="px-6 pt-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-3xl font-light text-foreground">{t.library.title}</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">{videos.length} {t.library.available}</p>
        </motion.div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {t.library.filters.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs transition-all ${activeFilter === filter ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4 pb-6">
          {videos.map((video, i) => (
            <motion.div key={video.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-sm">
              <div className="relative h-44 overflow-hidden">
                <img src={video.image} alt={video.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-charcoal/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm">
                    <Play size={18} className="ml-0.5 text-foreground" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-card/80 px-3 py-1 backdrop-blur-sm">
                  <Clock size={10} className="text-muted-foreground" />
                  <span className="font-body text-[10px] text-foreground">{video.duration}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-light text-foreground">{video.title}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full border border-border px-3 py-0.5 font-body text-[10px] text-muted-foreground">{video.level}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default VideoLibrary;
