import React from 'react';
import { BusinessNameLogoStep } from './steps/BusinessNameLogoStep';
import { BusinessDescriptionCategoriesStep } from './steps/BusinessDescriptionCategoriesStep';
import { ContactInformationStep } from './steps/ContactInformationStep';
import { SocialMediaStep } from './steps/SocialMediaStep';

interface BusinessProfileSectionProps {
  stepId?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

export const BusinessProfileSection = ({
  stepId = 'name-logo',
  onNext,
  onPrevious,
  hasNext = true,
  hasPrevious = false,
  isLastStep = false
}: BusinessProfileSectionProps) => {
  // Map the sidebar step ids to the internal step components
  const stepComponentMap: Record<string, React.ComponentType<any>> = {
    'name-logo': BusinessNameLogoStep,
    'description-categories': BusinessDescriptionCategoriesStep,
    'contact-info': ContactInformationStep,
    'social-media': SocialMediaStep,
  };

  const StepComponent = stepComponentMap[stepId];
  
  if (!StepComponent) {
    console.warn(`BusinessProfileSection: Unknown stepId "${stepId}", falling back to BusinessNameLogoStep`);
    return (
      <BusinessNameLogoStep 
        onNext={onNext}
        onPrevious={onPrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        isLastStep={isLastStep}
      />
    );
  }

  return (
    <StepComponent 
      onNext={onNext}
      onPrevious={onPrevious}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      isLastStep={isLastStep}
    />
  );
};