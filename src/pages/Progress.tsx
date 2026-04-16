import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import {
  Activity, Clock, Target, TrendingDown, TrendingUp,
  Plus, ChevronRight, Ruler, Scale, Camera
} from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";

const weightHistory = [
  { date: "Jan S1", poids: 67.0, taille: 72, hanches: 96, bras: 29 },
  { date: "Jan S2", poids: 66.8, taille: 71.5, hanches: 95.5, bras: 28.8 },
  { date: "Jan S3", poids: 66.5, taille: 71, hanches: 95, bras: 28.5 },
  { date: "Jan S4", poids: 66.2, taille: 70.5, hanches: 94.5, bras: 28.3 },
  { date: "Fév S1", poids: 65.9, taille: 70, hanches: 94, bras: 28.1 },
  { date: "Fév S2", poids: 65.6, taille: 69.5, hanches: 93.5, bras: 27.9 },
  { date: "Fév S3", poids: 65.3, taille: 69, hanches: 93, bras: 27.7 },
  { date: "Fév S4", poids: 64.8, taille: 68.5, hanches: 92.5, bras: 27.5 },
];

const sessionHistory = [
  { date: "Jan S1", sessions: 2 },
  { date: "Jan S2", sessions: 3 },
  { date: "Jan S3", sessions: 2 },
  { date: "Jan S4", sessions: 4 },
  { date: "Fév S1", sessions: 3 },
  { date: "Fév S2", sessions: 3 },
  { date: "Fév S3", sessions: 4 },
  { date: "Fév S4", sessions: 3 },
];

type Metric = "poids" | "taille" | "hanches" | "bras";
type Tab = "mesures" | "sessions" | "saisie";

const metricConfig: Record<Metric, { label: string; color: string; unit: string; icon: any }> = {
  poids:   { label: "Poids",        color: "#B8973E", unit: "kg", icon: Scale },
  taille:  { label: "Tour de taille", color: "#60A5FA", unit: "cm", icon: Ruler },
  hanches: { label: "Hanches",      color: "#A78BFA", unit: "cm", icon: Ruler },
  bras:    { label: "Bras",         color: "#34D399", unit: "cm", icon: Ruler },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl bg-card border border-border px-3 py-2 shadow-sm">
        <p className="font-body text-[10px] text-muted-foreground mb-1">{label}</p>
        <p className="font-display text-sm text-foreground">
          {payload[0].value} <span className="text-[10px] text-muted-foreground">{payload[0].name === "poids" ? "kg" : "cm"}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Progress = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("mesures");
  const [activeMetric, setActiveMetric] = useState<Metric>("poids");
  const [showForm, setShowForm] = useState(false);

  const [newPoids, setNewPoids] = useState("");
  const [newTaille, setNewTaille] = useState("");
  const [newHanches, setNewHanches] = useState("");
  const [newBras, setNewBras] = useState("");

  const latest = weightHistory[weightHistory.length - 1];
  const first = weightHistory[0];
  const diff = (key: Metric) => (latest[key] - first[key]).toFixed(1);
  const isPositive = (key: Metric) => latest[key] > first[key];

  const tabs: { id: Tab; label: string }[] = [
    { id: "mesures", label: "Mensurations" },
    { id: "sessions", label: "Séances" },
    { id: "saisie", label: "Saisir" },
  ];

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-light text-foreground">{t.progress.title}</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">{t.progress.sub}</p>
        </motion.div>

        {/* Score global */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 rounded-3xl bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-light text-foreground">Depuis le début</h3>
            <span className="font-body text-[10px] text-muted-foreground">Jan → Fév 2026</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(metricConfig) as Metric[]).map((key) => {
              const cfg = metricConfig[key];
              const delta = parseFloat(diff(key));
              const good = key === "poids" ? delta <= 0 : delta <= 0;
              return (
                <div key={key} className="text-center">
                  <p
                    className="font-display text-lg"
                    style={{ color: good ? "#4CAF50" : "#EF4444" }}
                  >
                    {delta > 0 ? "+" : ""}{delta}
                  </p>
                  <p className="font-body text-[9px] text-muted-foreground">{cfg.unit}</p>
                  <p className="font-body text-[9px] text-muted-foreground mt-0.5">{cfg.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats rapides */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { icon: Activity, label: t.progress.sessions, value: "24", sub: t.progress.thisMonth, color: "text-gold" },
            { icon: Clock, label: t.progress.timeTrained, value: "18h", sub: t.progress.total, color: "text-blue-400" },
          ].map(({ icon: Icon, label, value, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl bg-card p-4 shadow-sm"
            >
              <Icon size={16} className={color} strokeWidth={1.5} />
              <p className="mt-3 font-display text-2xl text-foreground">{value}</p>
              <p className="font-body text-[10px] text-muted-foreground">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 pb-3 font-body text-xs transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-gold text-foreground -mb-[1px]"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >

            {/* TAB: MENSURATIONS */}
            {activeTab === "mesures" && (
              <div className="mt-5">
                {/* Sélecteur de métrique */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {(Object.keys(metricConfig) as Metric[]).map((key) => {
                    const cfg = metricConfig[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveMetric(key)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs transition-all border ${
                          activeMetric === key
                            ? "text-white border-transparent"
                            : "bg-card text-muted-foreground border-border"
                        }`}
                        style={activeMetric === key ? { backgroundColor: cfg.color } : {}}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Valeur actuelle */}
                <div className="mt-4 rounded-3xl bg-card p-5 shadow-sm">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                        {metricConfig[activeMetric].label} actuel
                      </p>
                      <p className="font-display text-4xl text-foreground">
                        {latest[activeMetric]}
                        <span className="font-body text-lg text-muted-foreground ml-1">
                          {metricConfig[activeMetric].unit}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-display text-xl"
                        style={{
                          color: parseFloat(diff(activeMetric)) <= 0 ? "#4CAF50" : "#EF4444"
                        }}
                      >
                        {parseFloat(diff(activeMetric)) > 0 ? "+" : ""}{diff(activeMetric)} {metricConfig[activeMetric].unit}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground">depuis le début</p>
                    </div>
                  </div>

                  {/* Graphique */}
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={weightHistory} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={metricConfig[activeMetric].color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={metricConfig[activeMetric].color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(27, 8%, 90%)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "hsl(27, 8%, 55%)" }}
                        interval={1}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "hsl(27, 8%, 55%)" }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey={activeMetric}
                        stroke={metricConfig[activeMetric].color}
                        strokeWidth={2.5}
                        fill="url(#metricGrad)"
                        dot={{ r: 3, fill: metricConfig[activeMetric].color, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: metricConfig[activeMetric].color, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Historique détaillé */}
                <div className="mt-4 rounded-3xl bg-card shadow-sm overflow-hidden mb-6">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-display text-base font-light text-foreground">Historique</h3>
                  </div>
                  {[...weightHistory].reverse().map((entry, i) => (
                    <div
                      key={entry.date}
                      className={`flex items-center justify-between px-5 py-3 ${
                        i < weightHistory.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <p className="font-body text-xs text-muted-foreground">{entry.date}</p>
                      <p className="font-display text-base text-foreground">
                        {entry[activeMetric]}
                        <span className="font-body text-xs text-muted-foreground ml-1">
                          {metricConfig[activeMetric].unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SESSIONS */}
            {activeTab === "sessions" && (
              <div className="mt-5">
                <div className="rounded-3xl bg-card p-5 shadow-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-display text-lg font-light text-foreground">{t.progress.weightEvolution}</h3>
                    <span className="rounded-full bg-muted px-3 py-1 font-body text-[10px] text-gold">24 séances</span>
                  </div>
                  <p className="mb-4 font-body text-xs text-muted-foreground">{t.progress.lastWeeks}</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={sessionHistory}>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(27, 8%, 50%)" }} interval={1} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(27, 8%, 50%)" }} domain={[0, 6]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="sessions" stroke="#B8973E" strokeWidth={2.5}
                        dot={{ r: 3, fill: "#B8973E", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#B8973E", strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Semaine actuelle */}
                <div className="mt-4 rounded-3xl bg-card p-5 shadow-sm mb-6">
                  <h3 className="mb-4 font-display text-lg font-light text-foreground">{t.progress.thisWeek}</h3>
                  <div className="flex justify-between gap-2">
                    {["L","M","M","J","V","S","D"].map((day, i) => {
                      const completed = i < 3;
                      const today = i === 3;
                      return (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            completed ? "bg-gold/20" : today ? "border-2 border-gold bg-transparent" : "bg-muted"
                          }`}>
                            {completed && <div className="h-2 w-2 rounded-full bg-gold" />}
                          </div>
                          <span className={`font-body text-[10px] ${today ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                            {day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SAISIE */}
            {activeTab === "saisie" && (
              <div className="mt-5 mb-6">
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Enregistre tes mesures du jour pour suivre ta progression semaine après semaine.
                </p>

                <div className="space-y-3">
                  {[
                    { key: "poids", label: "Poids", unit: "kg", placeholder: "65.0", value: newPoids, setter: setNewPoids },
                    { key: "taille", label: "Tour de taille", unit: "cm", placeholder: "68", value: newTaille, setter: setNewTaille },
                    { key: "hanches", label: "Hanches", unit: "cm", placeholder: "92", value: newHanches, setter: setNewHanches },
                    { key: "bras", label: "Bras", unit: "cm", placeholder: "27", value: newBras, setter: setNewBras },
                  ].map(({ key, label, unit, placeholder, value, setter }) => (
                    <div key={key} className="rounded-2xl bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-body text-xs font-medium text-foreground">{label}</label>
                        <span className="font-body text-[10px] text-muted-foreground">
                          Actuel : {latest[key as Metric]} {unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                        />
                        <span className="font-body text-sm text-muted-foreground w-6">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bouton photo */}
                <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 font-body text-sm text-muted-foreground hover:bg-card">
                  <Camera size={16} strokeWidth={1.5} />
                  Ajouter une photo (avant/après)
                </button>

                {/* Enregistrer */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={!newPoids && !newTaille && !newHanches && !newBras}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-sm font-medium tracking-wide text-primary-foreground transition-opacity disabled:opacity-30"
                  onClick={() => {
                    setNewPoids("");
                    setNewTaille("");
                    setNewHanches("");
                    setNewBras("");
                    setActiveTab("mesures");
                  }}
                >
                  <Plus size={16} />
                  Enregistrer mes mesures
                </motion.button>

                <p className="mt-3 text-center font-body text-[10px] text-muted-foreground">
                  Recommandé : mesures le matin à jeun, même conditions chaque fois
                </p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </MobileLayout>
  );
};

export default Progress;
