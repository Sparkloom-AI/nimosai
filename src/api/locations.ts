
import { supabase } from '@/integrations/supabase/client';
import { Location } from '@/types/studio';

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
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create a new location
  async createLocation(locationData: {
    studio_id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    phone?: string;
    is_primary?: boolean;
  }): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        studio_id: locationData.studio_id,
        name: locationData.name,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        postal_code: locationData.postal_code,
        country: locationData.country || 'US',
        phone: locationData.phone,
        is_primary: locationData.is_primary || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing location
  async updateLocation(
    locationId: string,
    updates: Partial<{
      name: string;
      address: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      phone: string;
      is_primary: boolean;
      is_active: boolean;
    }>
  ): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a location (soft delete by setting is_active to false)
  async deleteLocation(locationId: string): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .update({ is_active: false })
      .eq('id', locationId);

    if (error) throw error;
  },

  // Set a location as primary (unsets other primary locations for the studio)
  async setPrimaryLocation(locationId: string, studioId: string): Promise<void> {
    // First, unset all other primary locations for this studio
    const { error: unsetError } = await supabase
      .from('locations')
      .update({ is_primary: false })
      .eq('studio_id', studioId)
      .neq('id', locationId);

    if (unsetError) throw unsetError;

    // Then set this location as primary
    const { error: setError } = await supabase
      .from('locations')
      .update({ is_primary: true })
      .eq('id', locationId);

    if (setError) throw setError;
  },
};
