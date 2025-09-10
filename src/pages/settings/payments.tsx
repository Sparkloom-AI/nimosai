import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Placeholder step content for now until detailed components exist
const ComingSoon = () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>;

const PaymentsSettingsPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('currency-tax');

  const section = useMemo(() => ({
    id: 'payments-pricing',
    title: 'Payments & Pricing',
    description: 'Currency, tax settings, and payment providers',
    icon: CreditCard,
    steps: [
      { id: 'currency-tax', title: 'Currency & Tax', component: ComingSoon, completed: false },
      { id: 'payment-providers', title: 'Payment Providers', component: ComingSoon, completed: false },
      { id: 'deposit-prepayment', title: 'Deposit & Prepayment Rules', component: ComingSoon, completed: false },
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

export default PaymentsSettingsPage;


