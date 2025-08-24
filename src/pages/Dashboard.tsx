
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Today\'s Revenue',
      value: '$1,247',
      change: '+12%',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: 'Appointments Today',
      value: '18',
      change: '+3',
      icon: Calendar,
      color: 'text-primary'
    },
    {
      title: 'Active Clients',
      value: '342',
      change: '+24',
      icon: Users,
      color: 'text-accent'
    },
    {
      title: 'WhatsApp Messages',
      value: '67',
      change: '+15',
      icon: MessageSquare,
      color: 'text-secondary'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      client: 'Sarah Johnson',
      service: 'Haircut & Style',
      time: '10:30 AM',
      status: 'confirmed',
      staff: 'Maria'
    },
    {
      id: 2,
      client: 'Emily Chen',
      service: 'Manicure',
      time: '11:00 AM',
      status: 'pending',
      staff: 'Lisa'
    },
    {
      id: 3,
      client: 'Jessica Williams',
      service: 'Color Treatment',
      time: '2:00 PM',
      status: 'confirmed',
      staff: 'Maria'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Good morning, Bella! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening at your salon today
            </p>
          </div>
          <Button className="gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.color}`}>
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {stat.change} from yesterday
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    Today's Appointments
                  </CardTitle>
                  <CardDescription>
                    {upcomingAppointments.length} appointments scheduled
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {appointment.client.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service} • {appointment.staff}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{appointment.time}</p>
                        <div className="flex items-center mt-1">
                          {appointment.status === 'confirmed' ? (
                            <CheckCircle className="w-3 h-3 text-success mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 text-warning mr-1" />
                          )}
                          <span className={`text-xs capitalize ${
                            appointment.status === 'confirmed' ? 'text-success' : 'text-warning'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-secondary" />
                WhatsApp Assistant
              </CardTitle>
              <CardDescription>
                AI-powered booking and client communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-secondary">Active</p>
                      <p className="text-sm text-muted-foreground">
                        Responding to client messages
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Chats
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">Recent Activity</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      • 3 appointments booked via WhatsApp
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • 2 appointment confirmations sent
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • 5 FAQ responses provided
                    </p>
                  </div>

                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Configure Assistant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
