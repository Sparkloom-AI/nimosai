import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSetupWizard from '@/components/domain/auth/AccountSetupWizard';
import { useAuth } from '@/contexts/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const handleOnboardingComplete = async () => {
    await completeOnboarding();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Nimos!</h1>
            <p className="text-muted-foreground">Let's set up your wellness studio to get started.</p>
          </div>
          
          <AccountSetupWizard onComplete={handleOnboardingComplete} />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;