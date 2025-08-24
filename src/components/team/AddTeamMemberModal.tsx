
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { teamApi } from '@/api/team';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, X, User, MapPin, Briefcase, DollarSign } from 'lucide-react';

const teamMemberSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contractor', 'intern']),
  permission_level: z.enum(['low', 'medium', 'high']),
  team_member_id: z.string().optional(),
  calendar_color: z.string().default('#3B82F6'),
  hourly_rate: z.string().optional(),
  commission_rate: z.string().optional(),
  is_bookable: z.boolean().default(true),
  notes: z.string().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

interface AddTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Array<{
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    address_type: string;
    is_primary: boolean;
  }>>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{
    contact_name: string;
    relationship: string;
    phone: string;
    email?: string;
    is_primary: boolean;
  }>>([]);

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      employment_type: 'full_time',
      permission_level: 'low',
      calendar_color: '#3B82F6',
      is_bookable: true,
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch services and locations
  const { data: services } = useQuery({
    queryKey: ['services', user?.id],
    queryFn: () => user?.id ? teamApi.getServices(user.id) : Promise.resolve([]),
    enabled: !!user?.id && open,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations', user?.id],
    queryFn: () => user?.id ? teamApi.getLocations(user.id) : Promise.resolve([]),
    enabled: !!user?.id && open,
  });

  const handleSubmit = async (data: TeamMemberFormData) => {
    if (!user?.id) return;

    try {
      // Create team member
      const teamMember = await teamApi.createTeamMember({
        ...data,
        studio_id: user.id,
        hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
        commission_rate: data.commission_rate ? parseFloat(data.commission_rate) : null,
        end_date: data.end_date || null,
      });

      // Add addresses
      for (const address of addresses) {
        await teamApi.addTeamMemberAddress({
          team_member_id: teamMember.id,
          ...address,
        });
      }

      // Add emergency contacts
      for (const contact of emergencyContacts) {
        await teamApi.addEmergencyContact({
          team_member_id: teamMember.id,
          ...contact,
        });
      }

      // Assign services
      for (const serviceId of selectedServices) {
        await teamApi.assignService({
          team_member_id: teamMember.id,
          service_id: serviceId,
        });
      }

      // Assign locations
      for (const locationId of selectedLocations) {
        await teamApi.assignLocation({
          team_member_id: teamMember.id,
          location_id: locationId,
          is_primary: selectedLocations.indexOf(locationId) === 0,
        });
      }

      toast.success('Team member added successfully');
      onSuccess();
      onOpenChange(false);
      form.reset();
      setSelectedServices([]);
      setSelectedLocations([]);
      setAddresses([]);
      setEmergencyContacts([]);
      setActiveTab('personal');
    } catch (error) {
      console.error('Error creating team member:', error);
      toast.error('Failed to add team member');
    }
  };

  const addAddress = () => {
    setAddresses([...addresses, {
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      address_type: 'home',
      is_primary: addresses.length === 0,
    }]);
  };

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, {
      contact_name: '',
      relationship: '',
      phone: '',
      email: '',
      is_primary: emergencyContacts.length === 0,
    }]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="workspace" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Workspace
                </TabsTrigger>
                <TabsTrigger value="locations" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Locations
                </TabsTrigger>
                <TabsTrigger value="pay" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pay & Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="job_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="calendar_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calendar Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              {colorOptions.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`w-8 h-8 rounded border-2 ${
                                    field.value === color ? 'border-gray-900' : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => field.onChange(color)}
                                />
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Addresses Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Addresses</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addAddress}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {addresses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No addresses added</p>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address, index) => (
                          <div key={index} className="border rounded p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <Badge variant="outline">{address.address_type}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAddress(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* Address form fields would go here */}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Emergency Contacts Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Emergency Contacts</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {emergencyContacts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No emergency contacts added</p>
                    ) : (
                      <div className="space-y-4">
                        {emergencyContacts.map((contact, index) => (
                          <div key={index} className="border rounded p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <Badge variant={contact.is_primary ? "default" : "outline"}>
                                {contact.is_primary ? "Primary" : "Secondary"}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEmergencyContact(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* Emergency contact form fields would go here */}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workspace" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {services && services.length > 0 ? (
                      <div className="space-y-2">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={service.id}
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedServices([...selectedServices, service.id]);
                                } else {
                                  setSelectedServices(selectedServices.filter(id => id !== service.id));
                                }
                              }}
                            />
                            <label htmlFor={service.id} className="flex-1 cursor-pointer">
                              <div className="flex justify-between">
                                <span>{service.name}</span>
                                <span className="text-muted-foreground">${service.price}</span>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No services available. Create services first.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="locations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {locations && locations.length > 0 ? (
                      <div className="space-y-2">
                        {locations.map((location) => (
                          <div key={location.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={location.id}
                              checked={selectedLocations.includes(location.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedLocations([...selectedLocations, location.id]);
                                } else {
                                  setSelectedLocations(selectedLocations.filter(id => id !== location.id));
                                }
                              }}
                            />
                            <label htmlFor={location.id} className="flex-1 cursor-pointer">
                              <div>
                                <div className="font-medium">{location.name}</div>
                                <div className="text-sm text-muted-foreground">{location.address}</div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No locations available. Create locations first.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pay" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Employment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employment_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full_time">Full Time</SelectItem>
                                <SelectItem value="part_time">Part Time</SelectItem>
                                <SelectItem value="contractor">Contractor</SelectItem>
                                <SelectItem value="intern">Intern</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="permission_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permission Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hourly_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="commission_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission Rate (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" max="100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="team_member_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Member ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Optional ID for internal use" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_bookable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Available for booking
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Team Member
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
