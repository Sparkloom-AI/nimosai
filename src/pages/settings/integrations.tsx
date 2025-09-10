import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>;

const IntegrationsSettingsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('social-media-links');

  const section = useMemo(() => ({
    id: 'integrations',
    title: 'Integrations',
    description: 'Calendar sync, API access, and third-party connections',
    icon: Zap,
    steps: [
      { id: 'social-media-links', title: 'Social Media Links', component: ComingSoon, completed: false },
      { id: 'calendar-sync', title: 'Calendar Sync', component: ComingSoon, completed: false },
      { id: 'api-webhooks', title: 'API & Webhooks', component: ComingSoon, completed: false },
      { id: 'third-party', title: 'Third-Party Integrations', component: ComingSoon, completed: false },
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

export default IntegrationsSettingsPage;


