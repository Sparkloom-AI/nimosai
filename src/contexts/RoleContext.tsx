
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rolesApi } from '@/api/roles';
import { AppRole, UserRole, RolePermissions, ROLE_PERMISSIONS, canUserPerformAction } from '@/types/roles';

interface RoleContextType {
  userRoles: UserRole[];
  currentStudioId: string | null;
  currentRole: AppRole | null;
  permissions: RolePermissions | null;
  loading: boolean;
  setCurrentStudioId: (studioId: string | null) => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  hasRole: (role: AppRole, studioId?: string) => boolean;
  canManageStudio: (studioId: string) => boolean;
  refreshRoles: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [currentStudioId, setCurrentStudioId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRoles = async () => {
    if (!user?.id) {
      setUserRoles([]);
      setCurrentRole(null);
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      const roles = await rolesApi.getUserRoles(user.id);
      setUserRoles(roles);
      
      // If no current studio is set, try to set it from user roles
      if (!currentStudioId && roles.length > 0) {
        const studioRole = roles.find(r => r.studio_id);
        if (studioRole) {
          setCurrentStudioId(studioRole.studio_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Update current role and permissions when studio changes
  useEffect(() => {
    if (!user?.id || !currentStudioId) {
      setCurrentRole(null);
      setPermissions(null);
      return;
    }

    const getUserRoleForStudio = async () => {
      try {
        const role = await rolesApi.getUserRoleForStudio(user.id, currentStudioId);
        setCurrentRole(role);
        setPermissions(role ? ROLE_PERMISSIONS[role] : null);
      } catch (error) {
        console.error('Failed to get user role for studio:', error);
        setCurrentRole(null);
        setPermissions(null);
      }
    };

    getUserRoleForStudio();
  }, [user?.id, currentStudioId]);

  // Load roles when user changes
  useEffect(() => {
    refreshRoles();
  }, [user?.id]);

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return canUserPerformAction(currentRole, permission);
  };

  const hasRole = (role: AppRole, studioId?: string): boolean => {
    const targetStudioId = studioId || currentStudioId;
    return userRoles.some(userRole => 
      userRole.role === role && 
      (role === 'super_admin' ? userRole.studio_id === null : userRole.studio_id === targetStudioId)
    );
  };

  const canManageStudio = (studioId: string): boolean => {
    return userRoles.some(userRole => 
      ['super_admin', 'studio_owner', 'manager'].includes(userRole.role) &&
      (userRole.role === 'super_admin' ? userRole.studio_id === null : userRole.studio_id === studioId)
    );
  };

  const value = {
    userRoles,
    currentStudioId,
    currentRole,
    permissions,
    loading,
    setCurrentStudioId,
    hasPermission,
    hasRole,
    canManageStudio,
    refreshRoles,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
