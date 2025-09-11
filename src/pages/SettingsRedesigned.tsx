import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Building2, MapPin, Calendar, Users, Settings, CreditCard, Bell, Zap, Cog, Shield, Search, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { SettingsWizardLayout, SettingsSection } from '@/components/domain/settings/SettingsWizardLayout';
import { BusinessProfileSection } from '@/components/domain/settings/wizard/BusinessProfileSection';
import { LocationsSection } from '@/components/domain/locations/LocationsSection';
import { AppointmentsSettings } from '@/components/domain/settings/AppointmentsSettings';
import { SettingsDetailPage } from '@/components/domain/settings/SettingsDetailPage';
import { cn } from '@/lib/utils';

type ViewType = 'dashboard' | 'detail';

const SettingsRedesigned = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [activeSection, setActiveSection] = useState('business-profile');
  const [activeStep, setActiveStep] = useState('name-logo');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Reset to dashboard view when accessing /settings route or when component mounts
  useEffect(() => {
    setView('dashboard');
    setActiveStep('name-logo'); // Reset to first step
  }, []);

  const handleSectionComplete = useCallback((sectionId: string) => {
    setCompletedSections(prev => new Set([...prev, sectionId]));
  }, []);

  const settingsSections: SettingsSection[] = [
    {
      id: 'business-profile',
      title: 'Business Profile',
      description: 'Business identity, contact details, and social media',
      icon: Building2,
      steps: [
        {
          id: 'name-logo',
          title: 'Name & Logo',
          component: BusinessProfileSection,
          completed: false
        },
        {
          id: 'description-categories',
          title: 'Description & Categories',
          component: BusinessProfileSection,
          completed: false
        },
        {
          id: 'contact-info',
          title: 'Contact Information',
          component: BusinessProfileSection,
          completed: false
        },
        {
          id: 'social-media',
          title: 'Social Media',
          component: BusinessProfileSection,
          completed: false
        }
      ],
      completed: completedSections.has('business-profile')
    },
    {
      id: 'locations-hours',
      title: 'Locations & Hours',
      description: 'Manage locations, addresses, and business hours',
      icon: MapPin,
      steps: [
        {
          id: 'locations',
          title: 'Manage Locations',
          component: LocationsSection,
          completed: false
        },
        {
          id: 'business-hours',
          title: 'Business Hours',
          component: LocationsSection,
          completed: false
        }
      ],
      completed: completedSections.has('locations-hours')
    },
    {
      id: 'appointments-policies',
      title: 'Appointments & Policies',
      description: 'Booking settings, cancellation, and rescheduling policies',
      icon: Calendar,
      steps: [
        {
          id: 'availability',
          title: 'Availability Settings',
          component: AppointmentsSettings,
          completed: false
        },
        {
          id: 'team-group-bookings',
          title: 'Team & Group Bookings',
          component: AppointmentsSettings,
          completed: false
        },
        {
          id: 'cancellation-policy',
          title: 'Cancellation Policy',
          component: AppointmentsSettings,
          completed: false
        },
        {
          id: 'rescheduling-policy',
          title: 'Rescheduling Policy',
          component: AppointmentsSettings,
          completed: false
        }
      ],
      completed: completedSections.has('appointments-policies')
    },
    {
      id: 'payments-pricing',
      title: 'Payments & Pricing',
      description: 'Currency, tax settings, and payment providers',
      icon: CreditCard,
      steps: [
        {
          id: 'currency-tax',
          title: 'Currency & Tax',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'payment-providers',
          title: 'Payment Providers',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'deposit-prepayment',
          title: 'Deposit & Prepayment Rules',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        }
      ],
      completed: completedSections.has('payments-pricing')
    },
    {
      id: 'communication-notifications',
      title: 'Communication & Notifications',
      description: 'Client and team notifications via email, SMS, WhatsApp',
      icon: Bell,
      steps: [
        {
          id: 'client-notifications',
          title: 'Client Notifications',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'team-notifications',
          title: 'Team Notifications',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'communication-channels',
          title: 'Communication Channels',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        }
      ],
      completed: completedSections.has('communication-notifications')
    },
    {
      id: 'team-permissions',
      title: 'Team & Permissions',
      description: 'Team members, roles, and access controls',
      icon: Users,
      steps: [
        {
          id: 'team-members',
          title: 'Team Members',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'roles-permissions',
          title: 'Roles & Permissions',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        }
      ],
      completed: completedSections.has('team-permissions')
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Calendar sync, API access, and third-party connections',
      icon: Zap,
      steps: [
        {
          id: 'social-media-links',
          title: 'Social Media Links',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'calendar-sync',
          title: 'Calendar Sync',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'api-webhooks',
          title: 'API & Webhooks',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'third-party',
          title: 'Third-Party Integrations',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        }
      ],
      completed: completedSections.has('integrations')
    },
    {
      id: 'advanced-settings',
      title: 'Advanced Settings',
      description: 'Language defaults, data management, and legal settings',
      icon: Cog,
      steps: [
        {
          id: 'language-defaults',
          title: 'Language Defaults',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'data-management',
          title: 'Data Management',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        },
        {
          id: 'legal-settings',
          title: 'Legal Settings',
          component: () => <div className="p-8 text-center text-muted-foreground">Coming Soon</div>,
          completed: false
        }
      ],
      completed: completedSections.has('advanced-settings')
    }
  ];

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return settingsSections;
    
    return settingsSections.filter(section => {
      const titleMatch = section.title.toLowerCase().includes(searchQuery.toLowerCase());
      const descriptionMatch = section.description.toLowerCase().includes(searchQuery.toLowerCase());
      const stepMatch = section.steps.some(step => 
        step.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return titleMatch || descriptionMatch || stepMatch;
    });
  }, [searchQuery, settingsSections]);

  const currentSection = settingsSections.find(s => s.id === activeSection);

  if (view === 'detail' && currentSection) {
    return (
      <DashboardLayout>
        <SettingsDetailPage
          section={currentSection}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          onBack={() => setView('dashboard')}
          onComplete={handleSectionComplete}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure your business settings with our step-by-step guided setup
            </p>
          </div>
          
          {/* Search Bar */}
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
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isCompleted = section.completed;
            const completedSteps = section.steps.filter(step => step.completed).length;
            
            return (
              <Card 
                key={section.id}
                className="group hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => {
                  setActiveSection(section.id);
                  setActiveStep(section.steps[0].id);
                  setView('detail');
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg w-fit">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      {completedSteps}/{section.steps.length} steps complete
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      {isCompleted ? 'Review Settings' : 'Configure'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsRedesigned;