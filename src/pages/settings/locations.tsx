import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { LocationsSection } from '@/components/domain/settings/wizard/LocationsSection';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LocationsSettingsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('locations');

  const section = useMemo(() => ({
    id: 'locations-hours',
    title: 'Locations & Hours',
    description: 'Manage locations, addresses, and business hours',
    icon: MapPin,
    steps: [
      { id: 'locations', title: 'Manage Locations', component: LocationsSection, completed: false },
      { id: 'address-timezone', title: 'Address & Time Zone', component: LocationsSection, completed: false },
      { id: 'business-hours', title: 'Business Hours', component: LocationsSection, completed: false },
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

export default LocationsSettingsPage;


