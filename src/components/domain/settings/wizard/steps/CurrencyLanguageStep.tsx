import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign } from 'lucide-react';
import { StepActions } from '@/components/domain/settings/StepActions';
import { useToast } from '@/components/ui/use-toast';
import { studiosApi } from '@/api/studios';
import { useRole } from '@/contexts/RoleContext';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { LanguageSelect } from '@/components/ui/LanguageSelect';

const formSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  language: z.string().min(1, 'Language is required'),
});

type FormData = z.infer<typeof formSchema>;

interface CurrencyLanguageStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  isLastStep?: boolean;
}

export const CurrencyLanguageStep = ({ 
  onNext, 
  onPrevious, 
  hasNext = true, 
  hasPrevious = false,
  isLastStep = false 
}: CurrencyLanguageStepProps) => {
  const { toast } = useToast();
  const { currentStudio, loading, refreshRoles, refreshStudio } = useRole();
  const [submitting, setSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: '',
      language: '',
    },
  });

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      console.log('CurrencyLanguageStep: Component mounted, loading data');
      if (currentStudio) {
        console.log('CurrencyLanguageStep: currentStudio already available:', currentStudio);
        setDataLoaded(true);
      } else {
        console.log('CurrencyLanguageStep: No currentStudio, refreshing roles');
        await refreshRoles();
        setDataLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Reset form when currentStudio data changes
  useEffect(() => {
    if (currentStudio && dataLoaded) {
      console.log('CurrencyLanguageStep: Resetting form with data:', {
        currency: currentStudio.currency,
        language: currentStudio.default_team_language
      });
      form.reset({
        currency: currentStudio.currency || '',
        language: currentStudio.default_team_language || '',
      });
    }
  }, [currentStudio, form, dataLoaded]);

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setSubmitting(true);
    try {
      await studiosApi.updateStudio(currentStudio.id, {
        currency: data.currency,
        default_team_language: data.language,
        default_client_language: data.language,
      });

      await refreshStudio();
      
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
      setSubmitting(false);
    }
  };

  if (loading || !dataLoaded) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency & Language
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Loading currency and language settings...
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
                    <FormControl>
                      <CurrencySelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select currency"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <LanguageSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select language"
                      />
                    </FormControl>
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
