import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/api/team';
import { toast } from 'sonner';
import { TeamMember, EmploymentType, PermissionLevel } from '@/types/team';

interface EditTeamMemberModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onSuccess: () => void;
}

const EditTeamMemberModal = ({ isOpen, onOpenChange, member, onSuccess }: EditTeamMemberModalProps) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    employment_type: 'full_time' as EmploymentType,
    permission_level: 'low' as PermissionLevel,
    is_bookable: true,
    calendar_color: '#3B82F6',
    hourly_rate: '',
    commission_rate: '',
    notes: '',
  });

  // Pre-populate form when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        job_title: member.job_title || '',
        employment_type: member.employment_type || 'full_time',
        permission_level: member.permission_level || 'low',
        is_bookable: member.is_bookable ?? true,
        calendar_color: member.calendar_color || '#3B82F6',
        hourly_rate: member.hourly_rate?.toString() || '',
        commission_rate: member.commission_rate?.toString() || '',
        notes: member.notes || '',
      });
    }
  }, [member]);

  const updateTeamMember = useMutation({
    mutationFn: (data: any) => teamApi.updateTeamMember(member!.id, data),
    onSuccess: () => {
      toast.success('Team member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update team member');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member) return;

    const updateData = {
      ...formData,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null,
    };

    updateTeamMember.mutate(updateData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const employmentTypes = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'intern', label: 'Intern' },
  ];

  const permissionLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="work">Work Details</TabsTrigger>
              <TabsTrigger value="pay">Pay</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Work Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => handleInputChange('job_title', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employment_type">Employment Type</Label>
                      <Select 
                        value={formData.employment_type} 
                        onValueChange={(value) => handleInputChange('employment_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {employmentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="permission_level">Permission Level</Label>
                      <Select 
                        value={formData.permission_level} 
                        onValueChange={(value) => handleInputChange('permission_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {permissionLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calendar_color">Calendar Color</Label>
                      <Input
                        id="calendar_color"
                        type="color"
                        value={formData.calendar_color}
                        onChange={(e) => handleInputChange('calendar_color', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                      <Checkbox
                        id="is_bookable"
                        checked={formData.is_bookable}
                        onCheckedChange={(checked) => handleInputChange('is_bookable', checked)}
                      />
                      <Label htmlFor="is_bookable">Available for booking</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pay" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pay Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        step="0.01"
                        value={formData.hourly_rate}
                        onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                      <Input
                        id="commission_rate"
                        type="number"
                        step="0.01"
                        value={formData.commission_rate}
                        onChange={(e) => handleInputChange('commission_rate', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateTeamMember.isPending}
            >
              {updateTeamMember.isPending ? 'Updating...' : 'Update Team Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamMemberModal;