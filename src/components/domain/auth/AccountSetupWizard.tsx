import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Building, Users } from 'lucide-react';
import { toast } from 'sonner';
import BusinessSetupForm from './BusinessSetupForm';
import BusinessCategoryForm from './BusinessCategoryForm';
import BusinessSetupComplete from './BusinessSetupComplete';
import { ProfileStep } from '../settings/wizard/steps/ProfileStep';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';
import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  country: string;
  countryCode: string;
  phonePrefix: string;
  timezone: string;
  currency: string;
  language: string;
}

interface AccountSetupWizardProps {
  onComplete: () => void;
  locationData?: LocationData;
}

const AccountSetupWizard: React.FC<AccountSetupWizardProps> = ({ onComplete, locationData }) => {
  const [step, setStep] = useState<'profile' | 'business-setup' | 'business-categories' | 'complete'>('profile');
  const [businessData, setBusinessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshRoles, setCurrentStudioId } = useRole();


  const handleProfileComplete = () => {
    setStep('business-setup');
  };

  const handleBusinessSetupComplete = (data: any) => {
    setBusinessData(data);
    setStep('business-categories');
  };

  const handleCategoriesComplete = async (data: { primary: string; additional: string[] }) => {
    const completeBusinessData = {
      ...businessData,
      business_category_id: data.primary,
      additional_category_ids: data.additional,
    };
    setBusinessData(completeBusinessData);
    setStep('complete');
  };

  const handleSetupComplete = async () => {
    if (!businessData) return;

    setIsLoading(true);
    try {
      console.log('AccountSetupWizard: Creating studio with complete business data:', businessData);
      
      // Verify user authentication state before proceeding
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Please ensure you are logged in before creating a studio.');
      }

      console.log('AccountSetupWizard: User verified, proceeding with studio creation');

      // Create the studio in the database with all captured data
      const studio = await studiosApi.createStudio({
        name: businessData.businessName,
        website: businessData.website,
        description: businessData.description,
        phone: businessData.phone,
        email: businessData.email,
        business_category_id: businessData.business_category_id,
        additional_category_ids: businessData.additional_category_ids,
        // Location data will be handled in profile setup
        // No location data passed from auth anymore
      });

      console.log('AccountSetupWizard: Studio created successfully:', studio);

      // Set the new studio as the current context immediately
      setCurrentStudioId(studio.id);
      
      // Refresh roles to get the newly assigned studio_owner role
      await refreshRoles();

      toast.success('Studio created successfully!');
      onComplete();
    } catch (error: any) {
      console.error('AccountSetupWizard: Error creating studio:', error);
      
      // Provide user-friendly error messages based on error type
      let errorMessage = 'Failed to create studio. Please try again.';
      
      if (error.message?.includes('not authenticated')) {
        errorMessage = 'Authentication issue detected. Please sign out and sign back in, then try again.';
      } else if (error.message?.includes('already exists')) {
        errorMessage = 'You already have a studio. Redirecting to dashboard...';
        setTimeout(() => onComplete(), 2000);
      } else if (error.message?.includes('User does not exist')) {
        errorMessage = 'Profile synchronization issue. Please wait a moment and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'business-categories') {
      setStep('business-setup');
    } else if (step === 'business-setup') {
      setStep('profile');
    }
  };

  if (step === 'complete') {
    return (
      <BusinessSetupComplete
        onComplete={handleSetupComplete}
        isLoading={isLoading}
      />
    );
  }

  if (step === 'business-categories') {
    return (
      <BusinessCategoryForm
        onBack={handleBack}
        onComplete={handleCategoriesComplete}
      />
    );
  }

  if (step === 'business-setup') {
    return (
      <BusinessSetupForm
        onBack={handleBack}
        onComplete={handleBusinessSetupComplete}
      />
    );
  }

  return (
    <ProfileStep
      onNext={handleProfileComplete}
      hasNext={true}
      hasPrevious={false}
    />
  );
};

export default AccountSetupWizard;