
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const AppointmentsActivity = () => {
  // Mock data for the chart
  const data = [
    { name: 'Mon', appointments: 12 },
    { name: 'Tue', appointments: 19 },
    { name: 'Wed', appointments: 15 },
    { name: 'Thu', appointments: 22 },
    { name: 'Fri', appointments: 28 },
    { name: 'Sat', appointments: 35 },
    { name: 'Sun', appointments: 18 },
  ];

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Appointments Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Weekly overview of appointments</p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <Line 
                type="monotone" 
                dataKey="appointments" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentsActivity;
