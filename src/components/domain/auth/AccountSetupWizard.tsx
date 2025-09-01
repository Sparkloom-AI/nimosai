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
      
      // Create the studio in the database with all captured data
      const studio = await studiosApi.createStudio({
        name: businessData.businessName,
        website: businessData.website,
        description: businessData.description,
        phone: businessData.phone,
        email: businessData.email,
        business_category_id: businessData.business_category_id,
        additional_category_ids: businessData.additional_category_ids,
      });

      console.log('AccountSetupWizard: Studio created successfully:', studio);

      // Refresh roles to get the newly assigned studio_owner role
      await refreshRoles();
      
      // Set the new studio as the current context
      setCurrentStudioId(studio.id);

      toast.success('Studio created successfully!');
      onComplete();
    } catch (error: any) {
      console.error('AccountSetupWizard: Error creating studio:', error);
      toast.error(error.message || 'Failed to create studio. Please try again.');
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