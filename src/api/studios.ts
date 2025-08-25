
import { supabase } from '@/integrations/supabase/client';
import { Studio } from '@/types/studio';

interface CreateStudioData {
  name: string;
  website?: string;
  business_category: string;
  description?: string;
  phone?: string;
  email?: string;
  timezone?: string;
}

export const studiosApi = {
  // Create a new studio
  async createStudio(studioData: CreateStudioData): Promise<Studio> {
    const { data, error } = await supabase.rpc('create_studio_with_data', {
      studio_name: studioData.name,
      studio_website: studioData.website || null,
      studio_business_category: studioData.business_category,
      studio_description: studioData.description || null,
      studio_phone: studioData.phone || null,
      studio_email: studioData.email || null,
      studio_timezone: studioData.timezone || 'UTC',
    });

    if (error) throw error;
    return data[0] as Studio;
  },

  // Get user's studios
  async getUserStudios(): Promise<Studio[]> {
    const { data, error } = await supabase.rpc('get_user_studios');

    if (error) throw error;
    return (data || []) as Studio[];
  },

  // Get a specific studio
  async getStudio(studioId: string): Promise<Studio | null> {
    const { data, error } = await supabase.rpc('get_studio_by_id', { 
      studio_id: studioId 
    });

    if (error) throw error;
    return data && data.length > 0 ? (data[0] as Studio) : null;
  },

  // Update studio
  async updateStudio(studioId: string, updates: Partial<CreateStudioData>): Promise<Studio> {
    const { data, error } = await supabase.rpc('update_studio_data', {
      studio_id: studioId,
      studio_name: updates.name || null,
      studio_website: updates.website || null,
      studio_business_category: updates.business_category || null,
      studio_description: updates.description || null,
      studio_phone: updates.phone || null,
      studio_email: updates.email || null,
      studio_timezone: updates.timezone || null,
    });

    if (error) throw error;
    return data[0] as Studio;
  },
};
