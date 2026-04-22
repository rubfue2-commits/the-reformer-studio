import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (frOrKey: string, en?: string) => string;
}

// ============================================================
// DICTIONNAIRE COMPLET FR / EN
// ============================================================
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.home":         { fr: "Accueil",    en: "Home"     },
  "nav.sessions":     { fr: "Seances",    en: "Sessions" },
  "nav.progress":     { fr: "Progres",    en: "Progress" },
  "nav.profile":      { fr: "Profil",     en: "Profile"  },

  // Auth
  "auth.signin":      { fr: "Connexion",            en: "Sign in"       },
  "auth.signup":      { fr: "Inscription",           en: "Sign up"       },
  "auth.signout":     { fr: "Se deconnecter",        en: "Sign out"      },
  "auth.firstname":   { fr: "Prenom",                en: "First name"    },
  "auth.lastname":    { fr: "Nom",                   en: "Last name"     },
  "auth.email":       { fr: "Email",                 en: "Email"         },
  "auth.password":    { fr: "Mot de passe",          en: "Password"      },
  "auth.forgot":      { fr: "Mot de passe oublie ?", en: "Forgot password?" },
  "auth.reset":       { fr: "Reinitialiser le mot de passe", en: "Reset password" },
  "auth.send_link":   { fr: "Envoyer le lien",       en: "Send link"     },
  "auth.create":      { fr: "Creer mon compte",      en: "Create account"},
  "auth.connect":     { fr: "Se connecter",          en: "Sign in"       },
  "auth.apple":       { fr: "Continuer avec Apple",  en: "Continue with Apple" },
  "auth.google":      { fr: "Continuer avec Google", en: "Continue with Google" },
  "auth.or":          { fr: "ou",                    en: "or"            },
  "auth.back":        { fr: "Retour",                en: "Back"          },
  "auth.email_sent":  { fr: "Email envoye !",        en: "Email sent!"   },
  "auth.created":     { fr: "Compte cree !",         en: "Account created!" },
  "auth.invalid":     { fr: "Email ou mot de passe incorrect", en: "Invalid email or password" },
  "auth.too_short":   { fr: "Mot de passe trop court (8 min)", en: "Password too short (8 min)" },
  "auth.cgv_required":{ fr: "Veuillez accepter les conditions generales de vente", en: "Please accept the terms and conditions" },
  "auth.cgv_text":    { fr: "J'accepte les",         en: "I accept the"  },
  "auth.cgv_link":    { fr: "conditions generales de vente", en: "terms and conditions" },
  "auth.cgv_brand":   { fr: "de Connect Reformer.",  en: "of Connect Reformer." },
  "auth.tagline":     { fr: "Pilates · Bien-etre",   en: "Pilates · Wellness" },
  "auth.back_to_login": { fr: "Retour a la connexion", en: "Back to sign in" },

  // Language
  "lang.choose":      { fr: "Choisissez votre langue", en: "Choose your language" },
  "lang.later":       { fr: "Vous pouvez changer cela dans votre profil", en: "You can change this in your profile" },
  "lang.fr_sub":      { fr: "Continuer en francais",   en: "Continue in French"   },
  "lang.en_sub":      { fr: "Continuer en anglais",    en: "Continue in English"  },

  // Onboarding
  "onb.goals":        { fr: "Tes objectifs",     en: "Your goals"      },
  "onb.level":        { fr: "Ton niveau",        en: "Your level"      },
  "onb.frequency":    { fr: "Ta frequence",      en: "Your frequency"  },
  "onb.focus":        { fr: "Zones cibles",      en: "Focus areas"     },
  "onb.continue":     { fr: "Continuer",         en: "Continue"        },
  "onb.start":        { fr: "Commencer !",       en: "Start!"          },
  "onb.sessions_week":{ fr: "Seances par semaine", en: "Sessions per week" },
  "onb.per_week":     { fr: "semaine",           en: "week"            },
  "onb.beginner":     { fr: "Debutante",         en: "Beginner"        },
  "onb.intermediate": { fr: "Intermediaire",     en: "Intermediate"    },
  "onb.advanced":     { fr: "Avancee",           en: "Advanced"        },
  "onb.beg_desc":     { fr: "Je commence",       en: "Just starting"   },
  "onb.int_desc":     { fr: "Quelques mois",     en: "A few months"    },
  "onb.adv_desc":     { fr: "Plus de un an",     en: "Over a year"     },
  "onb.weight_loss":  { fr: "Perte de poids",    en: "Weight loss"     },
  "onb.strength":     { fr: "Renforcement",      en: "Strength"        },
  "onb.flexibility":  { fr: "Souplesse",         en: "Flexibility"     },
  "onb.posture":      { fr: "Posture",           en: "Posture"         },
  "onb.rehab":        { fr: "Reeducation",       en: "Rehab"           },
  "onb.relaxation":   { fr: "Relaxation",        en: "Relaxation"      },
  "onb.core":         { fr: "Abdos",             en: "Core"            },
  "onb.legs":         { fr: "Jambes",            en: "Legs"            },
  "onb.arms":         { fr: "Bras",              en: "Arms"            },
  "onb.back":         { fr: "Dos",               en: "Back"            },
  "onb.full_body":    { fr: "Corps entier",      en: "Full body"       },

  // Home
  "home.good_morning":{ fr: "Bonjour",           en: "Good morning"    },
  "home.good_afternoon":{ fr: "Bon apres-midi",  en: "Good afternoon"  },
  "home.good_evening":{ fr: "Bonsoir",           en: "Good evening"    },
  "home.streak":      { fr: "Streak actuel",     en: "Current streak"  },
  "home.days":        { fr: "jours",             en: "days"            },
  "home.sessions":    { fr: "Seances",           en: "Sessions"        },
  "home.this_week":   { fr: "Cette sem.",        en: "This week"       },
  "home.minutes":     { fr: "Minutes",           en: "Minutes"         },
  "home.start_now":   { fr: "Commencer maintenant", en: "Start now"    },
  "home.see_all":     { fr: "Voir toutes les seances", en: "View all sessions" },
  "home.coming_soon": { fr: "Videos bientot disponibles", en: "Videos coming soon" },
  "home.loading":     { fr: "Chargement...",     en: "Loading..."      },
  "home.beginner":    { fr: "Debutant",          en: "Beginner"        },
  "home.intermediate":{ fr: "Intermediaire",     en: "Intermediate"    },
  "home.advanced":    { fr: "Avance",            en: "Advanced"        },

  // Library
  "lib.sessions":     { fr: "Seances",           en: "Sessions"        },
  "lib.all":          { fr: "Toutes",            en: "All"             },
  "lib.beginner":     { fr: "Debutant",          en: "Beginner"        },
  "lib.intermediate": { fr: "Intermediaire",     en: "Intermediate"    },
  "lib.advanced":     { fr: "Avance",            en: "Advanced"        },
  "lib.soon":         { fr: "Bientot",           en: "Soon"            },
  "lib.coming_soon":  { fr: "Bientot disponible", en: "Coming soon"   },
  "lib.coming_text":  { fr: "Les videos arrivent bientot !", en: "Videos coming soon!" },
  "lib.done":         { fr: "Seance terminee !", en: "Session done!"   },
  "lib.loading":      { fr: "Chargement...",     en: "Loading..."      },

  // Progress
  "prog.progress":    { fr: "Progres",           en: "Progress"        },
  "prog.measure":     { fr: "Mesure",            en: "Measure"         },
  "prog.weight":      { fr: "Poids",             en: "Weight"          },
  "prog.waist":       { fr: "Taille",            en: "Waist"           },
  "prog.hips":        { fr: "Hanches",           en: "Hips"            },
  "prog.chest":       { fr: "Poitrine",          en: "Chest"           },
  "prog.thigh":       { fr: "Cuisse",            en: "Thigh"           },
  "prog.arm":         { fr: "Bras",              en: "Arm"             },
  "prog.no_data":     { fr: "Aucune donnee",     en: "No data"         },
  "prog.add":         { fr: "Ajouter des mesures pour voir ton evolution", en: "Add measurements to track progress" },
  "prog.history":     { fr: "Historique",        en: "History"         },
  "prog.latest":      { fr: "Dernier",           en: "Latest"          },
  "prog.new":         { fr: "Nouvelle mesure",   en: "New measurement" },
  "prog.save":        { fr: "Enregistrer",       en: "Save"            },

  // Profile
  "prof.profile":     { fr: "Profil",            en: "Profile"         },
  "prof.edit":        { fr: "Modifier",          en: "Edit"            },
  "prof.done":        { fr: "OK",                en: "Done"            },
  "prof.goals":       { fr: "Mes objectifs",     en: "My goals"        },
  "prof.level":       { fr: "Niveau",            en: "Level"           },
  "prof.frequency":   { fr: "Frequence",         en: "Frequency"       },
  "prof.per_week":    { fr: "sem.",              en: "week"            },
  "prof.settings":    { fr: "Reglages",          en: "Settings"        },
  "prof.language":    { fr: "Langue",            en: "Language"        },
  "prof.measurements":{ fr: "Mes mesures",       en: "Measurements"    },
  "prof.subscription":{ fr: "Abonnement",        en: "Subscription"    },
  "prof.signout":     { fr: "Se deconnecter",    en: "Sign out"        },
  "prof.signout_q":   { fr: "Se deconnecter ?",  en: "Sign out?"       },
  "prof.signout_txt": { fr: "Tu pourras te reconnecter a tout moment.", en: "You can sign back in anytime." },
  "prof.cancel":      { fr: "Annuler",           en: "Cancel"          },
  "prof.confirm_so":  { fr: "Deconnecter",       en: "Sign out"        },
  "prof.sessions":    { fr: "Seances",           en: "Sessions"        },
  "prof.minutes":     { fr: "Minutes",           en: "Minutes"         },
  "prof.streak":      { fr: "Streak",            en: "Streak"          },
  "prof.no_goals":    { fr: "Aucun objectif",    en: "No goals"        },
  "prof.firstname":   { fr: "Prenom",            en: "First name"      },
  "prof.lastname":    { fr: "Nom",               en: "Last name"       },
  "prof.your_name":   { fr: "Ton nom",           en: "Your name"       },

  // Subscription
  "sub.launch_soon":  { fr: "Lancement bientot", en: "Launching soon"  },
  "sub.choose":       { fr: "Choisir ta formule", en: "Choose your plan" },
  "sub.pre_register": { fr: "Preinscris-toi maintenant", en: "Pre-register now" },
  "sub.deposit":      { fr: "Caution bancaire 500 EUR", en: "Bank deposit 500 EUR" },
  "sub.deposit_txt":  { fr: "Pre-autorisation via Swikly - Non debitee - Liberee en fin d'abonnement", en: "Pre-authorization via Swikly - Not charged - Released at end" },
  "sub.annual":       { fr: "Annuel",            en: "Annual"          },
  "sub.monthly":      { fr: "Mensuel 12 mois",   en: "Monthly 12 months" },
  "sub.year":         { fr: "an",                en: "year"            },
  "sub.month":        { fr: "mois",              en: "month"           },
  "sub.reserve":      { fr: "Je reserve ma place ->", en: "Reserve my spot ->" },
  "sub.confirmed":    { fr: "Preinscription confirmee !", en: "Pre-registration confirmed!" },
  "sub.skip":         { fr: "Acceder a la plateforme pour l'instant", en: "Access the platform for now" },
  "sub.recommended":  { fr: "Recommande",        en: "Recommended"     },
  "sub.no_commit":    { fr: "Sans engagement",   en: "No commitment"   },
  "sub.commitment":   { fr: "Engagement 12 mois", en: "12-month commitment" },

  // CGV
  "cgv.title":        { fr: "Conditions generales de vente", en: "Terms and Conditions" },
  "cgv.updated":      { fr: "Derniere mise a jour : 1er janvier 2025", en: "Last updated: January 1, 2025" },
  "cgv.accept":       { fr: "J'ai lu et j'accepte les CGV", en: "I have read and accept the Terms" },
  "cgv.back_note":    { fr: "En cliquant, vous retournez au formulaire.", en: "By clicking, you return to the form." },

  // General
  "gen.loading":      { fr: "Chargement...",     en: "Loading..."      },
  "gen.save":         { fr: "Enregistrer",       en: "Save"            },
  "gen.cancel":       { fr: "Annuler",           en: "Cancel"          },
  "gen.back":         { fr: "Retour",            en: "Back"            },
  "gen.or":           { fr: "ou",                en: "or"              },
  "gen.min":          { fr: "min",               en: "min"             },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem("cr_language");
    return (stored === "fr" || stored === "en") ? stored : "fr";
  });

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem("cr_language", lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // t() function: supports both key-based and inline (fr, en) usage
  const t = (fr: string, en?: string): string => {
    // If called with a key (no second arg) -> look up dictionary
    if (en === undefined) {
      return translations[fr]?.[language] ?? fr;
    }
    // If called inline t(fr, en) -> return based on language
    return language === "fr" ? fr : en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
