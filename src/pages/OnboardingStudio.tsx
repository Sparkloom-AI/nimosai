import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSetupWizard from '@/components/domain/auth/AccountSetupWizard';
import { useAuth } from '@/contexts/AuthContext';
const OnboardingStudio = () => {
  const navigate = useNavigate();
  const {
    completeStudioSetup,
    completeAccountSetup
  } = useAuth();
  const handleOnboardingComplete = async () => {
    try {
      // Ensure both flags are set so protected routes allow dashboard
      await completeAccountSetup();
      await completeStudioSetup();
      // Clear any stored email data
      try {
        localStorage.removeItem('pendingSignupEmail');
      } catch {}
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete studio setup:', error);
      // Still navigate to dashboard as fallback
      navigate('/dashboard');
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          
          <AccountSetupWizard onComplete={handleOnboardingComplete} />
        </div>
      </div>
    </div>;
};
export default OnboardingStudio;