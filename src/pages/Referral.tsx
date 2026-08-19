import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Gift, Users, ChevronLeft, Share2, Star, Clock, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useReferral } from "@/hooks/useReferral";

const DEMO_EMAIL = "rubenfuentes@orange.fr";

// Données démo figées
const DEMO_DATA = {
  referralCode: "CAMILLE88",
  totalReferrals: 4,
  referrals: [
    { name: "Sophie M.", monthsCompleted: 12, giftApplied: true },
    { name: "Julie R.",  monthsCompleted: 8,  giftApplied: false },
    { name: "Emma L.",   monthsCompleted: 5,  giftApplied: false },
    { name: "Léa D.",    monthsCompleted: 2,  giftApplied: false },
  ],
  subscription: { billing_type: "annual_upfront", months_paid: 9, gift_month_applied: false },
};

const TIERS = [
  { count: 1,  icon: Gift,     titleFr: "1 mois offert",    titleEn: "1 free month",       descFr: "Dès 1 amie inscrite",    descEn: "From 1 friend",    color: "#B8973E", bg: "#FAEEDA" },
  { count: 3,  icon: Star,     titleFr: "3 mois offerts",   titleEn: "3 free months",      descFr: "Dès 3 amies inscrites",  descEn: "From 3 friends",   color: "#60A5FA", bg: "#EFF6FF" },
  { count: 5,  icon: Crown,    titleFr: "Coach privé 1h",   titleEn: "Private coach 1h",   descFr: "Dès 5 amies inscrites",  descEn: "From 5 friends",   color: "#A78BFA", bg: "#F5F3FF" },
  { count: 10, icon: Sparkles, titleFr: "Accès VIP 1 an",   titleEn: "VIP access 1 year",  descFr: "Dès 10 amies inscrites", descEn: "From 10 friends",  color: "#34D399", bg: "#ECFDF5" },
];

export default function Referral() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = user?.email === DEMO_EMAIL;

  // Hook Supabase — ignoré si compte démo
  const { referralCode, totalReferrals, referrals, subscription, loading } = useReferral();

  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Données à afficher selon le compte
  const displayCode    = isDemo ? DEMO_DATA.referralCode : (referralCode ?? "—");
  const displayTotal   = isDemo ? DEMO_DATA.totalReferrals : totalReferrals;
  const displaySub     = isDemo ? DEMO_DATA.subscription : subscription;

  // Barre de progression filleule (13e mois)
  const monthsPaid     = displaySub?.months_paid ?? 0;
  const giftApplied    = displaySub?.gift_month_applied ?? false;
  const isAnnualUpfront = displaySub?.billing_type === "annual_upfront";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = t(
      `Rejoins Connect Reformer avec mon code ${displayCode} et profite d'un accès exclusif au Pilates reformer !`,
      `Join Connect Reformer with my code ${displayCode} and enjoy exclusive Pilates reformer access!`
    );
    if (navigator.share) navigator.share({ title: "Connect Reformer", text });
    else { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <MobileLayout>
      <div className="px-4 pt-14">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">
              {t("Programme", "Program")}
            </p>
            <h1 className="font-display text-2xl font-light text-foreground">
              {t("Parrainage", "Referral")}
            </h1>
          </div>
        </div>

        {/* Compteur */}
        <div className="rounded-2xl p-5 mb-4 shadow-sm flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div>
            <p className="font-body text-xs text-white/50 uppercase tracking-widest mb-1">
              {t("Amies parrainées", "Friends referred")}
            </p>
            <p className="font-display text-5xl font-light text-white">{displayTotal}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/20">
            <Users size={28} className="text-gold" strokeWidth={1.5} />
          </div>
        </div>

        {/* Code de parrainage */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-4 shadow-sm">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-2">
            {t("Ton code", "Your code")}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-muted px-4 py-3">
              <p className="font-display text-2xl font-light tracking-widest text-foreground">
                {loading && !isDemo ? "..." : displayCode}
              </p>
            </div>
            <button onClick={handleCopy}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background flex-shrink-0">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            <button onClick={handleShare}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-border flex-shrink-0">
              <Share2 size={18} className="text-muted-foreground" />
            </button>
          </div>
          {copied && (
            <p className="font-body text-xs text-green-600 mt-2">
              {t("Copié !", "Copied!")}
            </p>
          )}
        </div>

        {/* Paliers marraine */}
        <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-3 px-1">
          {t("Tes récompenses", "Your rewards")}
        </p>
        <div className="space-y-2 mb-4">
          {TIERS.map((tier, i) => {
            const achieved = displayTotal >= tier.count;
            const inProgress = !achieved && displayTotal > 0;
            const progress = Math.min(displayTotal / tier.count, 1);
            const isOpen = expanded === i;

            return (
              <motion.div key={i} layout
                className={"rounded-2xl border overflow-hidden shadow-sm " +
                  (achieved ? "border-opacity-50" : "border-border bg-card")}
                style={achieved ? { borderColor: tier.color + "60", backgroundColor: tier.bg } : {}}>

                <button className="w-full p-4 flex items-center gap-3 text-left"
                  onClick={() => setExpanded(isOpen ? null : i)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0"
                    style={{ backgroundColor: achieved ? tier.color + "25" : "#F1EFE9" }}>
                    <tier.icon size={18} strokeWidth={1.5}
                      style={{ color: achieved ? tier.color : "#9CA3AF" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-foreground">
                      {t(tier.titleFr, tier.titleEn)}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">{t(tier.descFr, tier.descEn)}</p>
                    {inProgress && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: (progress * 100) + "%", backgroundColor: tier.color }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {achieved
                      ? <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: tier.color, backgroundColor: tier.color + "18" }}>
                          ✓ {t("Obtenu", "Earned")}
                        </span>
                      : <span className="font-body text-xs text-muted-foreground">
                          {displayTotal}/{tier.count} {t("amies", "friends")}
                        </span>
                    }
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <p className="font-body text-xs text-muted-foreground px-4 pb-4 border-t border-border/50 pt-3">
                        {achieved
                          ? t("Récompense débloquée ! Elle sera créditée automatiquement sur ton abonnement.",
                              "Reward unlocked! It will be automatically credited to your subscription.")
                          : t(`Encore ${tier.count - displayTotal} amie(s) pour débloquer cette récompense.`,
                              `${tier.count - displayTotal} more friend(s) to unlock this reward.`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Section filleule — 13e mois */}
        {isAnnualUpfront && (
          <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-5 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 flex-shrink-0">
                <Gift size={18} className="text-pink-400" strokeWidth={1.5} />
              </div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">
                {t("Ton avantage filleule", "Your referral benefit")}
              </p>
            </div>

            {giftApplied ? (
              <div>
                <p className="font-body font-semibold text-sm text-foreground">
                  {t("Ton 13e mois offert est actif !", "Your 13th free month is active!")}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {t("Profite bien. À partir du mois suivant, ton abonnement mensuel à 49€ commence.",
                     "Enjoy it. From next month, your 49€/month subscription begins.")}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-body font-semibold text-sm text-foreground">
                      {t("1 mois offert automatiquement", "1 month offered automatically")}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {t("À la fin de ton 12e mois d'abonnement, le 13e est gratuit.",
                         "At the end of your 12th month, the 13th is free.")}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-pink-100">
                    <Clock size={20} className="text-pink-400" />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-pink-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-pink-400 transition-all"
                      style={{ width: (Math.min(monthsPaid / 12, 1) * 100) + "%" }} />
                  </div>
                  <span className="font-body text-xs text-muted-foreground flex-shrink-0">
                    {t(`Mois ${monthsPaid}/12`, `Month ${monthsPaid}/12`)}
                  </span>
                </div>

                {monthsPaid < 12 && (
                  <p className="font-body text-[10px] text-pink-400 mt-1.5">
                    {t(`Plus que ${12 - monthsPaid} mois avant ton cadeau !`,
                       `Only ${12 - monthsPaid} months left before your gift!`)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Conditions */}
        <div className="rounded-2xl bg-muted/50 p-4 mb-6">
          <p className="font-body text-[10px] text-muted-foreground leading-relaxed">
            {t(
              "Les mois offerts sont crédités automatiquement après validation de l'abonnement de ton amie. Le 13e mois gratuit est appliqué sans encaissement. À partir du 14e mois, l'abonnement mensuel à 49€ est activé automatiquement.",
              "Free months are credited automatically after your friend's subscription is validated. The 13th free month is applied without charge. From the 14th month, the 49€/month subscription is activated automatically."
            )}
          </p>
        </div>

      </div>
      <BottomNav />
    </MobileLayout>
  );
}
