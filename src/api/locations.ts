
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
    return (data || []) as unknown as Location[];
  },

  // Get a specific location
  async getLocation(locationId: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Location | null;
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
    place_id?: string;
    latitude?: number;
    longitude?: number;
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
        place_id: locationData.place_id,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Location;
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
      place_id: string;
      latitude: number;
      longitude: number;
    }>
  ): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update(updates as any)
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Location;
  },

  // Delete a location (soft delete by setting is_active to false)
  async deleteLocation(locationId: string): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .update({ is_active: false } as any)
      .eq('id', locationId);

    if (error) throw error;
  },

  // Set a location as primary (unsets other primary locations for the studio)
  async setPrimaryLocation(locationId: string, studioId: string): Promise<void> {
    // First, unset all other primary locations for this studio
    const { error: unsetError } = await supabase
      .from('locations')
      .update({ is_primary: false } as any)
      .eq('studio_id', studioId)
      .neq('id', locationId);

    if (unsetError) throw unsetError;

    // Then set this location as primary
    const { error: setError } = await supabase
      .from('locations')
      .update({ is_primary: true } as any)
      .eq('id', locationId);

    if (setError) throw setError;
  },
};
