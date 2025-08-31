// Service and booking types
export interface Service {
  id: string;
  studio_id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category: string[]; // Changed to array for multiple categories
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  studio_id: string;
  client_id?: string;
  team_member_id: string;
  service_id: string;
  location_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';