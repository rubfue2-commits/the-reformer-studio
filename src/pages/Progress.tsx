import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis } from "recharts";
import { Activity, Clock, Target, TrendingDown } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

const weightData = [
  { week: "W1", value: 67 },
  { week: "W2", value: 66.5 },
  { week: "W3", value: 66.8 },
  { week: "W4", value: 66.2 },
  { week: "W5", value: 65.7 },
  { week: "W6", value: 65.3 },
  { week: "W7", value: 65.1 },
  { week: "W8", value: 64.8 },
];

const stats = [
  { icon: Activity, label: "Sessions", value: "24", sub: "this month" },
  { icon: Clock, label: "Time Trained", value: "18h", sub: "total" },
  { icon: Target, label: "Completion", value: "92%", sub: "avg rate" },
  { icon: TrendingDown, label: "Weight", value: "-2.2 kg", sub: "since start" },
];

const Progress = () => {
  return (
    <MobileLayout>
      <div className="px-6 pt-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-light text-foreground">Progress</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">Your journey so far</p>
        </motion.div>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {stats.map(({ icon: Icon, label, value, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-card p-4 shadow-sm"
            >
              <Icon size={16} className="text-gold" strokeWidth={1.5} />
              <p className="mt-3 font-display text-2xl text-foreground">{value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Weight chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-3xl bg-card p-5 shadow-sm"
        >
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-display text-lg font-light text-foreground">Weight Evolution</h3>
            <span className="rounded-full bg-muted px-3 py-1 font-body text-[10px] text-gold">
              -2.2 kg
            </span>
          </div>
          <p className="mb-4 font-body text-xs text-muted-foreground">Last 8 weeks</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightData}>
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(27, 8%, 50%)" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(40, 50%, 58%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(40, 50%, 58%)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "hsl(40, 50%, 58%)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 mb-6 rounded-3xl bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 font-display text-lg font-light text-foreground">This Week</h3>
          <div className="flex justify-between gap-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
              const completed = i < 3;
              const today = i === 3;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      completed
                        ? "bg-gold/20"
                        : today
                        ? "border-2 border-gold bg-transparent"
                        : "bg-muted"
                    }`}
                  >
                    {completed && <div className="h-2 w-2 rounded-full bg-gold" />}
                  </div>
                  <span className={`font-body text-[10px] ${today ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Progress;
