import { supabase } from '@/integrations/supabase/client';
import { Package } from '@/types/packages';

export const packagesApi = {
  // Get all packages for a studio
  async getPackages(studioId: string): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data || []).map(pkg => ({
      ...pkg,
      services: Array.isArray(pkg.services) ? pkg.services : []
    })) as Package[];
  },

  // Get a specific package
  async getPackage(packageId: string): Promise<Package | null> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching package:', error);
      throw error;
    }
    return data ? {
      ...data,
      services: Array.isArray(data.services) ? data.services : []
    } as Package : null;
  },

  // Create a new package
  async createPackage(packageData: Omit<Package, 'id' | 'created_at' | 'updated_at'>): Promise<Package> {
    const { data, error } = await supabase
      .from('packages')
      .insert(packageData)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      services: Array.isArray(data.services) ? data.services : []
    } as Package;
  },

  // Update a package
  async updatePackage(
    packageId: string, 
    updates: Partial<Omit<Package, 'id' | 'studio_id' | 'created_at' | 'updated_at'>>
  ): Promise<Package> {
    const { data, error } = await supabase
      .from('packages')
      .update(updates)
      .eq('id', packageId)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      services: Array.isArray(data.services) ? data.services : []
    } as Package;
  },

  // Soft delete a package (mark as inactive)
  async deletePackage(packageId: string): Promise<void> {
    const { error } = await supabase
      .from('packages')
      .update({ is_active: false })
      .eq('id', packageId);

    if (error) throw error;
  },

  // Get packages by category for a studio
  async getPackagesByCategory(studioId: string, category: string): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('studio_id', studioId)
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data || []).map(pkg => ({
      ...pkg,
      services: Array.isArray(pkg.services) ? pkg.services : []
    })) as Package[];
  },

  // Get unique categories for a studio's packages
  async getStudioPackageCategories(studioId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('category')
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) throw error;
    
    const allCategories = new Set<string>();
    data?.forEach(item => {
      if (item.category && typeof item.category === 'string') {
        allCategories.add(item.category);
      }
    });
    
    return Array.from(allCategories).sort();
  }
};