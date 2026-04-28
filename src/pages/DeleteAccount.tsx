import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, AlertTriangle, Trash2, Shield, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/lib/supabase";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

const DEMO_EMAIL = "rubenfuentes@orange.fr";
type Step = "warning" | "engagement" | "confirm" | "done";

export default function DeleteAccount() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [step, setStep] = useState<Step>("warning");
  const [understood, setUnderstood] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState<any>(null);
  const isDemo = user?.email === DEMO_EMAIL;

  useState(() => {
    if (!user || isDemo) return;
    supabase.from("subscriptions").select("billing_type, months_paid, status")
      .eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setSubscription(data));
  });

  const isMonthly = subscription?.billing_type === "monthly";
  const monthsLeft = subscription ? Math.max(0, 12 - (subscription.months_paid || 0)) : 0;

  const handleDelete = async () => {
    if (confirmText !== t("SUPPRIMER", "DELETE")) return;
    setLoading(true); setError("");
    try {
      if (!isDemo) {
        const { error: fnError } = await supabase.rpc("delete_user_account", { user_uuid: user!.id });
        if (fnError) throw fnError;
        await signOut();
      }
      setStep("done");
    } catch {
      setError(t("Une erreur est survenue. Contactez-nous : contact@connectreformer.com", "An error occurred. Contact: contact@connectreformer.com"));
    }
    setLoading(false);
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">RGPD</p>
            <h1 className="font-display text-2xl font-light text-foreground">{t("Supprimer mon compte", "Delete my account")}</h1>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {step === "warning" && (
            <motion.div key="warning" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                  <AlertTriangle size={40} color="#EF4444" strokeWidth={1.5} />
                </div>
              </div>
              <div className="bg-card rounded-3xl p-5 mb-4 border border-border shadow-sm">
                <h2 className="font-display text-xl font-light text-foreground mb-3">{t("Avant de continuer", "Before you continue")}</h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  {t("La suppression de votre compte est definitive et irreversible. Toutes vos donnees seront effacees conformement au RGPD.", "Deleting your account is permanent. All data will be erased per GDPR.")}
                </p>
                <div className="space-y-2">
                  {[t("Profil et informations personnelles","Profile and personal info"), t("Historique de seances","Session history"), t("Progres, mesures et journal","Progress, measurements and journal"), t("Badges et points XP","Badges and XP points"), t("Parrainages en cours","Active referrals")].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      <p className="font-body text-xs text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-2xl p-4 mb-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={14} className="text-gold" />
                  <p className="font-body text-xs font-semibold text-foreground">{t("Votre abonnement reste actif","Your subscription remains active")}</p>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  {t("La suppression du compte ne resilie pas votre abonnement. Les prelevements continueront jusqu a la fin de votre engagement.", "Deleting your account does not cancel your subscription. Payments continue until end of commitment.")}
                </p>
              </div>
              <button onClick={() => setStep("engagement")} className="w-full py-4 rounded-2xl font-body text-sm font-semibold mb-3" style={{ backgroundColor: "#EF4444", color: "white" }}>
                {t("Continuer vers la suppression", "Continue to deletion")}
              </button>
              <button onClick={() => navigate(-1)} className="w-full py-3 rounded-2xl border border-border font-body text-sm text-muted-foreground bg-card">
                {t("Annuler - garder mon compte", "Cancel - keep my account")}
              </button>
            </motion.div>
          )}

          {step === "engagement" && (
            <motion.div key="engagement" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-3xl overflow-hidden mb-4 shadow-sm" style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(239,68,68,0.2)" }}>
                      <CreditCard size={20} color="#EF4444" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-body text-[10px] text-white/40 uppercase tracking-widest">{t("Engagement contractuel","Contractual commitment")}</p>
                      <p className="font-display text-lg font-light text-white">{t("Important - Prelevements","Important - Payments")}</p>
                    </div>
                  </div>
                  {isMonthly && monthsLeft > 0 ? (
                    <>
                      <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                        <p className="font-body text-sm text-white leading-relaxed">
                          {t("Vous avez souscrit a un abonnement mensuel avec engagement de 12 mois. Il vous reste " + monthsLeft + " mois d engagement.", "You subscribed to a 12-month plan. You have " + monthsLeft + " months remaining.")}
                        </p>
                      </div>
                      <p className="font-body text-sm text-white/80 leading-relaxed mb-4">
                        {t("Meme apres la suppression du compte, les prelevements de 56 euros par mois continueront jusqu a la fin de votre engagement. La suppression ne constitue pas une resiliation.", "Even after deletion, charges of 56 euros/month will continue until end of your commitment. Deletion does not cancel your subscription.")}
                      </p>
                      <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(184,151,62,0.15)" }}>
                        <p className="font-body text-xs text-gold">{t("Pour resilier votre abonnement, contactez-nous d abord : contact@connectreformer.com", "To cancel your subscription, contact us first: contact@connectreformer.com")}</p>
                      </div>
                    </>
                  ) : (
                    <p className="font-body text-sm text-white/70 leading-relaxed">
                      {t("Votre abonnement est solde. Aucun prelevement supplementaire ne sera effectue.", "Your subscription is settled. No additional charges will occur.")}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-card rounded-2xl p-4 mb-6 border border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={understood} onChange={e => setUnderstood(e.target.checked)} style={{ accentColor: "#B8973E", width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
                  <p className="font-body text-sm text-foreground leading-relaxed">
                    {isMonthly && monthsLeft > 0
                      ? t("Je comprends que mes prelevements de 56 euros par mois continueront meme apres la suppression de mon compte, jusqu a la fin de mon engagement.", "I understand my 56 euros/month charges will continue after deletion, until end of my commitment.")
                      : t("Je comprends que la suppression de mon compte est definitive et irreversible.", "I understand account deletion is permanent and irreversible.")}
                  </p>
                </label>
              </div>
              <button onClick={() => understood && setStep("confirm")} disabled={!understood} className="w-full py-4 rounded-2xl font-body text-sm font-semibold mb-3" style={{ backgroundColor: understood ? "#EF4444" : "#D1D5DB", color: "white" }}>
                {t("J ai compris - continuer", "I understand - continue")}
              </button>
              <button onClick={() => navigate(-1)} className="w-full py-3 rounded-2xl border border-border font-body text-sm text-muted-foreground bg-card">{t("Annuler","Cancel")}</button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card rounded-3xl p-5 mb-4 border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={18} className="text-red-400" />
                  <p className="font-body text-sm font-semibold text-foreground">{t("Confirmation finale","Final confirmation")}</p>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  {t("Pour confirmer, tapez SUPPRIMER ci-dessous.", "To confirm, type DELETE below.")}
                </p>
                <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={t("SUPPRIMER","DELETE")}
                  style={{ width: "100%", padding: "14px 16px", border: "1px solid", borderColor: confirmText === t("SUPPRIMER","DELETE") ? "#EF4444" : "rgba(28,27,25,0.12)", borderRadius: 12, backgroundColor: "white", fontSize: 15, fontWeight: 600, color: "#EF4444", letterSpacing: "0.08em", outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }} />
                {error && <p className="font-body text-xs text-red-500 mt-3">{error}</p>}
              </div>
              <button onClick={handleDelete} disabled={confirmText !== t("SUPPRIMER","DELETE") || loading} className="w-full py-4 rounded-2xl font-body text-sm font-semibold mb-3 flex items-center justify-center gap-2" style={{ backgroundColor: confirmText === t("SUPPRIMER","DELETE") ? "#EF4444" : "#D1D5DB", color: "white" }}>
                {loading ? <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} /> : <><Trash2 size={16} /> {t("Supprimer definitivement","Permanently delete")}</>}
              </button>
              <button onClick={() => navigate(-1)} className="w-full py-3 rounded-2xl border border-border font-body text-sm text-muted-foreground bg-card">{t("Annuler","Cancel")}</button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                <Shield size={40} color="#22C55E" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-2xl font-light text-foreground mb-3">{t("Compte supprime","Account deleted")}</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs mb-8">
                {t("Vos donnees ont ete effacees conformement au RGPD. Nous sommes tristes de vous voir partir.", "Your data has been erased per GDPR. We are sad to see you go.")}
              </p>
              <button onClick={() => navigate("/auth")} className="px-8 py-3 rounded-2xl font-body text-sm font-semibold" style={{ backgroundColor: "#1C1B19", color: "white" }}>
                {t("Retour a l accueil","Back to home")}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      <BottomNav />
    </MobileLayout>
  );
}
