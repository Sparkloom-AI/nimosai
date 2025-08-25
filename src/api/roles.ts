
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AppRole, UserRole } from '@/types/roles';

type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];
type UserRoleUpdate = Database['public']['Tables']['user_roles']['Update'];

export const rolesApi = {
  // Get all roles for a user
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  },

  // Get user's role for a specific studio
  async getUserRoleForStudio(userId: string, studioId: string): Promise<AppRole | null> {
    const { data, error } = await supabase.rpc('get_user_role', {
      _user_id: userId,
      _studio_id: studioId,
    });
    
    if (error) throw error;
    return data;
  },

  // Check if user has a specific role
  async hasRole(userId: string, role: AppRole, studioId?: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: role,
      _studio_id: studioId || null,
    });
    
    if (error) throw error;
    return data;
  },

  // Check if user can manage a studio
  async canManageStudio(userId: string, studioId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('can_manage_studio', {
      _user_id: userId,
      _studio_id: studioId,
    });
    
    if (error) throw error;
    return data;
  },

  // Assign role to user
  async assignRole(roleData: UserRoleInsert): Promise<UserRole> {
    const { data, error } = await supabase
      .from('user_roles')
      .insert(roleData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user role
  async updateRole(id: string, updates: UserRoleUpdate): Promise<UserRole> {
    const { data, error } = await supabase
      .from('user_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Remove role from user
  async removeRole(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get all users with roles for a studio
  async getStudioUsers(studioId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        profiles!inner(email, full_name)
      `)
      .eq('studio_id', studioId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};
