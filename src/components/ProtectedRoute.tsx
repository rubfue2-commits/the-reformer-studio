import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Splash screen pendant vérification session
  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        backgroundColor: "#F5F3EE",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", width: 36, height: 36 }}>
            <div style={{ position: "absolute", left: 4, top: 2, width: 10, height: 28, borderRadius: 5, backgroundColor: "#1C1B19", transform: "rotate(15deg)" }} />
            <div style={{ position: "absolute", left: 19, top: 4, width: 7, height: 23, borderRadius: 3.5, backgroundColor: "#B8973E", transform: "rotate(15deg)" }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#1C1B19", margin: 0, lineHeight: 1 }}>Connect</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "#B8973E", margin: 0, lineHeight: 1 }}>Reformer</p>
          </div>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E8E4DE", borderTopColor: "#B8973E", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Non connecté → page Auth (Face ID ou email/mdp)
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
