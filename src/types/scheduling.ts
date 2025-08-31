// Comprehensive scheduling system types

export interface Client {
  id: string;
  studio_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  notes?: string;
  preferences: any; // JSON type from Supabase
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
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
  internal_notes?: string;
  total_price: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  booking_source: BookingSource;
  confirmation_sent_at?: string;
  reminder_sent_at?: string;
  client_arrived_at?: string;
  service_started_at?: string;
  service_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentHistory {
  id: string;
  appointment_id: string;
  changed_by: string;
  change_type: ChangeType;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  notes?: string;
  created_at: string;
}

export interface RecurringAppointment {
  id: string;
  studio_id: string;
  client_id: string;
  team_member_id: string;
  service_id: string;
  location_id: string;
  pattern_type: PatternType;
  pattern_config: Record<string, any>;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntry {
  id: string;
  studio_id: string;
  client_id: string;
  service_id: string;
  location_id?: string;
  preferred_team_member_id?: string;
  preferred_date_start?: string;
  preferred_date_end?: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  priority_score: number;
  notes?: string;
  is_active: boolean;
  notification_preferences: any; // JSON type from Supabase
  created_at: string;
  updated_at: string;
}

export interface BlockedTime {
  id: string;
  studio_id: string;
  team_member_id?: string;
  location_id?: string;
  title: string;
  description?: string;
  block_type: BlockType;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  is_recurring: boolean;
  recurring_pattern?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityRule {
  id: string;
  studio_id: string;
  team_member_id?: string;
  location_id?: string;
  service_id?: string;
  rule_type: RuleType;
  day_of_week?: number; // 0 = Sunday
  start_time: string;
  end_time: string;
  is_available: boolean;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceBuffer {
  id: string;
  service_id: string;
  setup_time: number; // minutes
  cleanup_time: number; // minutes
  travel_time: number; // minutes between locations
  created_at: string;
  updated_at: string;
}

export interface ClientPreferences {
  id: string;
  client_id: string;
  preferred_team_members: string[];
  preferred_locations: string[];
  preferred_times: any; // JSON type from Supabase
  communication_preferences: any; // JSON type from Supabase  
  booking_preferences: any; // JSON type from Supabase
  accessibility_needs?: string;
  allergies?: string;
  created_at: string;
  updated_at: string;
}

// Enums and Union Types
export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show' 
  | 'rescheduled';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export type BookingSource = 'staff' | 'online' | 'phone' | 'walk_in' | 'ai_assistant';

export type ChangeType = 'created' | 'updated' | 'cancelled' | 'rescheduled' | 'status_changed';

export type PatternType = 'daily' | 'weekly' | 'monthly' | 'custom';

export type BlockType = 
  | 'break' 
  | 'lunch' 
  | 'meeting' 
  | 'training' 
  | 'holiday' 
  | 'sick' 
  | 'personal' 
  | 'maintenance';

export type RuleType = 
  | 'working_hours' 
  | 'service_specific' 
  | 'location_specific' 
  | 'break_time';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  phone?: boolean;
}

// Calendar-related types
export interface CalendarEvent extends Appointment {
  title: string;
  resource?: any;
  color?: string;
  description?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  team_member_id?: string;
  location_id?: string;
  service_id?: string;
}

export interface AvailabilityQuery {
  studio_id: string;
  service_id?: string;
  team_member_id?: string;
  location_id?: string;
  start_date: string;
  end_date: string;
  duration?: number; // minutes
}

// Booking flow types
export interface BookingRequest {
  client_id?: string;
  team_member_id: string;
  service_id: string;
  location_id: string;
  appointment_date: string;
  start_time: string;
  notes?: string;
  booking_source?: BookingSource;
  payment_amount?: number;
}

export interface ReschedulingRequest {
  appointment_id: string;
  new_date: string;
  new_start_time: string;
  new_team_member_id?: string;
  new_location_id?: string;
  reason?: string;
}

// AI-related types
export interface SmartSchedulingOptions {
  optimize_for: 'revenue' | 'efficiency' | 'client_preference';
  consider_travel_time: boolean;
  consider_team_preferences: boolean;
  consider_historical_patterns: boolean;
}

export interface SchedulingRecommendation {
  appointment_id?: string;
  recommended_slot: TimeSlot;
  confidence_score: number;
  reasoning: string;
  alternative_slots?: TimeSlot[];
}

// Dashboard and analytics types
export interface SchedulingMetrics {
  total_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  no_show_rate: number;
  average_booking_lead_time: number;
  peak_hours: { hour: number; count: number }[];
  team_utilization: { team_member_id: string; utilization_rate: number }[];
  revenue_by_service: { service_id: string; revenue: number }[];
}

export interface AppointmentWithRelations extends Appointment {
  client?: Client;
  team_member?: {
    id: string;
    first_name: string;
    last_name: string;
    calendar_color?: string;
  };
  service?: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  location?: {
    id: string;
    name: string;
    address: string;
  };
}