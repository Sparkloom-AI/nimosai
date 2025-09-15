import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rolesApi } from '@/api/roles';
import { studiosApi } from '@/api/studios';
import { AppRole, UserRole, RolePermissions, ROLE_PERMISSIONS, canUserPerformAction } from '@/types/roles';
import { Studio } from '@/types/studio';

interface RoleContextType {
  userRoles: UserRole[];
  currentStudioId: string | null;
  currentStudio: Studio | null;
  currentRole: AppRole | null;
  permissions: RolePermissions | null;
  loading: boolean;
  setCurrentStudioId: (studioId: string | null) => void;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  hasRole: (role: AppRole, studioId?: string) => boolean;
  canManageStudio: (studioId: string) => boolean;
  refreshRoles: () => Promise<void>;
  refreshStudio: () => Promise<void>;
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
  const [currentStudio, setCurrentStudio] = useState<Studio | null>(null);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  // Separate function to refresh just the studio data
  const refreshStudio = async () => {
    if (!user?.id || !currentStudioId) {
      return;
    }

    try {
      console.log('RoleContext: refreshStudio called for ID:', currentStudioId);
      const studio = await studiosApi.getStudioById(currentStudioId);
      console.log('RoleContext: Studio data refreshed:', studio);
      setCurrentStudio(studio);
    } catch (error) {
      console.error('Failed to refresh studio data:', error);
    }
  };

  const refreshRoles = async () => {
    if (!user?.id) {
      setUserRoles([]);
      setCurrentRole(null);
      setCurrentStudio(null);
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      console.log('RoleContext: refreshRoles called');
      const roles = await rolesApi.getUserRoles(user.id);
      setUserRoles(roles);
      console.log('RoleContext: User roles loaded:', roles);
      
      // If no current studio is set, try to set it from user roles
      if (!currentStudioId && roles.length > 0) {
        const studioRole = roles.find(r => r.studio_id);
        if (studioRole) {
          console.log('RoleContext: Setting currentStudioId from roles:', studioRole.studio_id);
          setCurrentStudioId(studioRole.studio_id);
        }
      }

      // If we have a current studio ID, refresh the studio data
      if (currentStudioId) {
        try {
          console.log('RoleContext: Refreshing studio data for ID:', currentStudioId);
          // Get current role for this studio
          const role = await rolesApi.getUserRoleForStudio(user.id, currentStudioId);
          setCurrentRole(role);
          setPermissions(role ? ROLE_PERMISSIONS[role] : null);

          // Get current studio details
          const studio = await studiosApi.getStudioById(currentStudioId);
          console.log('RoleContext: Studio data loaded:', studio);
          setCurrentStudio(studio);
        } catch (error) {
          console.error('Failed to refresh current studio data:', error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Update current role, studio, and permissions when studio changes
  useEffect(() => {
    const updateCurrentRoleAndStudio = async () => {
      if (!user?.id || !currentStudioId) {
        setCurrentRole(null);
        setCurrentStudio(null);
        setPermissions(null);
        return;
      }

      try {
        console.log('RoleContext: updateCurrentRoleAndStudio called for studio:', currentStudioId);
        // Get current role for this studio
        const role = await rolesApi.getUserRoleForStudio(user.id, currentStudioId);
        setCurrentRole(role);
        setPermissions(role ? ROLE_PERMISSIONS[role] : null);

        // Get current studio details
        const studio = await studiosApi.getStudioById(currentStudioId);
        console.log('RoleContext: Studio data loaded in useEffect:', studio);
        setCurrentStudio(studio);
      } catch (error) {
        console.error('Failed to get user role/studio for studio:', error);
        setCurrentRole(null);
        setCurrentStudio(null);
        setPermissions(null);
      }
    };

    updateCurrentRoleAndStudio();
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
      (userRole.role === 'super_admin' ? userRole.studio_id === null : userRole.studio_id === targetStudioId)
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
    currentStudio,
    currentRole,
    permissions,
    loading,
    setCurrentStudioId,
    hasPermission,
    hasRole,
    canManageStudio,
    refreshRoles,
    refreshStudio,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};