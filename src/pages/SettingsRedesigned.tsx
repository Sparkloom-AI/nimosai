import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Building2, Globe2, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { EnhancedBusinessDetailsForm } from '@/components/domain/settings/EnhancedBusinessDetailsForm';
import { BasicInfoForm } from '@/components/domain/settings/BasicInfoForm';
import { LocationsSection } from '@/components/domain/locations/LocationsSection';
import { AppointmentsSettings } from '@/components/domain/settings/AppointmentsSettings';
import { BusinessAddressForm } from '@/components/domain/settings/BusinessAddressForm';

type SettingsSection = 'overview' | 'business-details' | 'basic-info' | 'locations' | 'appointments' | 'address';

const SettingsRedesigned = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');

  const renderSection = () => {
    switch (activeSection) {
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
      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <span>/</span>
              <span>Appointments</span>
            </div>
            <AppointmentsSettings />
          </div>
        );
      case 'address':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <span>/</span>
              <span>Business Address</span>
            </div>
            <BusinessAddressForm />
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

              <Card 
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => setActiveSection('appointments')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-medium">
                      Appointments
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3">
                    Configure booking policies, availability, and cancellation rules
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => setActiveSection('address')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-medium">
                      Business Address
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3">
                    Set your main business address with worldwide search support
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Update Address
                  </Button>
                </CardContent>
              </Card>
            </div>
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