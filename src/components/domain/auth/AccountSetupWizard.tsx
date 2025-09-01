import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Building, Users } from 'lucide-react';
import { toast } from 'sonner';
import BusinessSetupForm from './BusinessSetupForm';
import BusinessCategoryForm from './BusinessCategoryForm';
import BusinessSetupComplete from './BusinessSetupComplete';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';
import { supabase } from '@/integrations/supabase/client';

interface AccountSetupWizardProps {
  onComplete: () => void;
}

const AccountSetupWizard: React.FC<AccountSetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'business-setup' | 'business-categories' | 'complete'>('business-setup');
  const [businessData, setBusinessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshRoles, setCurrentStudioId } = useRole();


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

      // Retry logic for studio creation with exponential backoff
      let attempt = 0;
      const maxAttempts = 3;
      let studio;

      while (attempt < maxAttempts) {
        try {
          attempt++;
          console.log(`AccountSetupWizard: Studio creation attempt ${attempt}/${maxAttempts}`);
          
          // Create the studio in the database with all captured data
          studio = await studiosApi.createStudio({
            name: businessData.businessName,
            website: businessData.website,
            description: businessData.description,
            phone: businessData.phone,
            email: businessData.email,
            business_category_id: businessData.business_category_id,
            additional_category_ids: businessData.additional_category_ids,
          });

          console.log('AccountSetupWizard: Studio created successfully:', studio);
          break; // Success, exit retry loop

        } catch (retryError: any) {
          console.error(`AccountSetupWizard: Studio creation attempt ${attempt} failed:`, retryError);
          
          if (attempt === maxAttempts) {
            throw retryError; // Last attempt failed, propagate error
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`AccountSetupWizard: Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      if (!studio) {
        throw new Error('Failed to create studio after all retry attempts.');
      }

      // Refresh roles to get the newly assigned studio_owner role
      await refreshRoles();
      
      // Set the new studio as the current context
      setCurrentStudioId(studio.id);

      toast.success('Studio created successfully!');
      onComplete();
    } catch (error: any) {
      console.error('AccountSetupWizard: Error creating studio:', error);
      
      // Provide user-friendly error messages based on error type
      let errorMessage = 'Failed to create studio. Please try again.';
      
      if (error.message?.includes('auth.users')) {
        errorMessage = 'Authentication issue detected. Please sign out and sign back in, then try again.';
      } else if (error.message?.includes('foreign key constraint')) {
        errorMessage = 'Database synchronization issue. Please wait a moment and try again.';
      } else if (error.message?.includes('already exists')) {
        errorMessage = 'You already have a studio. Redirecting to dashboard...';
        setTimeout(() => onComplete(), 2000);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'business-categories') {
      setStep('business-setup');
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

  return (
    <BusinessSetupForm
      onBack={handleBack}
      onComplete={handleBusinessSetupComplete}
    />
  );
};

export default AccountSetupWizard;