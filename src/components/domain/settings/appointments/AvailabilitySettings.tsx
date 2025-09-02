import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, CalendarDays, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { appointmentSettingsApi } from '@/api/appointmentSettings';

const immediateBookingOptions = [
  { value: 0, label: 'Immediately' },
  { value: 15, label: 'Up to 15 minutes before start time' },
  { value: 30, label: 'Up to 30 minutes before start time' },
  { value: 60, label: 'Up to 1 hour before start time' },
  { value: 120, label: 'Up to 2 hours before start time' },
  { value: 240, label: 'Up to 4 hours before start time' },
  { value: 480, label: 'Up to 8 hours before start time' },
  { value: 1440, label: 'Up to 1 day before start time' },
  { value: 10080, label: 'Up to 1 week before start time' },
  { value: 20160, label: 'Up to 2 weeks before start time' },
];

const futureBookingOptions = [
  { value: 1, label: '1 month in the future' },
  { value: 2, label: '2 months in the future' },
  { value: 3, label: '3 months in the future' },
  { value: 6, label: '6 months in the future' },
  { value: 12, label: '12 months in the future' },
];

const formSchema = z.object({
  immediate_booking_allowed: z.boolean(),
  immediate_booking_buffer_minutes: z.number().min(0),
  future_booking_limit_months: z.number().min(1).max(12),
  online_booking_enabled: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export const AvailabilitySettings = () => {
  const { toast } = useToast();
  const { currentStudio } = useRole();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      immediate_booking_allowed: true,
      immediate_booking_buffer_minutes: 15,
      future_booking_limit_months: 12,
      online_booking_enabled: true,
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!currentStudio) return;

      try {
        const rules = await appointmentSettingsApi.getBookingRules(currentStudio.id);
        if (rules) {
          form.reset({
            immediate_booking_allowed: rules.immediate_booking_allowed,
            immediate_booking_buffer_minutes: rules.immediate_booking_buffer_minutes,
            future_booking_limit_months: rules.future_booking_limit_months,
            online_booking_enabled: rules.online_booking_enabled,
          });
        }
      } catch (error) {
        console.error('Error loading appointment settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load appointment settings',
          variant: 'destructive',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, [currentStudio, form, toast]);

  const onSubmit = async (data: FormData) => {
    if (!currentStudio) return;

    setLoading(true);
    try {
      await appointmentSettingsApi.updateBookingRules(currentStudio.id, data);
      
      toast({
        title: 'Success',
        description: 'Availability settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating availability settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const immediateBookingEnabled = form.watch('immediate_booking_allowed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Availability Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control when clients can book appointments and how far in advance
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* Online Booking Toggle */}
                <FormField
                  control={form.control}
                  name="online_booking_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Online booking enabled
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Allow clients to book appointments online through your booking system
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Immediate Booking */}
                <FormField
                  control={form.control}
                  name="immediate_booking_allowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Immediate booking
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Allow clients to book appointments for today or with short notice
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Immediate Booking Buffer */}
                {immediateBookingEnabled && (
                  <FormField
                    control={form.control}
                    name="immediate_booking_buffer_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Immediate booking limit</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select booking limit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {immediateBookingOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Future Booking Limit */}
                <FormField
                  control={form.control}
                  name="future_booking_limit_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Future booking limit
                      </FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select future booking limit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {futureBookingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  These settings apply to all online booking channels. Team members can still book appointments outside these restrictions when booking manually.
                </AlertDescription>
              </Alert>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};