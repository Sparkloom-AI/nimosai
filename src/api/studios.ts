import { supabase } from '@/integrations/supabase/client';
import { Studio } from '@/types/studio';

export const studiosApi = {
  // Get all studios accessible to the current user
  async getUserStudios(): Promise<Studio[]> {
    const { data, error } = await supabase.rpc('get_user_studios');
    
    if (error) throw error;
    return (data || []) as Studio[];
  },

  // Get a specific studio by ID
  async getStudioById(studioId: string): Promise<Studio | null> {
    const { data, error } = await supabase.rpc('get_studio_by_id', { 
      studio_id: studioId 
    });
    
    if (error) throw error;
    return data && Array.isArray(data) && data.length > 0 ? data[0] as Studio : null;
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
    
    // The RPC function should return a studio with all fields
    // Cast to Studio type as the function returns all required fields
    const studio = data && Array.isArray(data) && data.length > 0 ? data[0] : null;
    if (!studio) throw new Error('Failed to create studio');
    
    return studio as Studio;
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
      country?: string;
      currency?: string;
      tax_included?: boolean;
      default_team_language?: string;
      default_client_language?: string;
      facebook_url?: string;
      instagram_url?: string;
      twitter_url?: string;
      linkedin_url?: string;
    }
  ): Promise<Studio> {
    const { data, error } = await supabase.rpc('update_studio_data', {
      studio_id: studioId,
      studio_name: updates.name || null,
      studio_website: updates.website || null,
      studio_description: updates.description || null,
      studio_phone: updates.phone || null,
      studio_email: updates.email || null,
      studio_timezone: updates.timezone || null,
      studio_country: updates.country || null,
      studio_currency: updates.currency || null,
      studio_tax_included: updates.tax_included !== undefined ? updates.tax_included : null,
      studio_default_team_language: updates.default_team_language || null,
      studio_default_client_language: updates.default_client_language || null,
      studio_facebook_url: updates.facebook_url || null,
      studio_instagram_url: updates.instagram_url || null,
      studio_twitter_url: updates.twitter_url || null,
      studio_linkedin_url: updates.linkedin_url || null
    });

    if (error) throw error;
    return data && Array.isArray(data) && data.length > 0 ? data[0] as Studio : null;
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