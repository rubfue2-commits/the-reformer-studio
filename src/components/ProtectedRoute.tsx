import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EmailPending from "@/pages/EmailPending";
import SubscriptionPending from "@/pages/SubscriptionPending";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  // Chargement en cours
  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", backgroundColor: "#F5F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid rgba(28,27,25,0.1)", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Non connecté → page Auth
  if (!user) return <Navigate to="/auth" replace />;

  // Email non confirmé → page confirmation
  if (!user.email_confirmed_at) return <EmailPending />;

  // PAYWALL — passer à true au lancement public pour réserver l'app aux abonnées.
  // (false pendant la bêta TestFlight : les testeuses en gifting gardent l'accès)
  const PAYWALL_ENABLED = false;
  if (PAYWALL_ENABLED && profile && !profile.has_active_subscription) return <SubscriptionPending />;

  // Tout est bon → accès complet
  return <>{children}</>;
}
