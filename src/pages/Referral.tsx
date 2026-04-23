import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, Gift, Users, ChevronLeft,
  Share2, Star, Clock, Crown, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

const REFERRAL_CODE = "CAMILLE30";

const referrals = [
  { name: "Sophie M.", date: "12 fév 2026", status: "active", reward: "1 mois offert" },
  { name: "Julie D.", date: "3 fév 2026", status: "active", reward: "1 mois offert" },
  { name: "Laura B.", date: "28 jan 2026", status: "pending", reward: "En attente" },
  { name: "Marie C.", date: "15 jan 2026", status: "active", reward: "1 mois offert" },
];

const rewards = [
  {
    icon: Gift,
    title: "1 mois offert",
    desc: "Pour toi dès la 1re amie inscrite",
    achieved: true,
    color: "#B8973E",
  },
  {
    icon: Star,
    title: "3 mois offerts",
    desc: "Dès 3 amies inscrites",
    achieved: true,
    color: "#60A5FA",
  },
  {
    icon: Crown,
    title: "Accès VIP 1 an",
    desc: "Dès 10 amies inscrites",
    achieved: false,
    color: "#A78BFA",
    progress: 4,
    target: 10,
  },
  {
    icon: Sparkles,
    title: "Coach privé 1h",
    desc: "Dès 5 amies inscrites",
    achieved: false,
    color: "#34D399",
    progress: 4,
    target: 5,
  },
];

const Referral = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"amies" | "recompenses">("amies");

  const activeCount = referrals.filter(r => r.status === "active").length;

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "The Reformer Studio",
        text: `Rejoins-moi sur The Reformer Studio ! Utilise mon code ${REFERRAL_CODE} pour obtenir 30% de réduction sur ton premier mois. 🧘‍♀️`,
        url: "https://thereformerstudio.app",
      });
    } else {
      handleCopy();
    }
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => navigate("/profile")}
            className="rounded-full p-2 hover:bg-card text-muted-foreground"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-light text-foreground">Parrainage</h1>
            <p className="font-body text-xs text-muted-foreground">Invite tes amies, gagne des mois offerts</p>
          </div>
        </motion.div>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-card p-6 shadow-sm mb-4"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Gift size={16} className="text-gold" />
            <span className="font-body text-xs tracking-widest uppercase text-gold">
              Programme parrainage
            </span>
          </div>
          <h2 className="font-display text-2xl font-light text-white mb-1">
            1 mois offert
          </h2>
          <p className="font-body text-sm text-white/60 mb-5">
            Pour toi ET ton amie à chaque inscription réussie
          </p>

          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <div className="text-center">
              <p className="font-display text-3xl text-gold">{activeCount}</p>
              <p className="font-body text-[10px] text-white/50 mt-1">Amies actives</p>
            </div>
            <div className="w-[0.5px] bg-white/10" />
            <div className="text-center">
              <p className="font-display text-3xl text-white">{activeCount}</p>
              <p className="font-body text-[10px] text-white/50 mt-1">Mois gagnés</p>
            </div>
            <div className="w-[0.5px] bg-white/10" />
            <div className="text-center">
              <p className="font-display text-3xl text-white">30%</p>
              <p className="font-body text-[10px] text-white/50 mt-1">Réduction amie</p>
            </div>
          </div>

          {/* Code */}
          <div className="rounded-2xl bg-white/10 p-4 flex items-center justify-between mb-3">
            <div>
              <p className="font-body text-[10px] text-white/50 mb-1">Ton code personnel</p>
              <p className="font-display text-2xl text-white tracking-widest">{REFERRAL_CODE}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 font-body text-xs font-medium text-white transition-all active:scale-95"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 py-3 font-body text-sm text-white/80 transition-all active:scale-95"
          >
            <Share2 size={16} strokeWidth={1.5} />
            Partager le lien d'invitation
          </button>
        </motion.div>

        {/* Comment ça marche */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl bg-card p-5 shadow-sm mb-4"
        >
          <h3 className="font-display text-base font-light text-foreground mb-4">
            Comment ça marche ?
          </h3>
          {[
            { step: "1", text: "Partage ton code ou lien unique avec une amie" },
            { step: "2", text: "Elle s'inscrit avec ton code et obtient 30% de réduction" },
            { step: "3", text: "Dès qu'elle valide son abonnement, vous recevez toutes les deux 1 mois offert" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3 mb-3 last:mb-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 font-body text-xs font-medium text-gold mt-0.5">
                {step}
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-5">
          {([
            { id: "amies", label: `Amies (${referrals.length})` },
            { id: "recompenses", label: "Récompenses" },
          ] as { id: "amies" | "recompenses"; label: string }[]).map((tab) => (
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >

            {/* AMIES */}
            {activeTab === "amies" && (
              <div className="rounded-3xl bg-card shadow-sm overflow-hidden mb-6">
                {referrals.map((ref, i) => (
                  <div
                    key={ref.name}
                    className={`flex items-center justify-between px-5 py-4 ${
                      i < referrals.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-display text-sm text-foreground">
                        {ref.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{ref.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{ref.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 font-body text-[10px] font-medium ${
                          ref.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {ref.status === "active" ? "✓ Active" : "⏳ En attente"}
                      </span>
                      <p className="font-body text-[10px] text-gold mt-1">{ref.reward}</p>
                    </div>
                  </div>
                ))}

                {/* Inviter plus */}
                <button
                  onClick={handleShare}
                  className="flex w-full items-center justify-center gap-2 px-5 py-4 font-body text-sm text-gold border-t border-border"
                >
                  <Users size={14} strokeWidth={1.5} />
                  Inviter une amie
                </button>
              </div>
            )}

            {/* RÉCOMPENSES */}
            {activeTab === "recompenses" && (
              <div className="space-y-3 mb-6">
                {rewards.map(({ icon: Icon, title, desc, achieved, color, progress, target }) => (
                  <div
                    key={title}
                    className={`rounded-2xl border bg-card p-4 shadow-sm ${
                      achieved ? "border-gold/30" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: achieved ? color + "20" : "hsl(27, 8%, 92%)" }}
                      >
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                          style={{ color: achieved ? color : "hsl(27, 8%, 60%)" }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-body text-sm font-medium text-foreground">{title}</p>
                          {achieved ? (
                            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-body text-[10px] text-green-700">
                              <Check size={10} /> Obtenu
                            </span>
                          ) : (
                            <span className="font-body text-[10px] text-muted-foreground">
                              {progress}/{target} amies
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs text-muted-foreground">{desc}</p>
                        {!achieved && progress !== undefined && target !== undefined && (
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(progress / target) * 100}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Note légale */}
                <p className="text-center font-body text-[10px] text-muted-foreground px-4 pb-2">
                  Les mois offerts sont crédités automatiquement après validation de l'abonnement de ton amie. Offre non cumulable avec d'autres promotions.
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

export default Referral;
