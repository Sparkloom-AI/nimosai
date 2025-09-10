import React from 'react';
import { ManageLocationsStep } from './steps/ManageLocationsStep';
import { AddressTimezoneStep } from './steps/AddressTimezoneStep';
import { BusinessHoursStep } from './steps/BusinessHoursStep';

interface LocationsSectionProps {
  stepId?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

export const LocationsSection = ({
  stepId = 'locations',
  onNext,
  onPrevious,
  hasNext = true,
  hasPrevious = false,
  isLastStep = false
}: LocationsSectionProps) => {
  // Map the sidebar step ids to the internal step components
  const stepComponentMap: Record<string, React.ComponentType<any>> = {
    'locations': ManageLocationsStep,
    'address-timezone': AddressTimezoneStep,
    'business-hours': BusinessHoursStep,
  };

  const StepComponent = stepComponentMap[stepId] ?? ManageLocationsStep;

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
