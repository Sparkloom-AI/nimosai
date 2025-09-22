
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/api/team';
import { useRole } from '@/contexts/RoleContext';
import AddTeamMemberModal from '@/components/domain/team/AddTeamMemberModal';
import EditTeamMemberModal from '@/components/domain/team/EditTeamMemberModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Team = () => {
  const { currentStudioId } = useRole();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const { data: teamMembers, isLoading, refetch } = useQuery({
    queryKey: ['team-members', currentStudioId],
    queryFn: () => currentStudioId ? teamApi.getTeamMembers(currentStudioId) : Promise.resolve([]),
    enabled: !!currentStudioId,
  });

  const filteredTeamMembers = teamMembers?.filter(member => 
    member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
      await teamApi.deleteTeamMember(id);
      toast.success('Team member deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    } catch (error) {
      toast.error('Failed to delete team member');
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const handleViewSchedule = (member: any) => {
    navigate('/scheduled-shifts', { 
      state: { selectedTeamMember: member.id } 
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatEmploymentType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading || !currentStudioId) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team</h1>
            <p className="text-muted-foreground">
              Manage your team members, their roles, and schedules
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers?.filter(m => !m.end_date).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full-Time</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers?.filter(m => m.employment_type === 'full_time').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookable Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers?.filter(m => m.is_bookable).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>

          {/* Team Members Table */}
          <CardContent>
            {filteredTeamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No team members found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first team member'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback 
                              className="text-white"
                              style={{ backgroundColor: member.calendar_color }}
                            >
                              {getInitials(member.first_name, member.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {member.first_name} {member.last_name}
                            </div>
                            {member.team_member_id && (
                              <div className="text-sm text-muted-foreground">
                                ID: {member.team_member_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-2" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium">{member.job_title || 'No Title'}</div>
                          <Badge variant="outline" className="text-xs">
                            {member.permission_level}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">
                          {formatEmploymentType(member.employment_type)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge variant={member.end_date ? "destructive" : "default"}>
                            {member.end_date ? 'Inactive' : 'Active'}
                          </Badge>
                          {member.is_bookable && (
                            <Badge variant="outline" className="text-xs">
                              Bookable
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(member)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewSchedule(member)}>
                              <MapPin className="h-4 w-4 mr-2" />
                              View Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(member.id, `${member.first_name} ${member.last_name}`)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Team Member Modal */}
        <AddTeamMemberModal 
          isOpen={isAddModalOpen} 
          onOpenChange={setIsAddModalOpen}
          onSuccess={refetch}
        />

        {/* Edit Team Member Modal */}
        <EditTeamMemberModal 
          isOpen={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen}
          member={editingMember}
          onSuccess={refetch}
        />
      </div>
    </DashboardLayout>
  );
};

export default Team;
