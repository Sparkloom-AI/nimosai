
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { teamApi } from '@/api/team';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, Phone, Briefcase, DollarSign, Calendar } from 'lucide-react';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddTeamMemberModal = ({ isOpen, onOpenChange, onSuccess }: AddTeamMemberModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');

  // Form state
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    avatar_url: '',
    job_title: '',
    calendar_color: '#3B82F6',
    notes: '',
    
    // Work Details
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    employment_type: 'full_time' as const,
    team_member_id: '',
    is_bookable: true,
    permission_level: 'low' as const,
    
    // Pay
    hourly_rate: 0,
    commission_rate: 0,
  });

  // Address state
  const [addresses, setAddresses] = useState([{
    address_type: 'home',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    is_primary: true
  }]);

  // Emergency contact state
  const [emergencyContacts, setEmergencyContacts] = useState([{
    contact_name: '',
    relationship: '',
    phone: '',
    email: '',
    is_primary: true
  }]);

  // Selected services and locations
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Fetch services and locations
  const { data: services = [] } = useQuery({
    queryKey: ['services', user?.id],
    queryFn: () => user?.id ? teamApi.getServices(user.id) : Promise.resolve([]),
    enabled: !!user?.id
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', user?.id],
    queryFn: () => user?.id ? teamApi.getLocations(user.id) : Promise.resolve([]),
    enabled: !!user?.id
  });

  // Create team member mutation
  const createTeamMember = useMutation({
    mutationFn: teamApi.createTeamMember,
    onSuccess: async (newTeamMember) => {
      // Add addresses
      for (const address of addresses) {
        if (address.street_address) {
          await teamApi.addTeamMemberAddress({
            team_member_id: newTeamMember.id,
            ...address
          });
        }
      }

      // Add emergency contacts
      for (const contact of emergencyContacts) {
        if (contact.contact_name) {
          await teamApi.addEmergencyContact({
            team_member_id: newTeamMember.id,
            ...contact
          });
        }
      }

      // Assign services
      for (const serviceId of selectedServices) {
        await teamApi.assignService({
          team_member_id: newTeamMember.id,
          service_id: serviceId
        });
      }

      // Assign locations
      for (const locationId of selectedLocations) {
        await teamApi.assignLocation({
          team_member_id: newTeamMember.id,
          location_id: locationId,
          is_primary: selectedLocations.indexOf(locationId) === 0
        });
      }

      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Team member created successfully');
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating team member:', error);
      toast.error('Failed to create team member');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const teamMemberData = {
      studio_id: user.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      avatar_url: formData.avatar_url || undefined,
      job_title: formData.job_title || undefined,
      calendar_color: formData.calendar_color,
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
      employment_type: formData.employment_type,
      team_member_id: formData.team_member_id || undefined,
      notes: formData.notes || undefined,
      is_bookable: formData.is_bookable,
      permission_level: formData.permission_level,
      hourly_rate: formData.hourly_rate > 0 ? formData.hourly_rate : undefined,
      commission_rate: formData.commission_rate > 0 ? formData.commission_rate : undefined,
    };

    createTeamMember.mutate(teamMemberData);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      avatar_url: '',
      job_title: '',
      calendar_color: 'hsl(var(--primary))',
      notes: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      employment_type: 'full_time',
      team_member_id: '',
      is_bookable: true,
      permission_level: 'low',
      hourly_rate: 0,
      commission_rate: 0,
    });
    setAddresses([{
      address_type: 'home',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      is_primary: true
    }]);
    setEmergencyContacts([{
      contact_name: '',
      relationship: '',
      phone: '',
      email: '',
      is_primary: true
    }]);
    setSelectedServices([]);
    setSelectedLocations([]);
    setActiveTab('personal');
  };

  const handleAddAddress = () => {
    setAddresses(prev => [...prev, {
      address_type: 'home',
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      is_primary: false
    }]);
  };

  const handleAddressChange = (index: number, field: string, value: string) => {
    setAddresses(prev => {
      const updatedAddresses = [...prev];
      updatedAddresses[index][field] = value;
      return updatedAddresses;
    });
  };

  const handleRemoveAddress = (index: number) => {
    if (addresses.length <= 1) {
      toast.error('You must have at least one address');
      return;
    }
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddContact = () => {
    setEmergencyContacts(prev => [...prev, {
      contact_name: '',
      relationship: '',
      phone: '',
      email: '',
      is_primary: false
    }]);
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    setEmergencyContacts(prev => {
      const updatedContacts = [...prev];
      updatedContacts[index][field] = value;
      return updatedContacts;
    });
  };

  const handleRemoveContact = (index: number) => {
    if (emergencyContacts.length <= 1) {
      toast.error('You must have at least one emergency contact');
      return;
    }
    setEmergencyContacts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="workspace" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Workspace
              </TabsTrigger>
              <TabsTrigger value="pay" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pay
              </TabsTrigger>
              <TabsTrigger value="work-details" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Work Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Basic information about the team member</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="calendar_color">Calendar Color</Label>
                    <Input
                      id="calendar_color"
                      type="color"
                      value={formData.calendar_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, calendar_color: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Additional notes about the team member..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workspace" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Select which services this team member can provide</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={service.id}
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedServices(prev => [...prev, service.id]);
                            } else {
                              setSelectedServices(prev => prev.filter(id => id !== service.id));
                            }
                          }}
                        />
                        <Label htmlFor={service.id} className="text-sm">
                          {service.name} - ${service.price}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Locations</CardTitle>
                  <CardDescription>Select which locations this team member works at</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <div key={location.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={location.id}
                          checked={selectedLocations.includes(location.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLocations(prev => [...prev, location.id]);
                            } else {
                              setSelectedLocations(prev => prev.filter(id => id !== location.id));
                            }
                          }}
                        />
                        <Label htmlFor={location.id} className="text-sm">
                          {location.name} - {location.address}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pay" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compensation</CardTitle>
                  <CardDescription>Set up pay rates and commissions</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work-details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                  <CardDescription>Set employment terms and permissions</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select 
                      value={formData.employment_type} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, employment_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="permission_level">Permission Level</Label>
                    <Select 
                      value={formData.permission_level} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, permission_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="team_member_id">Team Member ID</Label>
                    <Input
                      id="team_member_id"
                      value={formData.team_member_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, team_member_id: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_bookable"
                      checked={formData.is_bookable}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_bookable: !!checked }))}
                    />
                    <Label htmlFor="is_bookable">Available for bookings</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTeamMember.isPending}>
              {createTeamMember.isPending ? 'Creating...' : 'Create Team Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberModal;
