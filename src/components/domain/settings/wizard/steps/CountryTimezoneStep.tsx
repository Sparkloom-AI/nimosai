import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Globe } from 'lucide-react';
import { StepActions } from '@/components/domain/settings/StepActions';
import { useToast } from '@/components/ui/use-toast';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';
import { countries, timezones } from '@/hooks/useIPLocationDetection';
import { profilesApi } from '@/api/profiles';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

type FormData = z.infer<typeof formSchema>;

interface CountryTimezoneStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

export const CountryTimezoneStep = ({ 
  onNext, 
  onPrevious, 
  hasNext = true, 
  hasPrevious = false,
  isLastStep = false 
}: CountryTimezoneStepProps) => {
  const { currentStudio, loading, refreshRoles, refreshStudio } = useRole();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: '',
      timezone: '',
    },
  });

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      console.log('CountryTimezoneStep: Component mounted, loading data');
      if (currentStudio) {
        console.log('CountryTimezoneStep: currentStudio already available:', currentStudio);
        setDataLoaded(true);
      } else {
        console.log('CountryTimezoneStep: No currentStudio, refreshing roles');
        await refreshRoles();
        setDataLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Reset form when profile data is available
  useEffect(() => {
    const loadProfileData = async () => {
      if (user && dataLoaded) {
        try {
          const profile = await profilesApi.getCurrentProfile();
          if (profile) {
            console.log('CountryTimezoneStep: Resetting form with profile data:', {
              country: profile.country,
              timezone: profile.timezone
            });
            form.reset({
              country: profile.country || '',
              timezone: profile.timezone || '',
            });
          }
        } catch (error) {
          console.error('Failed to load profile data:', error);
        }
      }
    };
    
    loadProfileData();
  }, [user, dataLoaded, form]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setSubmitting(true);
    try {
      await profilesApi.updateProfile({
        country: data.country,
        timezone: data.timezone,
      });
      
      toast({
        title: 'Success',
        description: 'Country and timezone updated successfully',
      });
    } catch (error) {
      console.error('Error updating country and timezone:', error);
      toast({
        title: 'Error',
        description: 'Failed to update country and timezone',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Sort timezones by GMT offset
  const sortedTimezones = timezones.map(tz => ({ name: tz, gmtOffset: 0 })).sort((a, b) => a.gmtOffset - b.gmtOffset);

  if (loading || !dataLoaded) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Country & Time Zone
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Loading country and timezone settings...
            </p>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
        
        <StepActions
          onPrevious={onPrevious}
          onNext={onNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          isLastStep={isLastStep}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Country & Time Zone
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your business country and time zone
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Zone</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {sortedTimezones.map((timezone) => (
                          <SelectItem key={timezone.name} value={timezone.name}>
                            {timezone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <StepActions
        onPrevious={onPrevious}
        onNext={onNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isLastStep={isLastStep}
      />
    </div>
  );
};
