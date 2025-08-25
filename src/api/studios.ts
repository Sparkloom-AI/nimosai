
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
    const { data, error } = await supabase
      .rpc('create_studio_with_data', {
        studio_name: studioData.name,
        studio_website: studioData.website,
        studio_business_category: studioData.business_category,
        studio_description: studioData.description,
        studio_phone: studioData.phone,
        studio_email: studioData.email,
        studio_timezone: studioData.timezone || 'UTC',
      });

    if (error) throw error;
    return data;
  },

  // Get user's studios
  async getUserStudios(): Promise<Studio[]> {
    const { data, error } = await supabase
      .rpc('get_user_studios');

    if (error) throw error;
    return data || [];
  },

  // Get a specific studio
  async getStudio(studioId: string): Promise<Studio | null> {
    const { data, error } = await supabase
      .rpc('get_studio_by_id', { studio_id: studioId });

    if (error) throw error;
    return data;
  },

  // Update studio
  async updateStudio(studioId: string, updates: Partial<CreateStudioData>): Promise<Studio> {
    const { data, error } = await supabase
      .rpc('update_studio_data', {
        studio_id: studioId,
        studio_name: updates.name,
        studio_website: updates.website,
        studio_business_category: updates.business_category,
        studio_description: updates.description,
        studio_phone: updates.phone,
        studio_email: updates.email,
        studio_timezone: updates.timezone,
      });

    if (error) throw error;
    return data;
  },
};
