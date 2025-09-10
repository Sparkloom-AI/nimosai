import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { Cog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>;

const AdvancedSettingsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('language-defaults');

  const section = useMemo(() => ({
    id: 'advanced-settings',
    title: 'Advanced Settings',
    description: 'Language defaults, data management, and legal settings',
    icon: Cog,
    steps: [
      { id: 'language-defaults', title: 'Language Defaults', component: ComingSoon, completed: false },
      { id: 'data-management', title: 'Data Management', component: ComingSoon, completed: false },
      { id: 'legal-settings', title: 'Legal Settings', component: ComingSoon, completed: false },
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

export default AdvancedSettingsPage;


