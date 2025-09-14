import React, { useMemo, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { BusinessProfileSection } from '@/components/domain/settings/wizard/BusinessProfileSection';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessProfileSettingsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('name-logo');

  const section = useMemo(() => ({
    id: 'business-profile',
    title: 'Business Profile',
    description: 'Business identity, contact details, and social media',
    icon: Building2,
    steps: [
      { id: 'name-logo', title: 'Name & Logo', component: BusinessProfileSection, completed: false },
      { id: 'description-categories', title: 'Description & Categories', component: BusinessProfileSection, completed: false },
      { id: 'contact-info', title: 'Contact Information', component: BusinessProfileSection, completed: false },
      { id: 'social-media', title: 'Social Media', component: BusinessProfileSection, completed: false },
      { id: 'country-timezone', title: 'Country & Time Zone', component: BusinessProfileSection, completed: false },
      { id: 'currency-language', title: 'Currency & Language', component: BusinessProfileSection, completed: false },
    ],
    completed: false,
  }), []);

  return (
    <DashboardLayout>
      <SettingsDetailPage
        section={section as any}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        onBack={() => navigate('/settings')}
        onComplete={() => navigate('/settings')}
      />
    </DashboardLayout>
  );
};

export default BusinessProfileSettingsPage;


