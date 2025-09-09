import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
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
}

export const BusinessProfileSection = ({
  stepId = 'name-logo',
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: BusinessProfileSectionProps) => {
  // Map the sidebar step ids to the internal step components
  const stepComponentMap: Record<string, React.ComponentType<any>> = {
    'name-logo': BusinessNameLogoStep,
    'description-categories': BusinessDescriptionCategoriesStep,
    'contact-info': ContactInformationStep,
    'social-media': SocialMediaStep,
  };

  const StepComponent = stepComponentMap[stepId] ?? BusinessNameLogoStep;

  return (
    <div className="space-y-6">
      <StepComponent />

      {/* Navigation controls at bottom */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext} disabled={!hasNext}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};