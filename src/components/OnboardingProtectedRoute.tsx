import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingProtectedRouteProps {
  children: React.ReactNode;
}

const OnboardingProtectedRoute: React.FC<OnboardingProtectedRouteProps> = ({ children }) => {
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
      } else if (accountSetupComplete === true && studioSetupComplete === false) {
        // This is the correct state for onboarding routes - allow access
        return;
      } else if (accountSetupComplete === true && studioSetupComplete === true) {
        // Both setups complete, redirect to dashboard
        navigate('/dashboard');
      }
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

  // Only block if user is not authenticated or account setup is incomplete
  // Allow access if account setup is complete but studio setup is incomplete (this is the onboarding state)
  if (!user || accountSetupComplete === false) {
    return null;
  }

  return <>{children}</>;
};

export { OnboardingProtectedRoute };
export default OnboardingProtectedRoute;