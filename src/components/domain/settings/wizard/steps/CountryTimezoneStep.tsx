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
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: '',
      timezone: '',
    },
  });

  useEffect(() => {
    if (currentStudio) {
      form.reset({
        country: currentStudio.country || '',
        timezone: currentStudio.timezone || '',
      });
    }
  }, [currentStudio, form]);

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      await studiosApi.updateStudio(currentStudio.id, {
        country: data.country,
        timezone: data.timezone,
      });

      await refreshRoles();
      
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
      setLoading(false);
    }
  };

  // Sort timezones by GMT offset
  const sortedTimezones = timezones.map(tz => ({ name: tz, gmtOffset: 0 })).sort((a, b) => a.gmtOffset - b.gmtOffset);

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

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
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
