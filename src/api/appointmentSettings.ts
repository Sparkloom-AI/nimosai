import { supabase } from '@/integrations/supabase/client';

export interface AppointmentBookingRules {
  id: string;
  studio_id: string;
  immediate_booking_allowed: boolean;
  immediate_booking_buffer_minutes: number;
  future_booking_limit_months: number;
  allow_team_member_selection: boolean;
  allow_group_appointments: boolean;
  max_group_size: number;
  cancellation_allowed: boolean;
  cancellation_buffer_hours: number;
  rescheduling_allowed: boolean;
  rescheduling_buffer_hours: number;
  online_booking_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const appointmentSettingsApi = {
  // Get appointment booking rules for a studio
  async getBookingRules(studioId: string): Promise<AppointmentBookingRules | null> {
    const { data, error } = await supabase
      .from('appointment_booking_rules')
      .select('*')
      .eq('studio_id', studioId)
      .single();

    if (error) {
      console.error('Error fetching booking rules:', error);
      throw error;
    }

    return data;
  },

  // Update appointment booking rules
  async updateBookingRules(
    studioId: string, 
    rules: Partial<Omit<AppointmentBookingRules, 'id' | 'studio_id' | 'created_at' | 'updated_at'>>
  ): Promise<AppointmentBookingRules> {
    const { data, error } = await supabase
      .from('appointment_booking_rules')
      .update(rules)
      .eq('studio_id', studioId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking rules:', error);
      throw error;
    }

    return data;
  },

  // Create initial booking rules for a studio
  async createBookingRules(
    studioId: string,
    rules?: Partial<Omit<AppointmentBookingRules, 'id' | 'studio_id' | 'created_at' | 'updated_at'>>
  ): Promise<AppointmentBookingRules> {
    const defaultRules = {
      immediate_booking_allowed: true,
      immediate_booking_buffer_minutes: 15,
      future_booking_limit_months: 12,
      allow_team_member_selection: true,
      allow_group_appointments: false,
      max_group_size: 1,
      cancellation_allowed: true,
      cancellation_buffer_hours: 24,
      rescheduling_allowed: true,
      rescheduling_buffer_hours: 24,
      online_booking_enabled: true,
      ...rules,
    };

    const { data, error } = await supabase
      .from('appointment_booking_rules')
      .insert({
        studio_id: studioId,
        ...defaultRules,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking rules:', error);
      throw error;
    }

    return data;
  },
};