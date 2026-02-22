import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const generateWeek = (startDate: Date) => {
  return daysOfWeek.map((day, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return {
      day,
      date: date.getDate(),
      fullDate: date,
    };
  });
};

const scheduledWorkouts: Record<string, string> = {
  "24": "Full Body Flow",
  "25": "Core Sculpt",
  "27": "Posture Session",
};

const completedDays = ["22", "23"];

const Planner = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const baseDate = new Date(2026, 1, 23); // Feb 23, 2026 Monday
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const week = generateWeek(baseDate);
  const [selectedDay, setSelectedDay] = useState<number>(24);

  return (
    <MobileLayout>
      <div className="px-6 pt-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-light text-foreground">Planner</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">February 2026</p>
        </motion.div>

        {/* Week navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-card"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">
            Week {weekOffset === 0 ? "Current" : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="rounded-full p-2 text-muted-foreground hover:bg-card"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Week view */}
        <div className="mt-4 flex justify-between gap-1">
          {week.map(({ day, date }) => {
            const isSelected = date === selectedDay;
            const isCompleted = completedDays.includes(String(date));
            const hasWorkout = scheduledWorkouts[String(date)];

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(date)}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground"
                }`}
              >
                <span className={`font-body text-[10px] ${isSelected ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {day}
                </span>
                <span className="font-display text-lg">{date}</span>
                {isCompleted && !isSelected && (
                  <Check size={10} className="text-gold" />
                )}
                {hasWorkout && !isCompleted && (
                  <div className="h-1 w-1 rounded-full bg-gold" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day detail */}
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          {scheduledWorkouts[String(selectedDay)] ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <span className="font-body text-[10px] tracking-widest uppercase text-gold">
                Scheduled
              </span>
              <h3 className="mt-2 font-display text-xl font-light text-foreground">
                {scheduledWorkouts[String(selectedDay)]}
              </h3>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                45 min · Intermediate
              </p>
              <button className="mt-4 w-full rounded-xl bg-primary py-3 font-body text-sm font-medium text-primary-foreground">
                Start Session
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-body text-sm text-muted-foreground">No session planned</p>
              <button className="mt-3 font-body text-xs text-gold underline decoration-gold/30 underline-offset-2">
                Add a workout
              </button>
            </div>
          )}
        </motion.div>

        {/* Upcoming */}
        <div className="mt-8 mb-6">
          <h3 className="mb-4 font-display text-lg text-foreground">This week</h3>
          <div className="space-y-3">
            {Object.entries(scheduledWorkouts).map(([date, name]) => (
              <div key={date} className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm">
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{name}</p>
                  <p className="font-body text-xs text-muted-foreground">Feb {date}</p>
                </div>
                <div className="rounded-full bg-muted px-3 py-1">
                  <span className="font-body text-[10px] text-muted-foreground">45 min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Planner;
