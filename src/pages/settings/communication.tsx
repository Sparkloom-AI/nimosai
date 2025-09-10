import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>;

const CommunicationSettingsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('client-notifications');

  const section = useMemo(() => ({
    id: 'communication-notifications',
    title: 'Communication & Notifications',
    description: 'Client and team notifications via email, SMS, WhatsApp',
    icon: Bell,
    steps: [
      { id: 'client-notifications', title: 'Client Notifications', component: ComingSoon, completed: false },
      { id: 'team-notifications', title: 'Team Notifications', component: ComingSoon, completed: false },
      { id: 'communication-channels', title: 'Communication Channels', component: ComingSoon, completed: false },
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

export default CommunicationSettingsPage;


