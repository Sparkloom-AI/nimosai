
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/types/studio';

interface CreateLocationData {
  studio_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  phone?: string;
  is_primary?: boolean;
}

interface UpdateLocationData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  is_primary?: boolean;
}

export const locationsApi = {
  // Get all locations for a studio
  async getStudioLocations(studioId: string): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get a specific location
  async getLocation(locationId: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  },

  // Create a new location
  async createLocation(locationData: CreateLocationData): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        ...locationData,
        country: locationData.country || 'US',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a location
  async updateLocation(locationId: string, updates: UpdateLocationData): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a location (soft delete)
  async deleteLocation(locationId: string): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .update({ is_active: false })
      .eq('id', locationId);

    if (error) throw error;
  },

  // Set primary location for a studio
  async setPrimaryLocation(studioId: string, locationId: string): Promise<void> {
    // First, unset all primary locations for this studio
    await supabase
      .from('locations')
      .update({ is_primary: false })
      .eq('studio_id', studioId);

    // Then set the selected location as primary
    const { error } = await supabase
      .from('locations')
      .update({ is_primary: true })
      .eq('id', locationId);

    if (error) throw error;
  },
};
