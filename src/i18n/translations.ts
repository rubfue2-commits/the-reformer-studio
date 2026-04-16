export type Language = "en" | "fr";

export const translations = {
  en: {
    auth: {
      welcome: "Welcome back",
      welcomeSub: "Sign in to continue your practice",
      createTitle: "Join the studio",
      createSub: "Begin your Reformer journey",
      tabSignIn: "Sign In",
      tabCreate: "Create Account",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      firstName: "First name",
      lastName: "Last name",
      continueBtn: "Continue",
      apple: "Continue with Apple",
      google: "Continue with Google",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      signUp: "Sign up",
      signIn: "Sign in",
      orDivider: "or",
    },
    onboarding: {
      step: "Step", of: "of", back: "Back", continue: "Continue", getStarted: "Get Started",
      goal: { title: "What's your goal?", sub: "We'll personalize your experience", options: ["Weight Loss", "Toning", "Posture", "Postpartum", "Relaxation"] },
      level: { title: "Your level", sub: "No worries, you can change this later", options: ["Beginner", "Intermediate", "Advanced"], descriptions: ["New to Reformer Pilates", "Comfortable with basics", "Ready for a challenge"] },
      frequency: { title: "How often?", sub: "We recommend 3x per week for best results", options: ["2x per week", "3x per week", "4x per week"] },
      body: { title: "About you", sub: "This helps us track your progress", weight: "Weight (kg)", height: "Height (cm)", weightPlaceholder: "65", heightPlaceholder: "168" },
    },
    home: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", streak: "day streak", sessions: "sessions", recommended: "Recommended for you", startSession: "Start Session", monthlyProgress: "Monthly Progress", sessions_label: "Sessions", totalTime: "Total time", completion: "Completion" },
    nav: { home: "Home", library: "Library", plan: "Plan", progress: "Progress", profile: "Profile" },
    library: { title: "Library", available: "classes available", filters: ["All", "Toning", "Posture", "Core", "Full Body"] },
    planner: { title: "Planner", month: "February 2026", weekCurrent: "Current", scheduled: "Scheduled", noSession: "No session planned", addWorkout: "Add a workout", startSession: "Start Session", thisWeek: "This week" },
    progress: { title: "Progress", sub: "Your journey so far", sessions: "Sessions", timeTrained: "Time Trained", completion: "Completion", weight: "Weight", thisMonth: "this month", total: "total", avgRate: "avg rate", sinceStart: "since start", weightEvolution: "Weight Evolution", lastWeeks: "Last 8 weeks", thisWeek: "This Week" },
    profile: { title: "Profile", annualMember: "Annual Member", premiumSub: "Premium Subscription", renews: "Renews March 15, 2027", active: "Active", unlimited: "Unlimited access", totalSessions: "Total sessions", timeInvested: "Time invested", dayStreak: "Day streak", notifications: "Notifications", preferences: "Preferences", help: "Help & Support", signOut: "Sign Out" },
  },
  fr: {
    auth: { welcome: "Bon retour", welcomeSub: "Connectez-vous pour continuer votre pratique", createTitle: "Rejoindre le studio", createSub: "Commencez votre parcours Reformer", tabSignIn: "Connexion", tabCreate: "Creer un compte", email: "Adresse e-mail", password: "Mot de passe", confirmPassword: "Confirmer le mot de passe", firstName: "Prenom", lastName: "Nom", continueBtn: "Continuer", apple: "Continuer avec Apple", google: "Continuer avec Google", forgotPassword: "Mot de passe oublie ?", noAccount: "Pas encore de compte ?", hasAccount: "Deja un compte ?", signUp: "S'inscrire", signIn: "Se connecter", orDivider: "ou" },
    onboarding: {
      step: "Etape", of: "sur", back: "Retour", continue: "Continuer", getStarted: "Commencer",
      goal: { title: "Quel est votre objectif ?", sub: "Nous personnaliserons votre experience", options: ["Perte de poids", "Tonification", "Posture", "Post-partum", "Relaxation"] },
      level: { title: "Votre niveau", sub: "Vous pourrez le modifier plus tard", options: ["Debutant", "Intermediaire", "Avance"], descriptions: ["Nouveau au Reformer Pilates", "A l'aise avec les bases", "Pret pour un defi"] },
      frequency: { title: "A quelle frequence ?", sub: "Nous recommandons 3x par semaine", options: ["2x par semaine", "3x par semaine", "4x par semaine"] },
      body: { title: "A votre sujet", sub: "Cela nous aide a suivre vos progres", weight: "Poids (kg)", height: "Taille (cm)", weightPlaceholder: "65", heightPlaceholder: "168" },
    },
    home: { morning: "Bonjour", afternoon: "Bon apres-midi", evening: "Bonsoir", streak: "jours consecutifs", sessions: "seances", recommended: "Recommande pour vous", startSession: "Demarrer la seance", monthlyProgress: "Progres du mois", sessions_label: "Seances", totalTime: "Temps total", completion: "Completion" },
    nav: { home: "Accueil", library: "Videos", plan: "Planning", progress: "Progres", profile: "Profil" },
    library: { title: "Videotheque", available: "cours disponibles", filters: ["Tout", "Tonification", "Posture", "Abdos", "Corps entier"] },
    planner: { title: "Planning", month: "Fevrier 2026", weekCurrent: "Cette semaine", scheduled: "Planifie", noSession: "Aucune seance prevue", addWorkout: "Ajouter un cours", startSession: "Demarrer la seance", thisWeek: "Cette semaine" },
    progress: { title: "Progres", sub: "Votre parcours jusqu'ici", sessions: "Seances", timeTrained: "Temps d'entrainement", completion: "Completion", weight: "Poids", thisMonth: "ce mois", total: "total", avgRate: "taux moyen", sinceStart: "depuis le debut", weightEvolution: "Evolution du poids", lastWeeks: "8 dernieres semaines", thisWeek: "Cette semaine" },
    profile: { title: "Profil", annualMember: "Membre annuel", premiumSub: "Abonnement Premium", renews: "Renouvellement le 15 mars 2027", active: "Actif", unlimited: "Acces illimite", totalSessions: "Seances totales", timeInvested: "Temps investi", dayStreak: "Jours consecutifs", notifications: "Notifications", preferences: "Preferences", help: "Aide & Support", signOut: "Se deconnecter" },
  },
};

export type Translations = typeof translations.en;
