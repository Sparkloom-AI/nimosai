import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSetupWizard from '@/components/domain/auth/AccountSetupWizard';
import { useAuth } from '@/contexts/AuthContext';
const OnboardingStudio = () => {
  const navigate = useNavigate();
  const {
    completeStudioSetup
  } = useAuth();
  const handleOnboardingComplete = async () => {
    await completeStudioSetup();
    navigate('/dashboard');
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