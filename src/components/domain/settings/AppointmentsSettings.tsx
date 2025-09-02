import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Settings, Users } from 'lucide-react';
import { AvailabilitySettings } from './appointments/AvailabilitySettings';
import { BookingSettings } from './appointments/BookingSettings';

export const AppointmentsSettings = () => {
  const [activeTab, setActiveTab] = useState('availability');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Configure how clients can book, reschedule, and cancel appointments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="space-y-6">
          <AvailabilitySettings />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <BookingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};