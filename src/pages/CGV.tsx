import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronDown, ChevronUp, Shield, FileText, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

const ARTICLES = [
  {
    num: "01", title: "Objet et champ d'application",
    content: "Les presentes CGV regissent les relations entre Connect Reformer et tout Client souscrivant a un abonnement de location de reformer Pilates avec acces a l'application mobile. Toute souscription implique l'acceptation pleine et entiere des presentes CGV."
  },
  {
    num: "02", title: "Description du service",
    content: "Le service comprend : la mise a disposition d'un reformer Pilates professionnel livre a domicile, l'acces a l'application mobile avec programmes progressifs, un suivi personnalise (score, journal, badges), l'acces a la communaute et au parrainage, et le support client premium. Usage strictement personnel."
  },
  {
    num: "03", title: "Formules et tarifs",
    content: "Deux formules avec engagement de 12 mois minimum :\n\n• Formule Mensuelle : 56 EUR/mois pendant 12 mois. Renouvellement automatique ensuite.\n• Formule Annuelle : 588 EUR en une fois (49 EUR/mois, economie de 84 EUR).\n\nAucun remboursement en cas de resiliation avant l'echeance des 12 mois, sauf vice cache."
  },
  {
    num: "04", title: "Modalites de paiement",
    content: "Paiement exclusivement par carte bancaire via Stripe (Visa, Mastercard, Amex). Pour la formule mensuelle, prelevement le meme jour chaque mois. Suspension du service en cas d'echec de prelevement. Les donnees bancaires sont gerees exclusivement par Stripe (certifie PCI DSS)."
  },
  {
    num: "05", title: "Livraison et installation",
    content: "Livraison en France metropolitaine sous 2 a 7 jours ouvres. Le Client doit etre present a la reception. Tout dommage apparent doit etre signale dans les 24h a contact@connectreformer.com."
  },
  {
    num: "06", title: "Caution et depot de garantie",
    content: "Une caution est demandee via notre partenaire Swikly. Il s'agit d'une empreinte bancaire (aucun debit effectif). Elle est restituee dans les 10 jours ouvres apres retour du materiel en bon etat."
  },
  {
    num: "07", title: "Resiliation et fin de contrat",
    content: "Resiliation possible uniquement a l'issue des 12 mois par email a contact@connectreformer.com avec 30 jours de preavis.\n\n⚠️ IMPORTANT : La suppression de votre compte dans l'application NE constitue PAS une resiliation. Les prelevements continuent jusqu'a resiliation formelle par email, meme apres suppression du compte."
  },
  {
    num: "08", title: "Entretien du materiel",
    content: "Le Client s'engage a utiliser le reformer conformement aux instructions et a en prendre soin. Les dommages dus a une utilisation anormale sont a la charge du Client. En cas de panne, signalement dans les 48h a contact@connectreformer.com."
  },
  {
    num: "09", title: "Droit de retractation",
    content: "14 jours a compter de la reception du materiel pour se retracter (art. L221-18 Code de la consommation). Notification par email avant expiration du delai. Retour du materiel en parfait etat, frais a la charge du Client. Remboursement sous 14 jours."
  },
  {
    num: "10", title: "Programme de parrainage",
    content: "Paliers de recompense :\n• 1 filleule : 1 mois offert\n• 3 filleules : 3 mois offerts\n• 5 filleules : 1 coaching prive\n• 10 filleules : 1 an offert\n\nLa filleule beneficie d'un mois offert apres 12 mois. Code a saisir lors de l'inscription."
  },
  {
    num: "11", title: "Donnees personnelles — RGPD",
    content: "Donnees traitees conformement au RGPD. Droits : acces, rectification, effacement, portabilite, opposition. Pour supprimer vos donnees : fonction dans l'application ou email a contact@connectreformer.com. Suppression sous 30 jours. Donnees de paiement gerees par Stripe uniquement."
  },
  {
    num: "12", title: "Propriete intellectuelle",
    content: "Tous les contenus (programmes, videos, logo, design) sont la propriete de Connect Reformer. Droit d'usage personnel limite a la duree de l'abonnement. Toute reproduction ou diffusion est interdite."
  },
  {
    num: "13", title: "Responsabilite et sante",
    content: "La pratique du Pilates Reformer est une activite physique. Le Client atteste avoir obtenu l'accord de son medecin avant de commencer, notamment en cas de grossesse, pathologie cardiaque ou musculo-squelettique. Connect Reformer decline toute responsabilite pour les accidents dus a une utilisation non conforme."
  },
  {
    num: "14", title: "Droit applicable et litiges",
    content: "CGV soumises au droit francais. En cas de litige, recours possible aupres d'un mediateur agree. Tribunaux francais competents. Contact : contact@connectreformer.com."
  },
];

export default function CGV() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Juridique</p>
            <h1 className="font-display text-2xl font-light text-foreground">CGV</h1>
          </div>
        </div>

        {/* Carte intro */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 mb-5 shadow-sm overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(184,151,62,0.2)" }}>
              <FileText size={20} className="text-gold" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-body text-[10px] text-white/40 uppercase tracking-widest">Version 1.0 — 2025</p>
              <p className="font-display text-base font-light text-white">Conditions Generales de Vente</p>
            </div>
          </div>
          <p className="font-body text-xs text-white/60 leading-relaxed">
            En souscrivant au service Connect Reformer, vous acceptez sans reserve les presentes conditions. L'engagement minimum est de 12 mois.
          </p>
        </motion.div>

        {/* Encart alerte engagement */}
        <div className="rounded-2xl p-4 mb-5 border"
          style={{ backgroundColor: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="flex items-start gap-2">
            <Shield size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p className="font-body text-xs leading-relaxed" style={{ color: "#EF4444" }}>
              <strong>Important :</strong> La suppression de votre compte dans l'application ne constitue pas une resiliation d'abonnement. Les prelevements continuent jusqu'a resiliation formelle par email.
            </p>
          </div>
        </div>

        {/* Articles accordeon */}
        <div className="space-y-2 mb-6">
          {ARTICLES.map((art, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center gap-3 p-4 text-left"
                style={{ WebkitTapHighlightColor: "transparent" }}>
                <span className="font-body text-xs font-semibold flex-shrink-0"
                  style={{ color: "#B8973E" }}>
                  {art.num}
                </span>
                <span className="font-body text-sm font-medium text-foreground flex-1">
                  {art.title}
                </span>
                {openIdx === i
                  ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" />
                  : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
                }
              </button>

              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}>
                  <div className="px-4 pb-4">
                    <div style={{ height: 1, backgroundColor: "rgba(28,27,25,0.06)", marginBottom: 12 }} />
                    {art.content.split("\n").map((line, li) => (
                      <p key={li} className="font-body text-xs text-muted-foreground leading-relaxed mb-1.5">
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-card rounded-2xl p-4 mb-4 border border-border text-center">
          <p className="font-body text-xs text-muted-foreground mb-1">
            {t("Une question sur nos CGV ?", "Questions about our terms?")}
          </p>
          <p className="font-body text-xs font-semibold text-gold">contact@connectreformer.com</p>
        </div>

      </div>
      <BottomNav />
    </MobileLayout>
  );
}
