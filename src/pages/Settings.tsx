import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Building2, Globe2, Megaphone, MoreHorizontal, Users, Calendar, CreditCard, FileText, Wallet, MapPin } from 'lucide-react';
import { BusinessDetailsForm } from '@/components/domain/settings/BusinessDetailsForm';
import { BasicInfoForm } from '@/components/domain/settings/BasicInfoForm';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('settings');

  const settingsCards = [
    {
      icon: Building2,
      title: 'Business Details',
      description: 'Edit business name, external links and categories',
      action: 'Edit',
      component: <BusinessDetailsForm />
    },
    {
      icon: Globe2,
      title: 'Basic Info',
      description: 'Country, currency, tax calculation and default languages',
      action: 'Edit',
      component: <BasicInfoForm />
    },
    {
      icon: MapPin,
      title: 'Locations',
      description: 'Manage your business locations',
      action: 'Manage',
      href: '/locations'
    },
    {
      icon: Calendar,
      title: 'Scheduling',
      description: 'Set availability and booking preferences',
      action: 'Edit',
      badge: 'Coming Soon'
    },
    {
      icon: CreditCard,
      title: 'Sales',
      description: 'Payment methods, service charges and taxes',
      action: 'Edit',
      badge: 'Coming Soon'
    },
    {
      icon: Users,
      title: 'Team',
      description: 'Manage team members and permissions',
      action: 'Manage',
      href: '/team'
    },
    {
      icon: FileText,
      title: 'Billing',
      description: 'Invoicing, receipts and financial settings',
      action: 'Edit',
      badge: 'Coming Soon'
    },
    {
      icon: Wallet,
      title: 'Forms',
      description: 'Client intake forms and questionnaires',
      action: 'Edit',
      badge: 'Coming Soon'
    }
  ];

  const [selectedCard, setSelectedCard] = useState<any>(null);

  const handleCardClick = (card: any) => {
    if (card.href) {
      window.location.href = card.href;
    } else if (card.component) {
      setSelectedCard(card);
    }
  };

  const handleBack = () => {
    setSelectedCard(null);
  };

  if (selectedCard) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              Settings
            </Button>
            <span>/</span>
            <span>{selectedCard.title}</span>
          </div>
          {selectedCard.component}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your business settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="online" className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              Online presence
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <MoreHorizontal className="h-4 w-4" />
              Other
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {settingsCards.map((card, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${card.badge ? 'opacity-60' : ''}`}
                  onClick={() => !card.badge && handleCardClick(card)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <card.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-sm font-medium">
                          {card.title}
                        </CardTitle>
                      </div>
                      {card.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {card.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3">
                      {card.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={!!card.badge}
                    >
                      {card.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="online" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Online Presence</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your online booking, website integration, and social media presence.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Globe2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Online presence settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Marketing</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set up email campaigns, promotions, and client communication preferences.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Marketing settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Other Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Additional settings and integrations for your business.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MoreHorizontal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Additional settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;