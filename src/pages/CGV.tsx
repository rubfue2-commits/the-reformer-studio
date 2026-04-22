import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const SECTIONS_FR = [
  {
    title: "1. Objet",
    text: "Les presentes Conditions Generales de Vente (CGV) regissent les relations contractuelles entre Connect Reformer, plateforme de Pilates en ligne, et toute personne physique souhaitant souscrire un abonnement (ci-apres l'Utilisateur). Toute inscription implique l'acceptation pleine et entiere des presentes CGV."
  },
  {
    title: "2. Description du service",
    text: "Connect Reformer propose un acces a une plateforme numerique de cours de Pilates en ligne, incluant des seances video guidees, un suivi de progression, ainsi que des outils de bien-etre. Le service est accessible via l'application mobile et/ou l'interface web."
  },
  {
    title: "3. Abonnements et tarifs",
    text: "Connect Reformer propose deux formules d'abonnement : (1) Formule Annuelle a 588 EUR/an (soit 49 EUR/mois), sans engagement, payable en une seule fois. (2) Formule Mensuelle avec engagement 12 mois a 56 EUR/mois, soit 672 EUR au total. Les prix sont exprimes en euros toutes taxes comprises (TTC). Une caution bancaire de 500 EUR par pre-autorisation Swikly est requise pour la formule avec engagement. Elle n'est pas debitee et est liberee a la fin de l'engagement."
  },
  {
    title: "4. Modalites de paiement",
    text: "Le paiement s'effectue en ligne par carte bancaire via notre prestataire securise Stripe. Pour la formule annuelle, le paiement est effectue en une seule fois. Pour la formule mensuelle, le prelevement est effectue chaque mois a date anniversaire de souscription."
  },
  {
    title: "5. Droit de retractation",
    text: "Conformement a l'article L221-18 du Code de la consommation, l'Utilisateur dispose d'un delai de 14 jours a compter de la souscription pour exercer son droit de retractation, sans avoir a justifier de motifs. Pour exercer ce droit, l'Utilisateur doit notifier sa decision par email a contact@connectreformer.com. Si l'Utilisateur a expressement demande a commencer les prestations avant l'expiration du delai de retractation, il renonce a son droit de retractation pour les services deja fournis."
  },
  {
    title: "6. Engagement et resiliation",
    text: "La formule mensuelle avec engagement implique un engagement contractuel de 12 mois. En cas de resiliation anticipee, les mensualites restantes dues jusqu'a la fin de la periode d'engagement seront exigibles. La formule annuelle peut etre resiliee a son echeance sans reconduction automatique."
  },
  {
    title: "7. Acces au service",
    text: "L'acces au service est personnel et non cessible. L'Utilisateur s'engage a ne pas partager ses identifiants de connexion. Connect Reformer se reserve le droit de suspendre ou resilier un compte en cas d'utilisation abusive ou de non-paiement."
  },
  {
    title: "8. Propriete intellectuelle",
    text: "L'ensemble des contenus disponibles sur la plateforme (videos, textes, images, programmes) sont la propriete exclusive de Connect Reformer. Toute reproduction, diffusion ou utilisation sans autorisation expresse est strictement interdite."
  },
  {
    title: "9. Donnees personnelles",
    text: "Les donnees collectees lors de l'inscription sont traitees conformement au Reglement General sur la Protection des Donnees (RGPD). Elles sont utilisees uniquement pour la gestion de votre compte et l'amelioration du service. L'Utilisateur dispose d'un droit d'acces, de modification et de suppression de ses donnees en contactant contact@connectreformer.com."
  },
  {
    title: "10. Responsabilite",
    text: "Connect Reformer ne pourra etre tenu responsable des dommages indirects resultant de l'utilisation du service. L'Utilisateur pratique les exercices sous sa propre responsabilite et est invite a consulter un medecin en cas de doute sur son aptitude physique."
  },
  {
    title: "11. Droit applicable",
    text: "Les presentes CGV sont soumises au droit francais. Tout litige sera soumis aux juridictions competentes de Paris, apres tentative de resolution amiable."
  },
  {
    title: "12. Contact",
    text: "Pour toute question relative aux presentes CGV : contact@connectreformer.com"
  },
];

const SECTIONS_EN = [
  {
    title: "1. Purpose",
    text: "These Terms and Conditions govern the contractual relationship between Connect Reformer, an online Pilates platform, and any person wishing to subscribe (the User). Any registration implies full acceptance of these Terms."
  },
  {
    title: "2. Service description",
    text: "Connect Reformer provides access to an online Pilates platform including guided video sessions, progress tracking, and wellness tools. The service is accessible via mobile app and/or web interface."
  },
  {
    title: "3. Subscriptions and pricing",
    text: "Connect Reformer offers two subscription plans: (1) Annual Plan at EUR 588/year (EUR 49/month), no commitment, paid in one payment. (2) Monthly Plan with 12-month commitment at EUR 56/month, totaling EUR 672. Prices are inclusive of all taxes. A EUR 500 bank deposit via Swikly pre-authorization is required for the commitment plan. It is not charged and is released at the end of the commitment period."
  },
  {
    title: "4. Payment terms",
    text: "Payment is made online by credit card through our secure payment provider Stripe. The annual plan is paid in one lump sum. The monthly plan is charged on the anniversary date of subscription each month."
  },
  {
    title: "5. Right of withdrawal",
    text: "In accordance with applicable consumer protection law, the User has 14 days from the date of subscription to exercise their right of withdrawal without justification. To exercise this right, the User must notify their decision by email to contact@connectreformer.com."
  },
  {
    title: "6. Commitment and cancellation",
    text: "The monthly commitment plan implies a 12-month contractual commitment. In case of early cancellation, the remaining monthly payments until the end of the commitment period will be due. The annual plan can be cancelled at its expiry date without automatic renewal."
  },
  {
    title: "7. Service access",
    text: "Access to the service is personal and non-transferable. The User agrees not to share their login credentials. Connect Reformer reserves the right to suspend or terminate an account in case of misuse or non-payment."
  },
  {
    title: "8. Intellectual property",
    text: "All content available on the platform (videos, texts, images, programs) is the exclusive property of Connect Reformer. Any reproduction, distribution or use without express authorization is strictly prohibited."
  },
  {
    title: "9. Personal data",
    text: "Data collected during registration is processed in accordance with GDPR. It is used solely for account management and service improvement. Users have the right to access, modify and delete their data by contacting contact@connectreformer.com."
  },
  {
    title: "10. Liability",
    text: "Connect Reformer shall not be liable for indirect damages resulting from the use of the service. Users practice exercises at their own risk and are advised to consult a doctor if in doubt about their physical fitness."
  },
  {
    title: "11. Governing law",
    text: "These Terms are governed by French law. Any dispute will be submitted to the competent courts of Paris, after an attempt at amicable resolution."
  },
  {
    title: "12. Contact",
    text: "For any questions regarding these Terms: contact@connectreformer.com"
  },
];

export default function CGV() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fr = language === "fr";
  const sections = fr ? SECTIONS_FR : SECTIONS_EN;

  return (
    <div className="min-h-screen bg-background pb-16">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border flex items-center gap-4 px-5 py-4">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground font-body text-lg">
          &larr;
        </button>
        <div>
          <p className="font-body text-[10px] text-primary tracking-widest uppercase">CONNECT REFORMER</p>
          <h1 className="font-display text-xl text-foreground">
            {fr ? "Conditions generales de vente" : "Terms and Conditions"}
          </h1>
        </div>
      </div>

      <div className="px-6 pt-6 max-w-2xl mx-auto">

        {/* Intro */}
        <div className="rounded-2xl bg-primary/5 border border-primary/20 px-5 py-4 mb-6">
          <p className="font-body text-sm text-foreground font-medium mb-1">Connect Reformer</p>
          <p className="font-body text-xs text-muted-foreground">
            {fr
              ? "Derniere mise a jour : 1er janvier 2025"
              : "Last updated: January 1, 2025"}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border px-5 py-4">
              <h2 className="font-body text-sm font-semibold text-foreground mb-2">
                {section.title}
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {section.text}
              </p>
            </div>
          ))}
        </div>

        {/* Accept button */}
        <div className="mt-8 mb-4">
          <button onClick={() => navigate(-1)}
            className="w-full rounded-xl bg-foreground text-background font-body font-semibold py-3">
            {fr ? "J'ai lu et j'accepte les CGV" : "I have read and accept the Terms"}
          </button>
        </div>

        <p className="font-body text-[10px] text-muted-foreground text-center pb-8">
          {fr
            ? "En cliquant sur ce bouton, vous retournez au formulaire d'inscription."
            : "By clicking this button, you return to the registration form."}
        </p>
      </div>
    </div>
  );
}
