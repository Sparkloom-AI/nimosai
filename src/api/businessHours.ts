import { supabase } from '@/integrations/supabase/client';

export interface BusinessHour {
  id: string;
  location_id: string;
  day_of_week: number;
  start_time?: string;
  end_time?: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessHourInput {
  location_id: string;
  day_of_week: number;
  start_time?: string;
  end_time?: string;
  is_closed: boolean;
}

export const businessHoursApi = {
  // Get business hours for a location
  async getLocationHours(locationId: string): Promise<BusinessHour[]> {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('location_id', locationId)
      .order('day_of_week');

    if (error) {
      console.error('Error fetching business hours:', error);
      throw error;
    }

    return data || [];
  },

  // Update or create business hours for a location
  async updateLocationHours(locationId: string, hours: BusinessHourInput[]): Promise<void> {
    // Delete existing hours for this location
    const { error: deleteError } = await supabase
      .from('business_hours')
      .delete()
      .eq('location_id', locationId);

    if (deleteError) {
      console.error('Error deleting existing hours:', deleteError);
      throw deleteError;
    }

    // Insert new hours
    if (hours.length > 0) {
      const { error: insertError } = await supabase
        .from('business_hours')
        .insert(hours);

      if (insertError) {
        console.error('Error inserting business hours:', insertError);
        throw insertError;
      }
    }
  },

  // Get all business hours for all locations of a studio
  async getStudioHours(studioId: string): Promise<Record<string, BusinessHour[]>> {
    const { data, error } = await supabase
      .from('business_hours')
      .select(`
        *,
        locations!inner(studio_id)
      `)
      .eq('locations.studio_id', studioId);

    if (error) {
      console.error('Error fetching studio business hours:', error);
      throw error;
    }

    // Group hours by location_id
    const groupedHours: Record<string, BusinessHour[]> = {};
    data?.forEach(hour => {
      if (!groupedHours[hour.location_id]) {
        groupedHours[hour.location_id] = [];
      }
      groupedHours[hour.location_id].push(hour);
    });

    return groupedHours;
  },

  // Get default hours template (Monday-Friday 9-5, weekends closed)
  getDefaultHours(locationId: string): BusinessHourInput[] {
    return [
      { location_id: locationId, day_of_week: 0, is_closed: true }, // Sunday
      { location_id: locationId, day_of_week: 1, start_time: '09:00', end_time: '17:00', is_closed: false }, // Monday
      { location_id: locationId, day_of_week: 2, start_time: '09:00', end_time: '17:00', is_closed: false }, // Tuesday
      { location_id: locationId, day_of_week: 3, start_time: '09:00', end_time: '17:00', is_closed: false }, // Wednesday
      { location_id: locationId, day_of_week: 4, start_time: '09:00', end_time: '17:00', is_closed: false }, // Thursday
      { location_id: locationId, day_of_week: 5, start_time: '09:00', end_time: '17:00', is_closed: false }, // Friday
      { location_id: locationId, day_of_week: 6, is_closed: true }, // Saturday
    ];
  }
};