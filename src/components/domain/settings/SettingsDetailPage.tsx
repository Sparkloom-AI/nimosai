import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsSection } from './SettingsWizardLayout';

interface SettingsDetailPageProps {
  section: SettingsSection;
  activeStep: string;
  onStepChange: (stepId: string) => void;
  onBack: () => void;
  onComplete: (sectionId: string) => void;
}

export const SettingsDetailPage = ({
  section,
  activeStep,
  onStepChange,
  onBack,
  onComplete
}: SettingsDetailPageProps) => {
  const currentStepIndex = section.steps.findIndex(s => s.id === activeStep);
  const currentStep = section.steps[currentStepIndex];
  const StepComponent = currentStep?.component;

  // Ensure we always have a valid active step - default to first step if none provided
  const validActiveStep = activeStep || section.steps[0]?.id;
  const validCurrentStepIndex = section.steps.findIndex(s => s.id === validActiveStep);
  const validCurrentStep = section.steps[validCurrentStepIndex];
  const ValidStepComponent = validCurrentStep?.component;

  const handleNext = () => {
    const nextStepIndex = validCurrentStepIndex + 1;
    if (nextStepIndex < section.steps.length) {
      onStepChange(section.steps[nextStepIndex].id);
    } else {
      onComplete(section.id);
      onBack(); // Redirect back to settings overview
    }
  };

  const handlePrevious = () => {
    if (validCurrentStepIndex > 0) {
      onStepChange(section.steps[validCurrentStepIndex - 1].id);
    }
  };

  const hasNext = validCurrentStepIndex < section.steps.length - 1;
  const hasPrevious = validCurrentStepIndex > 0;

  return (
    <div className="flex h-full min-h-screen">
      {/* Compact Local Sidebar */}
      <div className="w-64 border-r bg-background">
        <div className="p-4 space-y-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-full justify-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all settings
          </Button>

          {/* Section Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md w-fit">
                <section.icon className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-semibold text-sm">{section.title}</h2>
            </div>
            <p className="text-xs text-muted-foreground">{section.description}</p>
          </div>

          {/* Steps Navigation */}
          <div className="space-y-1">
            {section.steps.map((step, index) => (
              <Button
                key={step.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start h-9 px-3",
                  step.id === validActiveStep && "bg-muted text-foreground"
                )}
                onClick={() => onStepChange(step.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm truncate">{step.title}</span>
                  </div>
                  {step.completed && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {ValidStepComponent && (
            <ValidStepComponent 
              {...validCurrentStep?.props}
              stepId={validActiveStep}
              onNext={handleNext}
              onPrevious={handlePrevious}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLastStep={!hasNext}
            />
          )}
        </div>
      </div>
    </div>
  );
};