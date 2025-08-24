
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

const UpcomingAppointments = () => {
  // Mock data - in real app this would come from API
  const upcomingCount = 8;
  const nextAppointment = {
    time: "2:30 PM",
    client: "Sarah Johnson"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{upcomingCount}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>Next: {nextAppointment.time} - {nextAppointment.client}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;
