import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign } from 'lucide-react';
import { StepActions } from '@/components/domain/settings/StepActions';
import { useToast } from '@/components/ui/use-toast';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';

const formSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  default_team_language: z.string().min(1, 'Team language is required'),
  default_client_language: z.string().min(1, 'Client language is required'),
});

type FormData = z.infer<typeof formSchema>;

interface CurrencyLanguageStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

// Currencies data from LocationSettings
const worldCurrencies = [
  'US Dollar - USD',
  'Euro - EUR',
  'British Pound - GBP',
  'Japanese Yen - JPY',
  'Australian Dollar - AUD',
  'Canadian Dollar - CAD',
  'Swiss Franc - CHF',
  'Chinese Yuan - CNY',
  'Swedish Krona - SEK',
  'New Zealand Dollar - NZD',
  'Mexican Peso - MXN',
  'Singapore Dollar - SGD',
  'Hong Kong Dollar - HKD',
  'Norwegian Krone - NOK',
  'South Korean Won - KRW',
  'Turkish Lira - TRY',
  'Russian Ruble - RUB',
  'Indian Rupee - INR',
  'Brazilian Real - BRL',
  'South African Rand - ZAR',
  'Indonesian Rupiah - IDR',
  'Malaysian Ringgit - MYR',
  'Thai Baht - THB',
  'Vietnamese Dong - VND',
  'Philippine Peso - PHP',
  'Argentine Peso - ARS',
  'Chilean Peso - CLP',
  'Colombian Peso - COP',
  'Peruvian Sol - PEN',
  'Egyptian Pound - EGP',
  'Nigerian Naira - NGN',
];

// Languages data from LocationSettings
const languages = [
  'English',
  'Deutsch',
  'français',
  'italiano',
  'español',
  'Nederlands',
  '日本語',
  '中文',
  '한국어',
  'Tiếng Việt',
  'português (Brasil)',
  'русский',
  'العربية',
  'Indonesia',
];

export const CurrencyLanguageStep = ({ 
  onNext, 
  onPrevious, 
  hasNext = true, 
  hasPrevious = false,
  isLastStep = false 
}: CurrencyLanguageStepProps) => {
  const { toast } = useToast();
  const { currentStudio, refreshRoles } = useRole();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: '',
      default_team_language: '',
      default_client_language: '',
    },
  });

  useEffect(() => {
    if (currentStudio) {
      form.reset({
        currency: currentStudio.currency || '',
        default_team_language: currentStudio.default_team_language || '',
        default_client_language: currentStudio.default_client_language || '',
      });
    }
  }, [currentStudio, form]);

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      await studiosApi.updateStudio(currentStudio.id, {
        currency: data.currency,
        default_team_language: data.default_team_language,
        default_client_language: data.default_client_language,
      });

      await refreshRoles();
      
      toast({
        title: 'Success',
        description: 'Currency and language settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating currency and language:', error);
      toast({
        title: 'Error',
        description: 'Failed to update currency and language settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency & Language
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set your default currency and language
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {worldCurrencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
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
                name="default_team_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
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
                name="default_client_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
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
