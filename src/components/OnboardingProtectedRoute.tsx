import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingProtectedRouteProps {
  children: React.ReactNode;
}

const OnboardingProtectedRoute: React.FC<OnboardingProtectedRouteProps> = ({ children }) => {
  const { user, loading, onboardingComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (onboardingComplete === false) {
        navigate('/onboarding');
      }
    }
  }, [user, loading, onboardingComplete, navigate]);

  if (loading || onboardingComplete === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || onboardingComplete === false) {
    return null;
  }

  return <>{children}</>;
};

export { OnboardingProtectedRoute };
export default OnboardingProtectedRoute;