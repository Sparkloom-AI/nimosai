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

// Countries data from LocationSettings
const countries = [
  { code: 'ID', name: 'Indonesia', phone: '+62', timezone: '(GMT +07:00) Jakarta', currency: 'Indonesian Rupiah - IDR', flag: '🇮🇩', language: 'Indonesia', gmtOffset: 7 },
  { code: 'US', name: 'United States', phone: '+1', timezone: '(GMT -05:00) New York', currency: 'US Dollar - USD', flag: '🇺🇸', language: 'English', gmtOffset: -5 },
  { code: 'GB', name: 'United Kingdom', phone: '+44', timezone: '(GMT +00:00) London', currency: 'British Pound - GBP', flag: '🇬🇧', language: 'English', gmtOffset: 0 },
  { code: 'AU', name: 'Australia', phone: '+61', timezone: '(GMT +10:00) Sydney', currency: 'Australian Dollar - AUD', flag: '🇦🇺', language: 'English', gmtOffset: 10 },
  { code: 'DE', name: 'Germany', phone: '+49', timezone: '(GMT +01:00) Berlin', currency: 'Euro - EUR', flag: '🇩🇪', language: 'Deutsch', gmtOffset: 1 },
  { code: 'FR', name: 'France', phone: '+33', timezone: '(GMT +01:00) Paris', currency: 'Euro - EUR', flag: '🇫🇷', language: 'français', gmtOffset: 1 },
  { code: 'IT', name: 'Italy', phone: '+39', timezone: '(GMT +01:00) Rome', currency: 'Euro - EUR', flag: '🇮🇹', language: 'italiano', gmtOffset: 1 },
  { code: 'ES', name: 'Spain', phone: '+34', timezone: '(GMT +01:00) Madrid', currency: 'Euro - EUR', flag: '🇪🇸', language: 'español', gmtOffset: 1 },
  { code: 'NL', name: 'Netherlands', phone: '+31', timezone: '(GMT +01:00) Amsterdam', currency: 'Euro - EUR', flag: '🇳🇱', language: 'Nederlands', gmtOffset: 1 },
  { code: 'JP', name: 'Japan', phone: '+81', timezone: '(GMT +09:00) Tokyo', currency: 'Japanese Yen - JPY', flag: '🇯🇵', language: '日本語', gmtOffset: 9 },
  { code: 'KR', name: 'South Korea', phone: '+82', timezone: '(GMT +09:00) Seoul', currency: 'South Korean Won - KRW', flag: '🇰🇷', language: 'English', gmtOffset: 9 },
  { code: 'CN', name: 'China', phone: '+86', timezone: '(GMT +08:00) Beijing', currency: 'Chinese Yuan - CNY', flag: '🇨🇳', language: '中文', gmtOffset: 8 },
  { code: 'IN', name: 'India', phone: '+91', timezone: '(GMT +05:30) New Delhi', currency: 'Indian Rupee - INR', flag: '🇮🇳', language: 'English', gmtOffset: 5.5 },
  { code: 'SG', name: 'Singapore', phone: '+65', timezone: '(GMT +08:00) Singapore', currency: 'Singapore Dollar - SGD', flag: '🇸🇬', language: 'English', gmtOffset: 8 },
  { code: 'MY', name: 'Malaysia', phone: '+60', timezone: '(GMT +08:00) Kuala Lumpur', currency: 'Malaysian Ringgit - MYR', flag: '🇲🇾', language: 'English', gmtOffset: 8 },
  { code: 'TH', name: 'Thailand', phone: '+66', timezone: '(GMT +07:00) Bangkok', currency: 'Thai Baht - THB', flag: '🇹🇭', language: 'English', gmtOffset: 7 },
  { code: 'VN', name: 'Vietnam', phone: '+84', timezone: '(GMT +07:00) Ho Chi Minh City', currency: 'Vietnamese Dong - VND', flag: '🇻🇳', language: 'Tiếng Việt', gmtOffset: 7 },
  { code: 'PH', name: 'Philippines', phone: '+63', timezone: '(GMT +08:00) Manila', currency: 'Philippine Peso - PHP', flag: '🇵🇭', language: 'English', gmtOffset: 8 },
  { code: 'BR', name: 'Brazil', phone: '+55', timezone: '(GMT -03:00) São Paulo', currency: 'Brazilian Real - BRL', flag: '🇧🇷', language: 'português (Brasil)', gmtOffset: -3 },
  { code: 'MX', name: 'Mexico', phone: '+52', timezone: '(GMT -06:00) Mexico City', currency: 'Mexican Peso - MXN', flag: '🇲🇽', language: 'español', gmtOffset: -6 },
  { code: 'CA', name: 'Canada', phone: '+1', timezone: '(GMT -05:00) Toronto', currency: 'Canadian Dollar - CAD', flag: '🇨🇦', language: 'English', gmtOffset: -5 },
  { code: 'RU', name: 'Russia', phone: '+7', timezone: '(GMT +03:00) Moscow', currency: 'Russian Ruble - RUB', flag: '🇷🇺', language: 'русский', gmtOffset: 3 },
  { code: 'AR', name: 'Argentina', phone: '+54', timezone: '(GMT -03:00) Buenos Aires', currency: 'Argentine Peso - ARS', flag: '🇦🇷', language: 'español', gmtOffset: -3 },
  { code: 'CL', name: 'Chile', phone: '+56', timezone: '(GMT -03:00) Santiago', currency: 'Chilean Peso - CLP', flag: '🇨🇱', language: 'español', gmtOffset: -3 },
  { code: 'CO', name: 'Colombia', phone: '+57', timezone: '(GMT -05:00) Bogotá', currency: 'Colombian Peso - COP', flag: '🇨🇴', language: 'español', gmtOffset: -5 },
  { code: 'PE', name: 'Peru', phone: '+51', timezone: '(GMT -05:00) Lima', currency: 'Peruvian Sol - PEN', flag: '🇵🇪', language: 'español', gmtOffset: -5 },
  { code: 'ZA', name: 'South Africa', phone: '+27', timezone: '(GMT +02:00) Johannesburg', currency: 'South African Rand - ZAR', flag: '🇿🇦', language: 'English', gmtOffset: 2 },
  { code: 'EG', name: 'Egypt', phone: '+20', timezone: '(GMT +02:00) Cairo', currency: 'Egyptian Pound - EGP', flag: '🇪🇬', language: 'العربية', gmtOffset: 2 },
  { code: 'NG', name: 'Nigeria', phone: '+234', timezone: '(GMT +01:00) Lagos', currency: 'Nigerian Naira - NGN', flag: '🇳🇬', language: 'English', gmtOffset: 1 },
];

// Timezones data from LocationSettings
const allTimezones = [
  { name: '(GMT -12:00) Baker Island', gmtOffset: -12 },
  { name: '(GMT -11:00) American Samoa', gmtOffset: -11 },
  { name: '(GMT -10:00) Hawaii', gmtOffset: -10 },
  { name: '(GMT -09:00) Alaska', gmtOffset: -9 },
  { name: '(GMT -08:00) Pacific Time (US & Canada)', gmtOffset: -8 },
  { name: '(GMT -07:00) Mountain Time (US & Canada)', gmtOffset: -7 },
  { name: '(GMT -06:00) Central Time (US & Canada)', gmtOffset: -6 },
  { name: '(GMT -05:00) Eastern Time (US & Canada)', gmtOffset: -5 },
  { name: '(GMT -04:00) Atlantic Time (Canada)', gmtOffset: -4 },
  { name: '(GMT -03:00) Buenos Aires', gmtOffset: -3 },
  { name: '(GMT -02:00) Mid-Atlantic', gmtOffset: -2 },
  { name: '(GMT -01:00) Azores', gmtOffset: -1 },
  { name: '(GMT +00:00) London', gmtOffset: 0 },
  { name: '(GMT +01:00) Berlin', gmtOffset: 1 },
  { name: '(GMT +02:00) Athens', gmtOffset: 2 },
  { name: '(GMT +03:00) Moscow', gmtOffset: 3 },
  { name: '(GMT +04:00) Dubai', gmtOffset: 4 },
  { name: '(GMT +05:00) Karachi', gmtOffset: 5 },
  { name: '(GMT +05:30) New Delhi', gmtOffset: 5.5 },
  { name: '(GMT +06:00) Dhaka', gmtOffset: 6 },
  { name: '(GMT +07:00) Jakarta', gmtOffset: 7 },
  { name: '(GMT +08:00) Singapore', gmtOffset: 8 },
  { name: '(GMT +09:00) Tokyo', gmtOffset: 9 },
  { name: '(GMT +10:00) Sydney', gmtOffset: 10 },
  { name: '(GMT +11:00) Solomon Islands', gmtOffset: 11 },
  { name: '(GMT +12:00) Auckland', gmtOffset: 12 },
];

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
  const sortedTimezones = allTimezones.sort((a, b) => a.gmtOffset - b.gmtOffset);

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
