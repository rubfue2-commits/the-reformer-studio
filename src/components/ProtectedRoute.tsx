import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * ProtectedRoute — garde les pages privées.
 *
 * Comportement sur iOS au démarrage :
 * 1. loading = true  → affiche un écran crème (pas de redirect)
 * 2. loading = false + user = null  → redirect vers /auth
 * 3. loading = false + user = ok   → affiche la page normalement
 *
 * Cela évite le "flash" vers /auth quand l'app se relance
 * alors que l'utilisateur était déjà connecté.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Phase de vérification — afficher un fond crème neutre
  // (jamais un redirect pendant ce temps)
  if (loading) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#F5F3EE",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}>
        {/* Logo textuel */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 28,
            fontWeight: 300,
            color: "#1C1B19",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}>
            Connect
          </p>
          <p style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 28,
            fontWeight: 300,
            color: "#B8973E",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}>
            Reformer
          </p>
        </div>
        {/* Spinner discret */}
        <div style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "2px solid #E8E4DE",
          borderTopColor: "#B8973E",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Session vérifiée — pas d'utilisateur → login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Session valide → page protégée
  return <>{children}</>;
}
