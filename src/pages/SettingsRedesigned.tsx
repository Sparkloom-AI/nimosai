import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Building2, Globe2, Megaphone, MoreHorizontal, ArrowLeft, Wand2 } from 'lucide-react';
import { EnhancedBusinessDetailsForm } from '@/components/domain/settings/EnhancedBusinessDetailsForm';
import { BasicInfoForm } from '@/components/domain/settings/BasicInfoForm';
import { LocationsSection } from '@/components/domain/locations/LocationsSection';
import SettingsWizard from '@/components/domain/settings/SettingsWizard';
import { GoogleMapsTest } from '@/components/domain/locations/GoogleMapsTest';

type SettingsSection = 'overview' | 'business-details' | 'basic-info' | 'locations' | 'wizard';

const SettingsRedesigned = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
  const [activeTab, setActiveTab] = useState('business');

  const renderSection = () => {
    switch (activeSection) {
      case 'wizard':
        return <SettingsWizard onClose={() => setActiveSection('overview')} />;
      case 'business-details':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <span>/</span>
              <span>Business Details</span>
            </div>
            <EnhancedBusinessDetailsForm />
          </div>
        );
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <span>/</span>
              <span>Basic Info</span>
            </div>
            <BasicInfoForm />
          </div>
        );
      case 'locations':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <span>/</span>
              <span>Locations & Hours</span>
            </div>
            <LocationsSection />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your business settings and preferences
              </p>
            </div>

            {/* Settings Wizard Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  Settings Wizard
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update all your business information in a guided, step-by-step process
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveSection('wizard')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Launch Settings Wizard
                </Button>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business Management
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

              <TabsContent value="business" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card 
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => setActiveSection('business-details')}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-sm font-medium">
                          Business Details
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-3">
                        Edit business name, description with AI, external links and categories
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </CardContent>
                  </Card>

                  <Card 
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => setActiveSection('basic-info')}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-sm font-medium">
                          Basic Info
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-3">
                        Country, currency, tax calculation and default languages
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </CardContent>
                  </Card>

                  <Card 
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => setActiveSection('locations')}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-sm font-medium">
                          Locations & Hours
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-3">
                        Manage your business locations and operating hours
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Manage
                      </Button>
                    </CardContent>
                  </Card>
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
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Development & Testing</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Tools for testing integrations and debugging.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <GoogleMapsTest />
                    </CardContent>
                  </Card>
                  
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
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {renderSection()}
      </div>
    </DashboardLayout>
  );
};

export default SettingsRedesigned;