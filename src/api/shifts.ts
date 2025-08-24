
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TeamShift = Database['public']['Tables']['team_shifts']['Row'];
type TeamShiftInsert = Database['public']['Tables']['team_shifts']['Insert'];
type TeamShiftUpdate = Database['public']['Tables']['team_shifts']['Update'];

export const shiftsApi = {
  // Fetch shifts for a specific week and studio
  async getShiftsForWeek(studioId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('team_shifts')
      .select(`
        *,
        team_members!inner(
          id,
          first_name,
          last_name,
          avatar_url,
          calendar_color,
          studio_id
        ),
        locations(
          name,
          address
        )
      `)
      .eq('team_members.studio_id', studioId)
      .gte('shift_date', startDate)
      .lte('shift_date', endDate)
      .order('shift_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Create a single shift
  async createShift(shift: TeamShiftInsert) {
    const { data, error } = await supabase
      .from('team_shifts')
      .insert(shift)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create regular shifts (recurring pattern)
  async createRegularShifts(shifts: TeamShiftInsert[]) {
    const { data, error } = await supabase
      .from('team_shifts')
      .insert(shifts)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update a shift
  async updateShift(id: string, updates: TeamShiftUpdate) {
    const { data, error } = await supabase
      .from('team_shifts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a shift
  async deleteShift(id: string) {
    const { error } = await supabase
      .from('team_shifts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Delete all shifts for a team member in a date range
  async deleteShiftsInRange(teamMemberId: string, startDate: string, endDate: string) {
    const { error } = await supabase
      .from('team_shifts')
      .delete()
      .eq('team_member_id', teamMemberId)
      .gte('shift_date', startDate)
      .lte('shift_date', endDate);
    
    if (error) throw error;
  }
};
