import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.connectreformer.app',
  appName: 'Connect Reformer',
  webDir: 'dist',

  server: {
    androidScheme: 'https',
    // Pas de iosScheme — Capacitor utilise capacitor:// par défaut (obligatoire pour iOS)
    hostname: 'app',
    cleartext: false,
  },

  ios: {
    scheme: 'connectreformer',
    backgroundColor: '#F5F3EE',
    allowsLinkPreview: false,
    scrollEnabled: true,
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F5F3EE',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Light',
      backgroundColor: '#F5F3EE',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'light',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
