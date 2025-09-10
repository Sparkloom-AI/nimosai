import React from 'react';
import { BusinessNameLogoStep } from './steps/BusinessNameLogoStep';
import { BusinessDescriptionCategoriesStep } from './steps/BusinessDescriptionCategoriesStep';
import { ContactInformationStep } from './steps/ContactInformationStep';
import { SocialMediaStep } from './steps/SocialMediaStep';

interface BusinessProfileSectionProps {
  stepId?: string;
}

export const BusinessProfileSection = ({
  stepId = 'name-logo'
}: BusinessProfileSectionProps) => {
  // Map the sidebar step ids to the internal step components
  const stepComponentMap: Record<string, React.ComponentType<any>> = {
    'name-logo': BusinessNameLogoStep,
    'description-categories': BusinessDescriptionCategoriesStep,
    'contact-info': ContactInformationStep,
    'social-media': SocialMediaStep,
  };

  const StepComponent = stepComponentMap[stepId] ?? BusinessNameLogoStep;

  return <StepComponent />;
};