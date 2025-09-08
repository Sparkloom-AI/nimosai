import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MessageSquare, Phone, Globe } from 'lucide-react';
import { BusinessNameLogoStep } from './steps/BusinessNameLogoStep';
import { BusinessDescriptionCategoriesStep } from './steps/BusinessDescriptionCategoriesStep';
import { ContactInformationStep } from './steps/ContactInformationStep';
import { SocialMediaStep } from './steps/SocialMediaStep';

interface BusinessProfileSectionProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const BusinessProfileSection = ({
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: BusinessProfileSectionProps) => {
  const [activeTab, setActiveTab] = useState('name-logo');

  const tabs = [
    {
      id: 'name-logo',
      label: 'Name & Logo',
      icon: Building2,
      component: BusinessNameLogoStep
    },
    {
      id: 'description',
      label: 'Description & Categories',
      icon: MessageSquare,
      component: BusinessDescriptionCategoriesStep
    },
    {
      id: 'contact',
      label: 'Contact Information',
      icon: Phone,
      component: ContactInformationStep
    },
    {
      id: 'social',
      label: 'Social Media',
      icon: Globe,
      component: SocialMediaStep
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = currentTab?.component;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your business identity, contact details, and social media presence
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                <tab.component />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};