import { supabase } from '@/integrations/supabase/client';
import { Studio } from '@/types/studio';

export const studiosApi = {
  // Get all studios accessible to the current user
  async getUserStudios(): Promise<Studio[]> {
    const { data, error } = await supabase.rpc('get_user_studios');
    
    if (error) throw error;
    return data || [];
  },

  // Get a specific studio by ID
  async getStudioById(studioId: string): Promise<Studio | null> {
    const { data, error } = await supabase.rpc('get_studio_by_id', { 
      studio_id: studioId 
    });
    
    if (error) throw error;
    return data && Array.isArray(data) && data.length > 0 ? data[0] : null;
  },

  // Create a new studio
  async createStudio(studioData: {
    name: string;
    website?: string;
    business_category_id?: string;
    description?: string;
    phone?: string;
    email?: string;
    timezone?: string;
    additional_category_ids?: string[];
  }): Promise<Studio> {
    const { data, error } = await supabase.rpc('create_studio_with_data', {
      p_studio_name: studioData.name,
      p_studio_website: studioData.website || null,
      p_studio_business_category_id: studioData.business_category_id || null,
      p_studio_description: studioData.description || null,
      p_studio_phone: studioData.phone || null,
      p_studio_email: studioData.email || null,
      p_studio_timezone: studioData.timezone || 'UTC',
      p_additional_category_ids: studioData.additional_category_ids || null
    });

    if (error) throw error;
    return data && Array.isArray(data) && data.length > 0 ? data[0] : null;
  },

  // Update an existing studio
  async updateStudio(
    studioId: string,
      updates: {
      name?: string;
      website?: string;
      description?: string;
      phone?: string;
      email?: string;
      timezone?: string;
    }
  ): Promise<Studio> {
    const { data, error } = await supabase.rpc('update_studio_data', {
      studio_id: studioId,
      studio_name: updates.name || null,
      studio_website: updates.website || null,
      studio_description: updates.description || null,
      studio_phone: updates.phone || null,
      studio_email: updates.email || null,
      studio_timezone: updates.timezone || null
    });

    if (error) throw error;
    return data && Array.isArray(data) && data.length > 0 ? data[0] : null;
  },

  // Delete a studio (super admin or owner only)
  async deleteStudio(studioId: string): Promise<void> {
    const { error } = await supabase
      .from('studios')
      .delete()
      .eq('id', studioId);

    if (error) throw error;
  },

  // Get all categories for a studio
  async getStudioCategories(studioId: string) {
    const { data, error } = await supabase.rpc('get_studio_categories', {
      studio_id: studioId
    });

    if (error) throw error;
    return data || [];
  },
};