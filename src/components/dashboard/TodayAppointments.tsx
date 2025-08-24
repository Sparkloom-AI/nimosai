
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

const TodayAppointments = () => {
  // Mock data - in real app this would come from API
  const appointments = [
    {
      id: 1,
      time: "10:00 AM",
      client: "Emma Wilson",
      service: "Haircut & Style",
      status: "confirmed",
      duration: "1h"
    },
    {
      id: 2,
      time: "11:30 AM", 
      client: "Michael Brown",
      service: "Beard Trim",
      status: "pending",
      duration: "30m"
    },
    {
      id: 3,
      time: "2:00 PM",
      client: "Sarah Davis",
      service: "Color & Highlights",
      status: "confirmed",
      duration: "2h"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Today's Next Appointments</CardTitle>
        <p className="text-sm text-muted-foreground">{appointments.length} appointments remaining</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {appointment.time}
              </div>
              <div>
                <div className="flex items-center font-medium">
                  <User className="h-4 w-4 mr-1" />
                  {appointment.client}
                </div>
                <div className="text-sm text-muted-foreground">{appointment.service}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
              <span className="text-xs text-muted-foreground">{appointment.duration}</span>
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No more appointments today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;
