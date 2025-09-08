import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { SettingsSidebar } from './SettingsSidebar';
import { cn } from '@/lib/utils';

export interface SettingsStep {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  component: React.ComponentType<any>;
  props?: any;
}

export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  steps: SettingsStep[];
  completed?: boolean;
}

interface SettingsWizardLayoutProps {
  sections: SettingsSection[];
  activeSection: string;
  activeStep: string;
  onSectionChange: (sectionId: string) => void;
  onStepChange: (stepId: string) => void;
  onComplete?: (sectionId: string) => void;
  className?: string;
}

export const SettingsWizardLayout = ({
  sections,
  activeSection,
  activeStep,
  onSectionChange,
  onStepChange,
  onComplete,
  className
}: SettingsWizardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentSection = sections.find(s => s.id === activeSection);
  const currentStepIndex = currentSection?.steps.findIndex(s => s.id === activeStep) ?? 0;
  const currentStep = currentSection?.steps[currentStepIndex];

  const handleNext = useCallback(() => {
    if (!currentSection) return;
    
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < currentSection.steps.length) {
      onStepChange(currentSection.steps[nextStepIndex].id);
    } else {
      // Mark section as completed and navigate to next section
      onComplete?.(activeSection);
      const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
      if (currentSectionIndex < sections.length - 1) {
        const nextSection = sections[currentSectionIndex + 1];
        onSectionChange(nextSection.id);
        onStepChange(nextSection.steps[0].id);
      }
    }
  }, [currentSection, currentStepIndex, onStepChange, onComplete, activeSection, sections, onSectionChange]);

  const handlePrevious = useCallback(() => {
    if (!currentSection) return;
    
    if (currentStepIndex > 0) {
      onStepChange(currentSection.steps[currentStepIndex - 1].id);
    } else {
      // Navigate to previous section's last step
      const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
      if (currentSectionIndex > 0) {
        const prevSection = sections[currentSectionIndex - 1];
        onSectionChange(prevSection.id);
        onStepChange(prevSection.steps[prevSection.steps.length - 1].id);
      }
    }
  }, [currentSection, currentStepIndex, onStepChange, activeSection, sections, onSectionChange]);

  const hasNext = currentSection && 
    (currentStepIndex < currentSection.steps.length - 1 || 
     sections.findIndex(s => s.id === activeSection) < sections.length - 1);

  const hasPrevious = currentSection &&
    (currentStepIndex > 0 || 
     sections.findIndex(s => s.id === activeSection) > 0);

  const StepComponent = currentStep?.component;

  return (
    <div className={cn("flex h-full min-h-screen", className)}>
      <SettingsSidebar
        sections={sections}
        activeSection={activeSection}
        activeStep={activeStep}
        onSectionChange={onSectionChange}
        onStepChange={onStepChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{currentSection?.title}</h1>
              {currentStep && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Step {currentStepIndex + 1} of {currentSection?.steps.length}:
                  </span>
                  <span className="text-sm font-medium">{currentStep.title}</span>
                  {currentStep.completed && (
                    <Badge variant="secondary" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {StepComponent && (
              <StepComponent 
                {...currentStep?.props}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
              />
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t bg-background px-6 py-4">
          <div className="max-w-4xl mx-auto flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!hasNext}
            >
              {currentStepIndex < (currentSection?.steps.length ?? 0) - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                'Complete Section'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};