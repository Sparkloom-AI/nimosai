
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, accountSetupComplete, studioSetupComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user authenticated, redirect to auth
        navigate('/auth');
      } else if (accountSetupComplete === false) {
        // Account setup incomplete, redirect to auth (register step)
        navigate('/auth');
      } else if (studioSetupComplete === false) {
        // Account setup complete but studio setup incomplete
        navigate('/onboarding/studio');
      }
      // If both are true, allow access to protected routes
    }
  }, [user, loading, accountSetupComplete, studioSetupComplete, navigate]);

  if (loading || accountSetupComplete === null || studioSetupComplete === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || accountSetupComplete === false || studioSetupComplete === false) {
    return null;
  }

  return <>{children}</>;
};

export { ProtectedRoute };
export default ProtectedRoute;
