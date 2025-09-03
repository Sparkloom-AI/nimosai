import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessionalAccountWizard from '@/components/domain/auth/ProfessionalAccountWizard';

const OnboardingAccount = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/onboarding/studio');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Nimos!</h1>
            <p className="text-muted-foreground">Let's start by setting up your professional account.</p>
          </div>
          
          <ProfessionalAccountWizard onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};

export default OnboardingAccount;