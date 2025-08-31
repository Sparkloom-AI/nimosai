import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  MoreVertical,
  Calendar,
  Scissors,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserCheck,
  Play,
  Pause
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/scheduling';

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onEdit?: (appointment: AppointmentWithRelations) => void;
  onCancel?: (appointmentId: string) => void;
  onReschedule?: (appointment: AppointmentWithRelations) => void;
  onUpdateStatus?: (appointmentId: string, status: AppointmentStatus) => void;
  onViewClient?: (clientId: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onCancel,
  onReschedule,
  onUpdateStatus,
  onViewClient,
  compact = false,
  showActions = true
}) => {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'arrived':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-3 w-3" />;
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'arrived':
        return <UserCheck className="h-3 w-3" />;
      case 'in_progress':
        return <Play className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      case 'no_show':
        return <AlertCircle className="h-3 w-3" />;
      case 'rescheduled':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      case 'pending':
        return 'text-gray-600';
      case 'refunded':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getClientInitials = () => {
    if (!appointment.client) return 'WI'; // Walk-in
    return `${appointment.client.first_name.charAt(0)}${appointment.client.last_name.charAt(0)}`;
  };

  const getClientName = () => {
    if (!appointment.client) return 'Walk-in Client';
    return `${appointment.client.first_name} ${appointment.client.last_name}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleStatusChange = (status: AppointmentStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(appointment.id, status);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <div 
          className="w-1 h-12 rounded-full"
          style={{ backgroundColor: appointment.team_member?.calendar_color || '#3B82F6' }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{getClientName()}</span>
            <Badge variant="outline" className={cn("text-xs", getStatusColor(appointment.status))}>
              {appointment.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </span>
            <span className="flex items-center gap-1">
              <Scissors className="h-3 w-3" />
              {appointment.service?.name}
            </span>
          </div>
        </div>

        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(appointment)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onReschedule && (
                <DropdownMenuItem onClick={() => onReschedule(appointment)}>
                  Reschedule
                </DropdownMenuItem>
              )}
              {onCancel && appointment.status !== 'cancelled' && (
                <DropdownMenuItem 
                  onClick={() => onCancel(appointment.id)}
                  className="text-red-600"
                >
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback 
                className="text-sm font-medium"
                style={{ backgroundColor: appointment.team_member?.calendar_color || '#3B82F6', color: 'white' }}
              >
                {getClientInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-medium text-base">{getClientName()}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {appointment.client?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {appointment.client.phone}
                  </span>
                )}
                {appointment.client?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {appointment.client.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("flex items-center gap-1", getStatusColor(appointment.status))}>
              {getStatusIcon(appointment.status)}
              {appointment.status.replace('_', ' ')}
            </Badge>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {appointment.status === 'scheduled' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('confirmed')}>
                      Confirm Appointment
                    </DropdownMenuItem>
                  )}
                  {appointment.status === 'confirmed' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('arrived')}>
                      Mark as Arrived
                    </DropdownMenuItem>
                  )}
                  {appointment.status === 'arrived' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                      Start Service
                    </DropdownMenuItem>
                  )}
                  {appointment.status === 'in_progress' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                      Complete Service
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(appointment)}>
                      Edit Appointment
                    </DropdownMenuItem>
                  )}
                  {onReschedule && (
                    <DropdownMenuItem onClick={() => onReschedule(appointment)}>
                      Reschedule
                    </DropdownMenuItem>
                  )}
                  {appointment.client && onViewClient && (
                    <DropdownMenuItem onClick={() => onViewClient(appointment.client!.id)}>
                      View Client Profile
                    </DropdownMenuItem>
                  )}
                  {onCancel && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <DropdownMenuItem 
                      onClick={() => onCancel(appointment.id)}
                      className="text-red-600"
                    >
                      Cancel Appointment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </span>
            
            <span className="flex items-center gap-1 text-muted-foreground">
              <Scissors className="h-4 w-4" />
              {appointment.service?.name}
            </span>
            
            <span className="flex items-center gap-1 text-muted-foreground">
              <User className="h-4 w-4" />
              {appointment.team_member?.first_name} {appointment.team_member?.last_name}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {appointment.location?.name}
            </span>
            
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className={getPaymentStatusColor(appointment.payment_status)}>
                ${appointment.total_price} ({appointment.payment_status})
              </span>
            </span>
          </div>

          {appointment.notes && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              {appointment.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;