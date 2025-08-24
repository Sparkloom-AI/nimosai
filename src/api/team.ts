
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];

export const teamApi = {
  // Fetch all team members for a studio
  async getTeamMembers(studioId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        team_member_addresses(*),
        team_member_emergency_contacts(*),
        team_member_services(
          *,
          services(name, price, duration)
        ),
        team_member_locations(
          *,
          locations(name, address)
        )
      `)
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create a new team member
  async createTeamMember(teamMember: TeamMemberInsert) {
    const { data, error } = await supabase
      .from('team_members')
      .insert(teamMember)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update team member
  async updateTeamMember(id: string, updates: TeamMemberUpdate) {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete team member
  async deleteTeamMember(id: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Add team member address
  async addTeamMemberAddress(address: Database['public']['Tables']['team_member_addresses']['Insert']) {
    const { data, error } = await supabase
      .from('team_member_addresses')
      .insert(address)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Add emergency contact
  async addEmergencyContact(contact: Database['public']['Tables']['team_member_emergency_contacts']['Insert']) {
    const { data, error } = await supabase
      .from('team_member_emergency_contacts')
      .insert(contact)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Assign service to team member
  async assignService(assignment: Database['public']['Tables']['team_member_services']['Insert']) {
    const { data, error } = await supabase
      .from('team_member_services')
      .insert(assignment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Remove service from team member
  async removeService(teamMemberId: string, serviceId: string) {
    const { error } = await supabase
      .from('team_member_services')
      .delete()
      .eq('team_member_id', teamMemberId)
      .eq('service_id', serviceId);
    
    if (error) throw error;
  },

  // Assign location to team member
  async assignLocation(assignment: Database['public']['Tables']['team_member_locations']['Insert']) {
    const { data, error } = await supabase
      .from('team_member_locations')
      .insert(assignment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get services for assignment
  async getServices(studioId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('studio_id', studioId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  },

  // Get locations for assignment
  async getLocations(studioId: string) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('studio_id', studioId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  }
};
