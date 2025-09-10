import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '@/api/locations';
import { useRole } from '@/contexts/RoleContext';
import { BusinessHoursSection } from '@/components/domain/settings/BusinessHoursSection';
import { StepActions } from '@/components/domain/settings/StepActions';

interface BusinessHoursStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

export const BusinessHoursStep = ({ 
  onNext, 
  onPrevious, 
  hasNext = true, 
  hasPrevious = false,
  isLastStep = false 
}: BusinessHoursStepProps) => {
  const { currentStudioId } = useRole();

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', currentStudioId],
    queryFn: () => currentStudioId ? locationsApi.getStudioLocations(currentStudioId) : Promise.resolve([]),
    enabled: !!currentStudioId,
  });

  return (
    <div className="space-y-6">
      <BusinessHoursSection locations={locations} />
      
      <StepActions
        onPrevious={onPrevious}
        onNext={onNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isLastStep={isLastStep}
      />
    </div>
  );
};
