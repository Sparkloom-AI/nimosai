import React, { useMemo, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Building2, MapPin, Calendar, Users, CreditCard, Bell, Zap, Cog, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsOverviewPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo(() => ([
    { id: 'business-profile', title: 'Business Profile', description: 'Business identity, contact details, and social media', icon: Building2, href: '/settings/business-profile' },
    { id: 'locations-hours', title: 'Locations & Hours', description: 'Manage locations, addresses, and business hours', icon: MapPin, href: '/settings/locations' },
    { id: 'appointments-policies', title: 'Appointments & Policies', description: 'Booking settings, cancellation, and rescheduling policies', icon: Calendar, href: '/settings/appointments' },
    { id: 'payments-pricing', title: 'Payments & Pricing', description: 'Currency, tax settings, and payment providers', icon: CreditCard, href: '/settings/payments' },
    { id: 'communication-notifications', title: 'Communication & Notifications', description: 'Client and team notifications via email, SMS, WhatsApp', icon: Bell, href: '/settings/communication' },
    { id: 'team-permissions', title: 'Team & Permissions', description: 'Team members, roles, and access controls', icon: Users, href: '/settings/team' },
    { id: 'integrations', title: 'Integrations', description: 'Calendar sync, API access, and third-party connections', icon: Zap, href: '/settings/integrations' },
    { id: 'advanced-settings', title: 'Advanced Settings', description: 'Language defaults, data management, and legal settings', icon: Cog, href: '/settings/advanced' },
  ]), []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [sections, searchQuery]);

  const handleOpen = useCallback((href: string) => navigate(href), [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Configure your business settings with our step-by-step guided setup</p>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search settings…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(section => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpen(section.href)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg w-fit">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">Configure</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsOverviewPage;


