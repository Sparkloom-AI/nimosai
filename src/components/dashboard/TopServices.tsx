
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Scissors, Palette, Sparkles } from 'lucide-react';

const TopServices = () => {
  // Mock data - in real app this would come from API
  const services = [
    {
      id: 1,
      name: "Haircut & Style",
      bookings: 45,
      percentage: 85,
      icon: Scissors,
      revenue: 1350
    },
    {
      id: 2,
      name: "Hair Coloring",
      bookings: 32,
      percentage: 60,
      icon: Palette,
      revenue: 1920
    },
    {
      id: 3,
      name: "Highlights",
      bookings: 28,
      percentage: 50,
      icon: Sparkles,
      revenue: 1680
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Services</CardTitle>
        <p className="text-sm text-muted-foreground">Most popular services this week</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => {
          const IconComponent = service.icon;
          return (
            <div key={service.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{service.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${service.revenue}</div>
                  <div className="text-xs text-muted-foreground">{service.bookings} bookings</div>
                </div>
              </div>
              <Progress value={service.percentage} className="h-2" />
            </div>
          );
        })}
        {services.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No service data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopServices;
