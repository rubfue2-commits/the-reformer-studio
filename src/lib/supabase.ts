import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://foxeaycfzqtpqyhkzjee.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveGVheWNmenF0cHF5aGt6amVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODM0MjksImV4cCI6MjA5MjI1OTQyOX0.E1OunH3E9S157IDZOpBXYPEaLjCBNDiSoCRhyaUykmQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persiste la session dans localStorage — survit aux refreshs et fermetures d'app
    persistSession: true,
    // Renouvelle automatiquement le token avant expiration
    autoRefreshToken: true,
    // Détecte automatiquement la session au démarrage
    detectSessionInUrl: false,
    // Stockage — localStorage fonctionne dans Capacitor iOS
    storage: window.localStorage,
  },
});
