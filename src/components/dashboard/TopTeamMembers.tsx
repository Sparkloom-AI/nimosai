
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Users } from 'lucide-react';

const TopTeamMembers = () => {
  // Mock data - in real app this would come from API
  const teamMembers = [
    {
      id: 1,
      name: "Jessica Martinez",
      role: "Senior Stylist",
      appointments: 28,
      rating: 4.9,
      revenue: 2100
    },
    {
      id: 2,
      name: "David Chen",
      role: "Barber",
      appointments: 35,
      rating: 4.8,
      revenue: 1750
    },
    {
      id: 3,
      name: "Sophie Anderson",
      role: "Colorist",
      appointments: 22,
      rating: 4.9,
      revenue: 1980
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Team Members</CardTitle>
        <p className="text-sm text-muted-foreground">Performance this week</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamMembers.map((member, index) => (
          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                {index < 3 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                )}
              </div>
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.role}</div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm font-medium">${member.revenue}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                {member.rating}
                <span className="mx-1">•</span>
                <Users className="h-3 w-3 mr-1" />
                {member.appointments}
              </div>
            </div>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No team member data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopTeamMembers;
