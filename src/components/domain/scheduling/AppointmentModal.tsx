import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, User, MapPin, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Client, Appointment, BookingRequest } from '@/types/scheduling';
import type { TeamMember } from '@/types/team';
import type { Service } from '@/types/services';

const appointmentSchema = z.object({
  client_id: z.string().optional(),
  team_member_id: z.string().min(1, 'Team member is required'),
  service_id: z.string().min(1, 'Service is required'),
  location_id: z.string().min(1, 'Location is required'),
  appointment_date: z.date({ required_error: 'Appointment date is required' }),
  start_time: z.string().min(1, 'Start time is required'),
  notes: z.string().optional(),
  client_name: z.string().optional(),
  client_phone: z.string().optional(),
  client_email: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: BookingRequest) => Promise<void>;
  appointment?: Appointment;
  clients: Client[];
  teamMembers: TeamMember[];
  services: Service[];
  locations: Array<{ id: string; name: string; address: string }>;
  isLoading?: boolean;
  defaultDate?: Date;
  defaultTeamMember?: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  clients,
  teamMembers,
  services,
  locations,
  isLoading = false,
  defaultDate,
  defaultTeamMember
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      client_id: appointment?.client_id || '',
      team_member_id: appointment?.team_member_id || defaultTeamMember || '',
      service_id: appointment?.service_id || '',
      location_id: appointment?.location_id || '',
      appointment_date: appointment ? new Date(appointment.appointment_date) : defaultDate,
      start_time: appointment?.start_time || '',
      notes: appointment?.notes || '',
    },
  });

  useEffect(() => {
    if (appointment) {
      form.reset({
        client_id: appointment.client_id || '',
        team_member_id: appointment.team_member_id,
        service_id: appointment.service_id,
        location_id: appointment.location_id,
        appointment_date: new Date(appointment.appointment_date),
        start_time: appointment.start_time,
        notes: appointment.notes || '',
      });
    }
  }, [appointment, form]);

  useEffect(() => {
    const serviceId = form.watch('service_id');
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      setSelectedService(service || null);
    }
  }, [form.watch('service_id'), services]);

  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      const bookingData: BookingRequest = {
        client_id: isNewClient ? undefined : data.client_id || undefined,
        team_member_id: data.team_member_id,
        service_id: data.service_id,
        location_id: data.location_id,
        appointment_date: format(data.appointment_date, 'yyyy-MM-dd'),
        start_time: data.start_time,
        notes: data.notes,
        booking_source: 'staff'
      };

      await onSave(bookingData);
      onClose();
      toast.success(appointment ? 'Appointment updated successfully' : 'Appointment created successfully');
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save appointment');
    }
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime || !duration) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewClient(!isNewClient)}
                >
                  {isNewClient ? 'Select Existing' : 'New Client'}
                </Button>
              </div>

              {!isNewClient ? (
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a client..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.first_name} {client.last_name}
                              {client.phone && (
                                <span className="text-muted-foreground ml-2">
                                  {client.phone}
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="client_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Full name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Service and Team Member */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      Service
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{service.name}</span>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{service.duration}min</span>
                                <span>${service.price}</span>
                              </div>
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
                name="team_member_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Team Member
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: member.calendar_color }}
                              />
                              {member.first_name} {member.last_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-muted-foreground">{location.address}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="center"
                        side="bottom"
                        sideOffset={4}
                        avoidCollisions={true}
                        collisionPadding={8}
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          classNames={{
                            caption: "hidden",
                            nav: "hidden"
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start Time
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {generateTimeSlots().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Details */}
            {selectedService && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-medium mb-2">Service Details</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">{selectedService.duration} minutes</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <div className="font-medium">${selectedService.price}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Time:</span>
                    <div className="font-medium">
                      {form.watch('start_time') 
                        ? calculateEndTime(form.watch('start_time'), selectedService.duration)
                        : '--:--'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any special requests or notes..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : appointment ? 'Update' : 'Create'} Appointment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;