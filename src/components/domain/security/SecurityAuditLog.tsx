import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/contexts/RoleContext';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SecurityAuditLogProps {
  studioId?: string;
}

const SecurityAuditLog: React.FC<SecurityAuditLogProps> = ({ studioId }) => {
  const { hasPermission, currentRole } = useRole();

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['security-audit-log', studioId],
    queryFn: async () => {
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (studioId && currentRole !== 'super_admin') {
        query = query.eq('studio_id', studioId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('canManageRoles') || currentRole === 'super_admin',
  });

  const getEventBadge = (eventType: string, success: boolean) => {
    if (!success) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        {eventType}
      </Badge>;
    }

    switch (eventType) {
      case 'role_assigned':
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Role Assigned
        </Badge>;
      case 'role_removed':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Role Removed
        </Badge>;
      case 'login_attempt':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Login Attempt
        </Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  const formatEventDetails = (details: any) => {
    if (!details) return 'No details';
    
    const relevantDetails = Object.entries(details)
      .filter(([key]) => !['timestamp', 'url'].includes(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    return relevantDetails || 'No details';
  };

  if (!hasPermission('canManageRoles') && currentRole !== 'super_admin') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to view security audit logs.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!auditLogs || auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No security events recorded yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {getEventBadge(log.event_type, log.success)}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm text-muted-foreground truncate">
                      {formatEventDetails(log.event_details)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-xs text-muted-foreground truncate">
                      {log.user_agent ? log.user_agent.substring(0, 50) + '...' : 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(log.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'HH:mm:ss')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;