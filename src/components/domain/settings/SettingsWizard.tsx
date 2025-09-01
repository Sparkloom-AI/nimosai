import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/contexts/RoleContext';
import SettingsBusinessSetupForm from './wizard/SettingsBusinessSetupForm';
import SettingsBusinessCategoryForm from './wizard/SettingsBusinessCategoryForm';
import SettingsSocialMediaForm from './wizard/SettingsSocialMediaForm';
import SettingsLocationsForm from './wizard/SettingsLocationsForm';

interface SettingsWizardProps {
  onClose: () => void;
}

type WizardStep = 'business-info' | 'categories' | 'social-media' | 'locations' | 'complete';

const SettingsWizard: React.FC<SettingsWizardProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('business-info');
  const [isLoading, setIsLoading] = useState(false);
  const { currentStudio, refreshRoles } = useRole();

  const steps = [
    { id: 'business-info', title: 'Business Info', description: 'Basic business details' },
    { id: 'categories', title: 'Categories', description: 'Business categories' },
    { id: 'social-media', title: 'Social Media', description: 'Social media links' },
    { id: 'locations', title: 'Locations', description: 'Locations & hours' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id as WizardStep);
    } else {
      setCurrentStep('complete');
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id as WizardStep);
    }
  };

  const handleStepComplete = async (data: any) => {
    console.log('Step completed with data:', data);
    handleNext();
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await refreshRoles();
      toast.success('Settings updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error finishing wizard:', error);
      toast.error('Failed to complete wizard');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentStudio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No studio found. Please try again later.</p>
            <Button onClick={onClose} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Left side - Completion */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">
                Settings Updated Successfully!
              </h1>
              <p className="text-muted-foreground">
                Your business information has been updated. You can always return to this wizard to make changes.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onClose}>
                Back to Settings
              </Button>
              <Button onClick={handleFinish} disabled={isLoading}>
                {isLoading ? 'Finishing...' : 'Finish'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block flex-1 bg-muted relative overflow-hidden">
          <img
            src="/lovable-uploads/5101447c-92ce-49c1-8837-5de26eeff4b6.png"
            alt="Professional using Nimos"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="text-2xl font-bold mb-2">All Set!</h2>
            <p className="text-white/90 text-lg">
              Your business settings have been updated successfully
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={currentStepIndex === 0 ? onClose : handleBack}
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStepIndex === 0 ? 'Back to Settings' : 'Back'}
            </Button>

            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStepIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="w-16" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1">
        {currentStep === 'business-info' && (
          <SettingsBusinessSetupForm 
            currentStudio={currentStudio}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'categories' && (
          <SettingsBusinessCategoryForm 
            currentStudio={currentStudio}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'social-media' && (
          <SettingsSocialMediaForm 
            currentStudio={currentStudio}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'locations' && (
          <SettingsLocationsForm 
            currentStudio={currentStudio}
            onComplete={() => handleNext()}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsWizard;