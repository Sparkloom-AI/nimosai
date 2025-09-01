import { supabase } from '@/integrations/supabase/client';
import { Studio } from '@/types/studio';

export const studiosApi = {
  // Get all studios accessible to the current user
  async getUserStudios(): Promise<Studio[]> {
    console.log('getUserStudios: Fetching user studios');
    const { data, error } = await supabase.rpc('get_user_studios');
    
    if (error) {
      console.error('getUserStudios: Error:', error);
      throw error;
    }
    
    console.log('getUserStudios: Raw data:', data);
    const studios = (data || []).map((studioRecord: any) => ({
      id: studioRecord.id,
      name: studioRecord.name,
      description: studioRecord.description || '',
      phone: studioRecord.phone || '',
      email: studioRecord.email || '',
      website: studioRecord.website || '',
      timezone: studioRecord.timezone || 'UTC',
      country: studioRecord.country || 'US',
      currency: studioRecord.currency || 'USD',
      tax_included: studioRecord.tax_included ?? true,
      default_team_language: studioRecord.default_team_language || 'en',
      default_client_language: studioRecord.default_client_language || 'en',
      facebook_url: studioRecord.facebook_url || '',
      instagram_url: studioRecord.instagram_url || '',
      twitter_url: studioRecord.twitter_url || '',
      linkedin_url: studioRecord.linkedin_url || '',
      created_at: studioRecord.created_at,
      updated_at: studioRecord.updated_at,
    })) as Studio[];
    
    console.log('getUserStudios: Processed studios:', studios);
    return studios;
  },

  // Get a specific studio by ID
  async getStudioById(studioId: string): Promise<Studio | null> {
    console.log('getStudioById: Fetching studio with ID:', studioId);
    const { data, error } = await supabase.rpc('get_studio_by_id', { 
      studio_id: studioId 
    });
    
    if (error) {
      console.error('getStudioById: Error:', error);
      throw error;
    }
    
    console.log('getStudioById: Raw data:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('getStudioById: No studio found');
      return null;
    }
    
    const studioRecord = data[0];
    const studio: Studio = {
      id: studioRecord.id,
      name: studioRecord.name,
      description: studioRecord.description || '',
      phone: studioRecord.phone || '',
      email: studioRecord.email || '',
      website: studioRecord.website || '',
      timezone: studioRecord.timezone || 'UTC',
      country: studioRecord.country || 'US',
      currency: studioRecord.currency || 'USD',
      tax_included: studioRecord.tax_included ?? true,
      default_team_language: studioRecord.default_team_language || 'en',
      default_client_language: studioRecord.default_client_language || 'en',
      facebook_url: studioRecord.facebook_url || '',
      instagram_url: studioRecord.instagram_url || '',
      twitter_url: studioRecord.twitter_url || '',
      linkedin_url: studioRecord.linkedin_url || '',
      created_at: studioRecord.created_at,
      updated_at: studioRecord.updated_at,
    };
    
    console.log('getStudioById: Processed studio:', studio);
    return studio;
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
    console.log('createStudio: Creating studio with data:', studioData);
    
    // Call the simplified RPC that returns only studio_id
    const { data: studioId, error } = await supabase.rpc('create_studio_with_data', {
      p_studio_name: studioData.name,
      p_studio_website: studioData.website || null,
      p_studio_business_category_id: studioData.business_category_id || null,
      p_studio_description: studioData.description || null,
      p_studio_phone: studioData.phone || null,
      p_studio_email: studioData.email || null,
      p_studio_timezone: studioData.timezone || 'UTC',
      p_additional_category_ids: studioData.additional_category_ids || null
    });

    if (error) {
      console.error('createStudio: Error:', error);
      throw error;
    }
    
    if (!studioId) {
      throw new Error('Failed to create studio');
    }
    
    console.log('createStudio: Studio created with ID:', studioId);
    
    // Fetch the full studio data using the returned ID
    const studio = await this.getStudioById(studioId);
    if (!studio) {
      throw new Error('Failed to retrieve created studio');
    }
    
    console.log('createStudio: Retrieved studio:', studio);
    return studio;
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

  // Update studio business categories
  async updateStudioCategories(
    studioId: string, 
    primaryCategoryId: string, 
    additionalCategoryIds: string[] = []
  ): Promise<void> {
    console.log('updateStudioCategories: Updating categories for studio:', studioId);
    console.log('updateStudioCategories: Primary category:', primaryCategoryId);
    console.log('updateStudioCategories: Additional categories:', additionalCategoryIds);

    // First, clear existing categories
    const { error: deleteError } = await supabase
      .from('studio_business_categories')
      .delete()
      .eq('studio_id', studioId);

    if (deleteError) {
      console.error('updateStudioCategories: Error deleting existing categories:', deleteError);
      throw deleteError;
    }

    // Insert primary category
    const primaryPayload = {
      studio_id: studioId,
      business_category_id: primaryCategoryId,
      is_primary: true
    };
    console.log('updateStudioCategories: Inserting primary category payload:', primaryPayload);

    const { error: primaryError } = await supabase
      .from('studio_business_categories')
      .insert(primaryPayload);

    if (primaryError) {
      console.error('updateStudioCategories: Error inserting primary category:', primaryError);
      throw primaryError;
    }

    // Insert additional categories
    if (additionalCategoryIds.length > 0) {
      const additionalPayloads = additionalCategoryIds.map(categoryId => ({
        studio_id: studioId,
        business_category_id: categoryId,
        is_primary: false
      }));
      console.log('updateStudioCategories: Inserting additional categories payload:', additionalPayloads);

      const { error: additionalError } = await supabase
        .from('studio_business_categories')
        .insert(additionalPayloads);

      if (additionalError) {
        console.error('updateStudioCategories: Error inserting additional categories:', additionalError);
        throw additionalError;
      }
    }

    console.log('updateStudioCategories: Successfully updated studio categories');
  },
};