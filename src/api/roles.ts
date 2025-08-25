
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AppRole, UserRole } from '@/types/roles';

type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];
type UserRoleUpdate = Database['public']['Tables']['user_roles']['Update'];
type DatabaseRole = Database['public']['Enums']['app_role'];

// Helper function to convert database role to AppRole
const convertToAppRole = (dbRole: DatabaseRole): AppRole => {
  if (dbRole === 'receptionist') {
    return 'freelancer';
  }
  return dbRole as AppRole;
};

// Helper function to convert AppRole to database role
const convertToDbRole = (appRole: AppRole): DatabaseRole => {
  if (appRole === 'freelancer') {
    return 'receptionist';
  }
  return appRole as DatabaseRole;
};

// Helper function to convert database user role to UserRole
const convertDbUserRole = (dbUserRole: any): UserRole => {
  return {
    ...dbUserRole,
    role: convertToAppRole(dbUserRole.role)
  };
};

export const rolesApi = {
  // Get all roles for a user
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return (data || []).map(convertDbUserRole);
  },

  // Get user's role for a specific studio
  async getUserRoleForStudio(userId: string, studioId: string): Promise<AppRole | null> {
    const { data, error } = await supabase.rpc('get_user_role', {
      _user_id: userId,
      _studio_id: studioId,
    });
    
    if (error) throw error;
    return data ? convertToAppRole(data) : null;
  },

  // Check if user has a specific role
  async hasRole(userId: string, role: AppRole, studioId?: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: convertToDbRole(role),
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
  async assignRole(roleData: Omit<UserRoleInsert, 'role'> & { role: AppRole }): Promise<UserRole> {
    const dbRoleData = {
      ...roleData,
      role: convertToDbRole(roleData.role)
    };
    
    const { data, error } = await supabase
      .from('user_roles')
      .insert(dbRoleData)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbUserRole(data);
  },

  // Update user role
  async updateRole(id: string, updates: Omit<UserRoleUpdate, 'role'> & { role?: AppRole }): Promise<UserRole> {
    const dbUpdates = updates.role ? {
      ...updates,
      role: convertToDbRole(updates.role)
    } : updates;
    
    const { data, error } = await supabase
      .from('user_roles')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return convertDbUserRole(data);
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
    return (data || []).map(convertDbUserRole);
  },
};
