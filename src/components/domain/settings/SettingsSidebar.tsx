import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Check, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsSection } from './SettingsWizardLayout';

interface SettingsSidebarProps {
  sections: SettingsSection[];
  activeSection: string;
  activeStep: string;
  onSectionChange: (sectionId: string) => void;
  onStepChange: (stepId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SettingsSidebar = ({
  sections,
  activeSection,
  activeStep,
  onSectionChange,
  onStepChange,
  isOpen,
  onToggle
}: SettingsSidebarProps) => {
  const handleStepClick = (sectionId: string, stepId: string) => {
    if (sectionId !== activeSection) {
      onSectionChange(sectionId);
    }
    onStepChange(stepId);
  };

  const getCompletedStepsCount = (section: SettingsSection) => {
    return section.steps.filter(step => step.completed).length;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Settings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActiveSection = section.id === activeSection;
              const completedSteps = getCompletedStepsCount(section);
              const isCompleted = section.completed || completedSteps === section.steps.length;

              return (
                <Collapsible
                  key={section.id}
                  open={isActiveSection}
                  onOpenChange={(open) => {
                    if (open && !isActiveSection) {
                      onSectionChange(section.id);
                      onStepChange(section.steps[0].id);
                    }
                  }}
                >
                  <Card className={cn(
                    "overflow-hidden transition-colors",
                    isActiveSection && "ring-2 ring-primary ring-offset-2"
                  )}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-4 h-auto"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              isActiveSection 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{section.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {completedSteps}/{section.steps.length} complete
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <Badge variant="secondary" className="h-5">
                                <Check className="h-3 w-3" />
                              </Badge>
                            )}
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform",
                              isActiveSection && "rotate-90"
                            )} />
                          </div>
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-1">
                        {section.steps.map((step, index) => {
                          const isActiveStep = step.id === activeStep && isActiveSection;
                          
                          return (
                            <Button
                              key={step.id}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start pl-14 h-8",
                                isActiveStep && "bg-muted text-foreground"
                              )}
                              onClick={() => handleStepClick(section.id, step.id)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {index + 1}.
                                  </span>
                                  <span className="text-sm">{step.title}</span>
                                </div>
                                {step.completed && (
                                  <Check className="h-3 w-3 text-green-600" />
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={onToggle}
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
  );
};