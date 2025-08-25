
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/api/roles';
import { useRole } from '@/contexts/RoleContext';
import { AppRole, getRoleDisplayName, ROLE_HIERARCHY } from '@/types/roles';
import { toast } from 'sonner';
import { Plus, Trash2, Shield } from 'lucide-react';

interface RoleManagementProps {
  studioId: string;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ studioId }) => {
  const { currentRole, hasPermission } = useRole();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('staff');

  const { data: studioUsers, isLoading, refetch } = useQuery({
    queryKey: ['studio-users', studioId],
    queryFn: () => rolesApi.getStudioUsers(studioId),
    enabled: !!studioId && hasPermission('canManageRoles'),
  });

  const availableRoles: AppRole[] = currentRole === 'super_admin' 
    ? ['studio_owner', 'manager', 'staff', 'receptionist']
    : ['manager', 'staff', 'receptionist'];

  const handleAssignRole = async () => {
    if (!newUserEmail || !newUserRole) {
      toast.error('Please enter email and select a role');
      return;
    }

    try {
      // In a real implementation, you'd need to find the user by email first
      // For now, this is a placeholder - you'd implement user lookup
      toast.info('User role assignment functionality needs user lookup implementation');
      setNewUserEmail('');
    } catch (error) {
      toast.error('Failed to assign role');
      console.error('Role assignment error:', error);
    }
  };

  const handleRemoveRole = async (roleId: string, userName: string) => {
    if (!confirm(`Remove role for ${userName}?`)) return;

    try {
      await rolesApi.removeRole(roleId);
      toast.success('Role removed successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to remove role');
      console.error('Role removal error:', error);
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'studio_owner': return 'default';
      case 'manager': return 'secondary';
      case 'staff': return 'outline';
      case 'receptionist': return 'outline';
      default: return 'outline';
    }
  };

  if (!hasPermission('canManageRoles')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to manage user roles.
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
    <div className="space-y-6">
      {/* Add New Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Assign User Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="User email address"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={newUserRole} onValueChange={(value: AppRole) => setNewUserRole(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssignRole}>
              Assign Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Studio Team Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {!studioUsers || studioUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members with assigned roles yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studioUsers.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {(userRole as any).profiles?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(userRole as any).profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(userRole.role)}>
                        {getRoleDisplayName(userRole.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(userRole.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {ROLE_HIERARCHY[userRole.role] > ROLE_HIERARCHY[currentRole || 'receptionist'] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRole(
                            userRole.id, 
                            (userRole as any).profiles?.full_name || 'Unknown User'
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;
