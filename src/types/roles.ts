
export type AppRole = 'studio_owner' | 'manager' | 'staff' | 'receptionist' | 'super_admin';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  studio_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RolePermissions {
  canManageTeam: boolean;
  canManageServices: boolean;
  canManageLocations: boolean;
  canViewReports: boolean;
  canManageRoles: boolean;
  canAccessAllStudios: boolean;
}

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  super_admin: 1,
  studio_owner: 2,
  manager: 3,
  staff: 4,
  receptionist: 5,
};

export const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  super_admin: {
    canManageTeam: true,
    canManageServices: true,
    canManageLocations: true,
    canViewReports: true,
    canManageRoles: true,
    canAccessAllStudios: true,
  },
  studio_owner: {
    canManageTeam: true,
    canManageServices: true,
    canManageLocations: true,
    canViewReports: true,
    canManageRoles: true,
    canAccessAllStudios: false,
  },
  manager: {
    canManageTeam: true,
    canManageServices: true,
    canManageLocations: false,
    canViewReports: true,
    canManageRoles: false,
    canAccessAllStudios: false,
  },
  staff: {
    canManageTeam: false,
    canManageServices: false,
    canManageLocations: false,
    canViewReports: false,
    canManageRoles: false,
    canAccessAllStudios: false,
  },
  receptionist: {
    canManageTeam: false,
    canManageServices: false,
    canManageLocations: false,
    canViewReports: false,
    canManageRoles: false,
    canAccessAllStudios: false,
  },
};

export const getRoleDisplayName = (role: AppRole): string => {
  const names: Record<AppRole, string> = {
    super_admin: 'Super Admin',
    studio_owner: 'Studio Owner',
    manager: 'Manager',
    staff: 'Staff Member',
    receptionist: 'Receptionist',
  };
  return names[role];
};

export const canUserPerformAction = (
  userRole: AppRole | null,
  requiredPermission: keyof RolePermissions
): boolean => {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole][requiredPermission];
};
