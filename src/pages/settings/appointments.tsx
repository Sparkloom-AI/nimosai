import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { AppointmentsSettings } from '@/components/domain/settings/AppointmentsSettings';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppointmentsSettingsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('availability');

  const section = useMemo(() => ({
    id: 'appointments-policies',
    title: 'Appointments & Policies',
    description: 'Booking settings, cancellation, and rescheduling policies',
    icon: Calendar,
    steps: [
      { id: 'availability', title: 'Availability Settings', component: AppointmentsSettings, completed: false },
      { id: 'team-group-bookings', title: 'Team & Group Bookings', component: AppointmentsSettings, completed: false },
      { id: 'cancellation-policy', title: 'Cancellation Policy', component: AppointmentsSettings, completed: false },
      { id: 'rescheduling-policy', title: 'Rescheduling Policy', component: AppointmentsSettings, completed: false },
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

export default AppointmentsSettingsPage;


