import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading, accountSetupComplete, studioSetupComplete } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (accountSetupComplete === false) {
        navigate('/onboarding/account');
      } else if (studioSetupComplete === false) {
        navigate('/onboarding/studio');
      } else if (accountSetupComplete === true && studioSetupComplete === true) {
        navigate('/dashboard');
      }
    }
  }, [user, loading, accountSetupComplete, studioSetupComplete, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Onboarding;