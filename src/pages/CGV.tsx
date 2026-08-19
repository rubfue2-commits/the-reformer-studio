import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, ChevronUp, FileText, AlertTriangle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";

const ARTICLES = [
  {
    num: "01",
    title: "Objet et champ d'application",
    content: "Les presentes Conditions Generales de Vente (CGV) regissent l'ensemble des relations contractuelles entre la societe Connect Reformer (la Societe) et toute personne physique (le Client) souscrivant a un service de location de reformer Pilates professionnel avec acces a l'application mobile Connect Reformer.\n\nToute souscription emporte acceptation pleine, entiere et sans reserve des presentes CGV. La Societe se reserve le droit de les modifier a tout moment ; les modifications prennent effet des leur publication sur connectreformer.com.",
  },
  {
    num: "02",
    title: "Nature du service — Abonnement de location",
    content: "Le service Connect Reformer est un abonnement de location d'un reformer Pilates professionnel associe a l'acces a l'application mobile. Le Client n'acquiert a aucun moment la propriete du materiel mis a sa disposition.\n\nL'abonnement comprend :\n• La mise a disposition d'un reformer Pilates professionnel livre au domicile\n• L'acces a l'application mobile (iOS) avec programmes progressifs\n• Un suivi personnalise : score journalier, journal bien-etre, badges XP\n• L'acces a la communaute et au programme de parrainage\n• Le support client premium\n\nUsage strictement personnel et non commercial.",
  },
  {
    num: "03",
    title: "Formules d'abonnement et tarifs",
    content: "Deux formules avec engagement contractuel minimum de 12 mois :\n\nFormule Mensuelle — 56,00 EUR TTC par mois\nPrelevement le meme jour chaque mois. A l'issue des 12 mois, renouvellement par tacite reconduction.\n\nFormule Annuelle — 588,00 EUR TTC en paiement unique\nSoit 49,00 EUR/mois (economie de 84,00 EUR).\n\nAucun remboursement en cas de resiliation anticipee avant 12 mois, sauf vice cache ou manquement de la Societe.",
    warning: "Quelle que soit la formule choisie, l'engagement est de 12 mois minimum. La resiliation anticipee ne donne lieu a aucun remboursement ni exoneration des sommes dues.",
  },
  {
    num: "04",
    title: "Modalites de paiement et defaut de paiement",
    content: "Paiement par carte bancaire via Stripe Inc. (PCI DSS niveau 1). Connect Reformer ne stocke aucune donnee bancaire.\n\nProcedure en cas d'echec de prelevement :\n• J+0 : Notification au Client, 30 jours pour regulariser\n• J+0 a J+30 : Periode de regularisation — acces suspendu possible\n• J+30 : En l'absence de regularisation, prelevement integral de la caution de 500,00 EUR via Swikly\n\nCette procedure ne constitue pas une resiliation. Les sommes dues restent exigibles.",
    alert: "En cas d'impaye non regularise dans le delai d'un mois, la caution de 500,00 EUR sera prelevee dans sa totalite. Le Client reste redevable des mensualites jusqu'au terme des 12 mois.",
  },
  {
    num: "05",
    title: "Livraison et reception du materiel",
    content: "Livraison en France metropolitaine sous 2 a 7 jours ouvres a compter de la validation du paiement et de l'enregistrement de la caution.\n\nLe Client doit etre present ou designer un mandataire. Tout dommage apparent doit etre signale dans les 24 heures a contact@connectreformer.com, photographies a l'appui.",
  },
  {
    num: "06",
    title: "Caution de garantie — 500,00 EUR via Swikly",
    content: "Prealablement a toute livraison, le Client doit obligatoirement deposer une caution de 500,00 EUR via la plateforme Swikly.\n\nNature : Empreinte bancaire securisee. Aucun debit a l'enregistrement — montant bloque a titre de garantie.\n\nObjet de la caution :\n• Couverture des dommages au materiel excedant l'usure normale\n• Remboursement partiel des mensualites impayees en cas de defaut non regularise\n• Couverture des frais en cas de perte ou vol\n\nRestitution : Dans les 10 jours ouvres apres retour du materiel en bon etat.\n\nDebit possible : Dommages, mensualites impayees, frais de retour non pris en charge.",
    alert: "La caution de 500,00 EUR est obligatoire avant toute livraison. Aucune livraison sans caution enregistree via Swikly. En cas d'impaye non regularise, la totalite de la caution sera prelevee.",
  },
  {
    num: "07",
    title: "Resiliation et fin de contrat",
    content: "Contrat pour une duree ferme de 12 mois. Aucun remboursement ni exoneration en cas de resiliation anticipee.\n\nFormule mensuelle : Resiliation par email a contact@connectreformer.com avec 30 jours de preavis, apres les 12 mois.\n\nFormule annuelle : Notification par email 30 jours avant la date anniversaire.\n\nA l'issue du contrat, restitution du materiel dans les 15 jours. Frais de retour a la charge du Client.",
    alert: "ATTENTION — La suppression du compte dans l'application ne constitue PAS une resiliation. Les prelevements continuent jusqu'a resiliation formelle par email, meme apres suppression du compte.",
  },
  {
    num: "08",
    title: "Entretien et responsabilite liee au materiel",
    content: "Le Client s'engage a utiliser le reformer conformement aux instructions, pour un usage strictement personnel. En cas de panne, signalement sous 48 heures.\n\nLes dommages resultant d'une utilisation non conforme, abusive ou negligente sont a la charge du Client et pourront donner lieu a debit de la caution.",
  },
  {
    num: "09",
    title: "Droit de retractation",
    content: "Conformement aux articles L.221-18 du Code de la consommation, le Client dispose de 14 jours calendaires a compter de la reception du materiel pour se retracter.\n\nConditions imperatives de retour :\n• Materiel dans son emballage d'origine, intact et non endommage\n• Etat identique a la livraison, comme s'il n'avait jamais ete deballe ni utilise\n• Tous accessoires, notices et cables present dans leur conditionnement\n• Emballage exterieur non decoupe ou endommage\n• Aucune trace d'utilisation, d'installation ou de montage\n\nNotification par email avant expiration. Frais de retour a la charge du Client. Remboursement sous 14 jours apres reception et verification.",
    alert: "Le droit de retractation ne peut etre exerce que si le reformer est retourne dans son emballage d'origine scelle, en parfait etat, comme s'il n'avait jamais ete ouvert. Tout materiel presentant des traces d'utilisation ne pourra faire l'objet d'un remboursement integral.",
  },
  {
    num: "10",
    title: "Programme de parrainage",
    content: "Paliers de recompense pour la marraine :\n• 1 filleule abonnee : 1 mois offert\n• 3 filleules : 3 mois offerts\n• 5 filleules : 1 seance de coaching prive\n• 10 filleules : 1 an d'abonnement offert\n\nLa filleule beneficie d'un mois offert a l'issue de son 12eme mois. Code a renseigner lors de l'inscription — aucune attribution retroactive.",
  },
  {
    num: "11",
    title: "Protection des donnees personnelles",
    content: "Donnees traitees conformement au RGPD (Reglement UE 2016/679) et a la loi du 6 janvier 1978.\n\nDroits d'acces, rectification, effacement, portabilite exerces par email a contact@connectreformer.com. Suppression sous 30 jours.\n\nDonnees bancaires gerees exclusivement par Stripe (certifie PCI DSS). Connect Reformer n'a acces a aucune donnee bancaire.",
  },
  {
    num: "12",
    title: "Propriete intellectuelle",
    content: "L'ensemble des contenus de l'application (programmes, videos, textes, logo, design) sont la propriete exclusive de Connect Reformer. Licence d'usage personnel limitee a la duree de l'abonnement. Toute reproduction ou diffusion sans accord ecrit est interdite.",
  },
  {
    num: "13",
    title: "Responsabilite — Activite physique",
    content: "Le Client declare avoir consulte un medecin prealablement, notamment en cas de grossesse, antecedents cardiovasculaires ou pathologies musculo-squelettiques.\n\nConnect Reformer decline toute responsabilite pour accidents dus a une utilisation non conforme ou contre-indication medicale non signalee.",
  },
  {
    num: "14",
    title: "Droit applicable — Reglement des litiges",
    content: "CGV soumises au droit francais. Recours possible aupres d'un mediateur agree (art. L.616-1 Code de la consommation). Tribunaux francais competents.\n\nContact : contact@connectreformer.com",
  },
];

const RECAP = [
  { label: "Nature du service", value: "Abonnement de location — le Client ne devient pas proprietaire" },
  { label: "Engagement minimum", value: "12 mois — quelle que soit la formule choisie" },
  { label: "Formule Mensuelle", value: "56,00 EUR TTC/mois — prelevement automatique" },
  { label: "Formule Annuelle", value: "588,00 EUR TTC — paiement unique" },
  { label: "Caution obligatoire", value: "500,00 EUR via Swikly — empreinte bancaire avant livraison", critical: true },
  { label: "Defaut de paiement", value: "30 jours regularisation, puis prelevement total de la caution", critical: true },
  { label: "Droit de retractation", value: "14 jours — emballage d'origine non ouvert obligatoire" },
  { label: "Resiliation", value: "Par email avec 30 jours de preavis, apres 12 mois" },
  { label: "Point critique", value: "Suppression du compte ne vaut PAS resiliation", critical: true },
  { label: "Donnees personnelles", value: "Traitees conformement au RGPD" },
  { label: "Droit applicable", value: "Droit francais — Tribunaux francais" },
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
          <button onClick={() => navigate(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border flex-shrink-0">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">{t("Juridique", "Legal")}</p>
            <h1 className="font-display text-2xl font-light text-foreground">{t("Conditions Generales", "General Conditions")}</h1>
          </div>
        </div>

        {/* Carte intro */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 mb-4 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1C1B19 0%, #2D2A22 100%)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(184,151,62,0.2)" }}>
              <FileText size={18} className="text-gold" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-body text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Version 1.1 — 2025</p>
              <p className="font-display text-base font-light text-white">{t("Conditions Generales de Vente", "Terms of Sale")}</p>
            </div>
          </div>
          <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            En souscrivant au service Connect Reformer, vous acceptez sans reserve l'integralite des presentes conditions. L'engagement minimum est de 12 mois.
          </p>
        </motion.div>

        {/* Alerte engagement */}
        <div className="rounded-2xl p-4 mb-5 border" style={{ backgroundColor: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p className="font-body text-xs leading-relaxed" style={{ color: "#EF4444" }}>
              <strong>Point essentiel :</strong> La suppression du compte ne vaut pas resiliation. Les prelevements continuent jusqu'a resiliation formelle par email. Caution obligatoire de 500,00 EUR via Swikly avant livraison.
            </p>
          </div>
        </div>

        {/* Articles en accordeon */}
        <div className="space-y-2 mb-6">
          {ARTICLES.map((art, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center gap-3 p-4 text-left"
                style={{ WebkitTapHighlightColor: "transparent", background: "none", border: "none", cursor: "pointer" }}>
                <span className="font-body text-xs font-semibold flex-shrink-0" style={{ color: "#B8973E" }}>{art.num}</span>
                <span className="font-body text-sm font-medium text-foreground flex-1">{art.title}</span>
                {openIdx === i ? <ChevronUp size={15} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={15} className="text-muted-foreground flex-shrink-0" />}
              </button>

              <AnimatePresence>
                {openIdx === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-4 pb-4">
                      <div style={{ height: 1, backgroundColor: "rgba(28,27,25,0.06)", marginBottom: 12 }} />
                      {art.content.split("\n").map((line, li) => {
                        if (line.startsWith("•")) {
                          return (
                            <div key={li} className="flex items-start gap-2 mb-1.5">
                              <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#B8973E", flexShrink: 0, marginTop: 6 }} />
                              <p className="font-body text-xs text-muted-foreground leading-relaxed">{line.substring(2)}</p>
                            </div>
                          );
                        }
                        return line ? <p key={li} className="font-body text-xs text-muted-foreground leading-relaxed mb-2">{line}</p> : <div key={li} style={{ height: 4 }} />;
                      })}

                      {art.warning && (
                        <div className="rounded-xl p-3 mt-3" style={{ backgroundColor: "rgba(184,151,62,0.08)", border: "1px solid rgba(184,151,62,0.2)" }}>
                          <div className="flex items-start gap-2">
                            <Info size={12} color="#B8973E" style={{ flexShrink: 0, marginTop: 1 }} />
                            <p className="font-body text-xs leading-relaxed" style={{ color: "#8B6914" }}>{art.warning}</p>
                          </div>
                        </div>
                      )}

                      {art.alert && (
                        <div className="rounded-xl p-3 mt-3" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                            <p className="font-body text-xs leading-relaxed" style={{ color: "#DC2626" }}>{art.alert}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Recapitulatif */}
        <div className="bg-card rounded-3xl border border-border overflow-hidden mb-4">
          <div className="p-4 border-b border-border">
            <p className="font-body text-xs font-semibold text-foreground uppercase tracking-widest">{t("Recapitulatif des dispositions essentielles", "Summary of key provisions")}</p>
          </div>
          {RECAP.map((item, i) => (
            <div key={i} style={{ padding: "10px 16px", borderBottom: i < RECAP.length - 1 ? "1px solid rgba(28,27,25,0.06)" : "none", backgroundColor: item.critical ? "rgba(239,68,68,0.03)" : i % 2 === 0 ? "rgba(28,27,25,0.01)" : "transparent" }}>
              <div className="flex items-start justify-between gap-4">
                <p className="font-body text-xs font-semibold" style={{ color: item.critical ? "#DC2626" : "#1C1B19", flexShrink: 0, minWidth: 100 }}>{item.label}</p>
                <p className="font-body text-xs text-right" style={{ color: item.critical ? "#DC2626" : "#6B6560" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-card rounded-2xl p-4 mb-4 border border-border text-center">
          <p className="font-body text-xs text-muted-foreground mb-1">{t("Pour toute question relative aux presentes CGV", "For any question regarding these Terms")}</p>
          <p className="font-body text-xs font-semibold text-gold">{t("contact@connectreformer.com", "contact@connectreformer.com")}</p>
        </div>

      </div>
      <BottomNav />
    </MobileLayout>
  );
}
