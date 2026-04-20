import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean; // réservé pour plus tard — ignoré pour l'instant
}

function FullscreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenLoader />;

  // Non connecté → page d'auth
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // ⚠️  Vérification d'abonnement désactivée temporairement.
  // À réactiver une fois Stripe + Swikly configurés :
  //
  //   if (requireSubscription && !isActive) {
  //     return <Navigate to="/subscription" replace />;
  //   }

  return <>{children}</>;
}
