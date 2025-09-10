import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>;

const TeamSettingsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('team-members');

  const section = useMemo(() => ({
    id: 'team-permissions',
    title: 'Team & Permissions',
    description: 'Team members, roles, and access controls',
    icon: Users,
    steps: [
      { id: 'team-members', title: 'Team Members', component: ComingSoon, completed: false },
      { id: 'roles-permissions', title: 'Roles & Permissions', component: ComingSoon, completed: false },
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

export default TeamSettingsPage;


