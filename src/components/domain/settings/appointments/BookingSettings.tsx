import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, UserX, RotateCcw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { appointmentSettingsApi } from '@/api/appointmentSettings';

const cancellationOptions = [
  { value: 0, label: 'Anytime (no restrictions)' },
  { value: 1, label: 'Up to 1 hour before start time' },
  { value: 2, label: 'Up to 2 hours before start time' },
  { value: 6, label: 'Up to 6 hours before start time' },
  { value: 12, label: 'Up to 12 hours before start time' },
  { value: 24, label: 'Up to 1 day before start time' },
  { value: 48, label: 'Up to 2 days before start time' },
  { value: 168, label: 'Up to 1 week before start time' },
];

const reschedulingOptions = [
  { value: 0, label: 'Anytime (no restrictions)' },
  { value: 1, label: 'Up to 1 hour before start time' },
  { value: 2, label: 'Up to 2 hours before start time' },
  { value: 6, label: 'Up to 6 hours before start time' },
  { value: 12, label: 'Up to 12 hours before start time' },
  { value: 24, label: 'Up to 1 day before start time' },
  { value: 48, label: 'Up to 2 days before start time' },
  { value: 168, label: 'Up to 1 week before start time' },
];

const formSchema = z.object({
  allow_team_member_selection: z.boolean(),
  allow_group_appointments: z.boolean(),
  max_group_size: z.number().min(1).max(20),
  cancellation_allowed: z.boolean(),
  cancellation_buffer_hours: z.number().min(0),
  rescheduling_allowed: z.boolean(),
  rescheduling_buffer_hours: z.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

export const BookingSettings = () => {
  const { toast } = useToast();
  const { currentStudio } = useRole();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      allow_team_member_selection: true,
      allow_group_appointments: false,
      max_group_size: 1,
      cancellation_allowed: true,
      cancellation_buffer_hours: 24,
      rescheduling_allowed: true,
      rescheduling_buffer_hours: 24,
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!currentStudio) return;

      try {
        const rules = await appointmentSettingsApi.getBookingRules(currentStudio.id);
        if (rules) {
          form.reset({
            allow_team_member_selection: rules.allow_team_member_selection,
            allow_group_appointments: rules.allow_group_appointments,
            max_group_size: rules.max_group_size,
            cancellation_allowed: rules.cancellation_allowed,
            cancellation_buffer_hours: rules.cancellation_buffer_hours,
            rescheduling_allowed: rules.rescheduling_allowed,
            rescheduling_buffer_hours: rules.rescheduling_buffer_hours,
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
        description: 'Booking settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating booking settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Booking Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupAppointmentsEnabled = form.watch('allow_group_appointments');
  const cancellationEnabled = form.watch('cancellation_allowed');
  const reschedulingEnabled = form.watch('rescheduling_allowed');

  return (
    <div className="space-y-6">
      {/* Team Member & Group Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Member & Group Bookings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how clients can select team members and book group appointments
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* Team Member Selection */}
                <FormField
                  control={form.control}
                  name="allow_team_member_selection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Allow team member selection
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Let clients choose which team member they want for their appointment
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

                {/* Group Appointments */}
                <FormField
                  control={form.control}
                  name="allow_group_appointments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Allow group appointments
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable clients to book appointments for multiple people
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

                {/* Max Group Size */}
                {groupAppointmentsEnabled && (
                  <FormField
                    control={form.control}
                    name="max_group_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum group size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            className="w-32"
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          Maximum number of people allowed in a group appointment
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-primary" />
            Cancellation Policy
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set rules for when clients can cancel their appointments
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* Cancellation Allowed */}
                <FormField
                  control={form.control}
                  name="cancellation_allowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Allow cancellations
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Let clients cancel their own appointments
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

                {/* Cancellation Buffer */}
                {cancellationEnabled && (
                  <FormField
                    control={form.control}
                    name="cancellation_buffer_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation deadline</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cancellation deadline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cancellationOptions.map((option) => (
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
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Rescheduling Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
            Rescheduling Policy
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set rules for when clients can reschedule their appointments
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* Rescheduling Allowed */}
                <FormField
                  control={form.control}
                  name="rescheduling_allowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Allow rescheduling
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Let clients reschedule their own appointments
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

                {/* Rescheduling Buffer */}
                {reschedulingEnabled && (
                  <FormField
                    control={form.control}
                    name="rescheduling_buffer_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rescheduling deadline</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rescheduling deadline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reschedulingOptions.map((option) => (
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
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  These policies apply to client self-service actions. Team members can always cancel or reschedule appointments when managing them manually.
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