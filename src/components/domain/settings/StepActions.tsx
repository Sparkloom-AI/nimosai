import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepActionsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isLastStep?: boolean;
}

export const StepActions = ({
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = true,
  isLastStep = false
}: StepActionsProps) => {
  return (
    <div className="flex justify-between pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={!hasPrevious}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      {isLastStep ? (
        <Button type="button" onClick={onNext}>
          Complete Section
        </Button>
      ) : (
        <Button type="button" onClick={onNext} disabled={!hasNext}>
          <>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </>
        </Button>
      )}
    </div>
  );
};

export default StepActions;


