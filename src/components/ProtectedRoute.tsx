import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface ProtectedRouteProps {
  children: ReactNode;
  requireSubscription?: boolean;
}

function FullscreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function ProtectedRoute({ children, requireSubscription = false }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, isActive } = useSubscription();
  const location = useLocation();

  // 1. Auth loading
  if (authLoading) return <FullscreenLoader />;

  // 2. Not logged in → auth page
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // 3. Subscription check required
  if (requireSubscription) {
    if (subLoading) return <FullscreenLoader />;

    // No subscription or not active → subscription page
    if (!isActive) {
      return <Navigate to="/subscription" replace />;
    }
  }

  return <>{children}</>;
}
