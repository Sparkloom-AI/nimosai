// Team and staff management types
export interface TeamMember {
  id: string;
  studio_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  job_title?: string;
  calendar_color: string;
  start_date: string;
  end_date?: string;
  employment_type: EmploymentType;
  team_member_id?: string;
  notes?: string;
  is_bookable: boolean;
  permission_level: PermissionLevel;
  hourly_rate?: number;
  commission_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamShift {
  id: string;
  team_member_id: string;
  location_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_status: ShiftStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  team_member_id: string;
  contact_name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
}

export interface TeamMemberAddress {
  id: string;
  team_member_id: string;
  address_type: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
}

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'freelance';
export type PermissionLevel = 'low' | 'medium' | 'high' | 'admin';
export type ShiftStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';