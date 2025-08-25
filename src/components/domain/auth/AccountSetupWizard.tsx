import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Building, Users } from 'lucide-react';
import BusinessSetupForm from './BusinessSetupForm';
import BusinessCategoryForm from './BusinessCategoryForm';
import BusinessSetupComplete from './BusinessSetupComplete';

interface AccountSetupWizardProps {
  onComplete: (setupType: 'create' | 'join', businessData?: any) => void;
}

const AccountSetupWizard: React.FC<AccountSetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'choice' | 'business-setup' | 'business-categories' | 'complete'>('choice');
  const [selectedOption, setSelectedOption] = useState<'create' | 'join' | null>(null);
  const [businessData, setBusinessData] = useState<any>(null);

  const options = [
    {
      id: 'create' as const,
      title: 'Create a new business account',
      description: 'Set up a new salon or wellness studio',
      icon: Building,
    },
    {
      id: 'join' as const,
      title: 'Join an existing business on Nimos',
      description: 'Find the business you want to join',
      icon: Users,
    },
  ];

  const handleOptionSelect = (optionId: 'create' | 'join') => {
    setSelectedOption(optionId);
    
    if (optionId === 'create') {
      setStep('business-setup');
    } else {
      // For joining existing business, complete immediately for now
      onComplete(optionId);
    }
  };

  const handleBusinessSetupComplete = (data: any) => {
    setBusinessData(data);
    setStep('business-categories');
  };

  const handleCategoriesComplete = (categories: string[]) => {
    const completeBusinessData = {
      ...businessData,
      categories,
    };
    setBusinessData(completeBusinessData);
    setStep('complete');
  };

  const handleSetupComplete = () => {
    onComplete('create', businessData);
  };

  const handleBack = () => {
    if (step === 'business-categories') {
      setStep('business-setup');
    } else if (step === 'business-setup') {
      setStep('choice');
      setSelectedOption(null);
    }
  };

  if (step === 'complete') {
    return (
      <BusinessSetupComplete
        onComplete={handleSetupComplete}
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
    <div className="min-h-screen bg-background flex">
      {/* Left side - Wizard */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              How would you like to set up your professional account?
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose how you'd like to get started with Nimos
            </p>
          </div>

          <div className="space-y-4">
            {options.map((option) => {
              const IconComponent = option.icon;
              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20 ${
                    selectedOption === option.id ? 'border-primary shadow-sm' : ''
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {option.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            You can always change these settings later in your dashboard
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
          <h2 className="text-2xl font-bold mb-2">Start Your Journey</h2>
          <p className="text-white/90 text-lg">
            Whether you're creating a new business or joining an existing one, we'll help you get set up quickly
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSetupWizard;
