import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Identifiant unique de l'app — doit correspondre à ton App Store Connect
  appId: 'com.connectreformer.app',
  appName: 'Connect Reformer',

  // Dossier du build Vite — Capacitor copie ce dossier dans iOS
  webDir: 'dist',

  // Serveur — en dev on peut pointer vers Lovable pour le live reload
  // En production, laisser vide (Capacitor sert les fichiers locaux)
  server: {
    // Décommenter uniquement pour le développement avec live reload :
    // url: 'https://13ad92f0-7f5e-4e57-a157-e0c39dab6430.lovableproject.com',
    // cleartext: false,
    androidScheme: 'https',
    iosScheme: 'https',
  },

  ios: {
    // Scheme URL pour les deep links (OAuth, etc.)
    scheme: 'connectreformer',

    // Couleur de la status bar
    backgroundColor: '#F5F3EE',

    // Permet les requêtes vers Supabase sans erreur SSL
    allowsLinkPreview: false,

    // Empêche le scroll rebond natif iOS (pour un rendu app natif)
    scrollEnabled: false,

    // Préférence de couleur — auto = suit le mode sombre du téléphone
    preferredContentMode: 'mobile',
  },

  plugins: {
    // Écran de démarrage
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F5F3EE',
      // androidSplashResourceName: 'splash',
      // iosSplashResourceName: 'Default',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },

    // Status bar iOS
    StatusBar: {
      style: 'Light',         // texte noir sur fond clair
      backgroundColor: '#F5F3EE',
      overlaysWebView: false,
    },

    // Clavier — évite que le clavier pousse le contenu
    Keyboard: {
      resize: 'body',
      style: 'light',
      resizeOnFullScreen: true,
    },

    // Push notifications — à configurer avec Firebase plus tard
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
