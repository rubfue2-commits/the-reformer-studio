import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // Capacitor requiert que les assets utilisent des chemins relatifs
    // (pas des chemins absolus commençant par /)
    outDir: "dist",

    rollupOptions: {
      output: {
        // Chunking pour optimiser le chargement sur iOS
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["framer-motion", "lucide-react"],
        },
      },
    },
  },

  server: {
    host: "::",
    port: 8080,
  },
}));
