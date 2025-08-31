-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  notes TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  notes TEXT,
  internal_notes TEXT,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  booking_source TEXT DEFAULT 'staff' CHECK (booking_source IN ('staff', 'online', 'phone', 'walk_in', 'ai_assistant')),
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  client_arrived_at TIMESTAMP WITH TIME ZONE,
  service_started_at TIMESTAMP WITH TIME ZONE,
  service_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointment history table for tracking changes
CREATE TABLE public.appointment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'cancelled', 'rescheduled', 'status_changed')),
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recurring appointments table
CREATE TABLE public.recurring_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('daily', 'weekly', 'monthly', 'custom')),
  pattern_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  preferred_team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  preferred_date_start DATE,
  preferred_date_end DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  priority_score INTEGER DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked time table
CREATE TABLE public.blocked_time (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  block_type TEXT NOT NULL DEFAULT 'break' CHECK (block_type IN ('break', 'lunch', 'meeting', 'training', 'holiday', 'sick', 'personal', 'maintenance')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern JSONB,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability rules table
CREATE TABLE public.availability_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('working_hours', 'service_specific', 'location_specific', 'break_time')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service buffer times table
CREATE TABLE public.service_buffers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  setup_time INTEGER NOT NULL DEFAULT 0, -- minutes
  cleanup_time INTEGER NOT NULL DEFAULT 0, -- minutes
  travel_time INTEGER NOT NULL DEFAULT 0, -- minutes between locations
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id)
);

-- Create client preferences table
CREATE TABLE public.client_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  preferred_team_members UUID[] DEFAULT ARRAY[]::UUID[],
  preferred_locations UUID[] DEFAULT ARRAY[]::UUID[],
  preferred_times JSONB DEFAULT '{}'::jsonb,
  communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "phone": false}'::jsonb,
  booking_preferences JSONB DEFAULT '{}'::jsonb,
  accessibility_needs TEXT,
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_buffers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Role-based clients access" ON public.clients
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id) OR
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR
  has_role(auth.uid(), 'freelancer'::app_role, studio_id)
);

-- Create RLS policies for appointments
CREATE POLICY "Role-based appointments access" ON public.appointments
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id) OR
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR
  has_role(auth.uid(), 'freelancer'::app_role, studio_id)
);

-- Create RLS policies for appointment history
CREATE POLICY "Role-based appointment history access" ON public.appointment_history
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_history.appointment_id 
    AND (can_manage_studio(auth.uid(), a.studio_id) OR
         has_role(auth.uid(), 'staff'::app_role, a.studio_id) OR
         has_role(auth.uid(), 'freelancer'::app_role, a.studio_id))
  )
);

-- Create RLS policies for recurring appointments
CREATE POLICY "Role-based recurring appointments access" ON public.recurring_appointments
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id) OR
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR
  has_role(auth.uid(), 'freelancer'::app_role, studio_id)
);

-- Create RLS policies for waitlist
CREATE POLICY "Role-based waitlist access" ON public.waitlist
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id) OR
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR
  has_role(auth.uid(), 'freelancer'::app_role, studio_id)
);

-- Create RLS policies for blocked time
CREATE POLICY "Role-based blocked time access" ON public.blocked_time
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id) OR
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR
  has_role(auth.uid(), 'freelancer'::app_role, studio_id)
);

-- Create RLS policies for availability rules
CREATE POLICY "Role-based availability rules access" ON public.availability_rules
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id) OR
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR
  has_role(auth.uid(), 'freelancer'::app_role, studio_id)
);

-- Create RLS policies for service buffers
CREATE POLICY "Role-based service buffers access" ON public.service_buffers
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  EXISTS (
    SELECT 1 FROM public.services s 
    WHERE s.id = service_buffers.service_id 
    AND (can_manage_studio(auth.uid(), s.studio_id) OR
         has_role(auth.uid(), 'staff'::app_role, s.studio_id) OR
         has_role(auth.uid(), 'freelancer'::app_role, s.studio_id))
  )
);

-- Create RLS policies for client preferences
CREATE POLICY "Role-based client preferences access" ON public.client_preferences
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = client_preferences.client_id 
    AND (can_manage_studio(auth.uid(), c.studio_id) OR
         has_role(auth.uid(), 'staff'::app_role, c.studio_id) OR
         has_role(auth.uid(), 'freelancer'::app_role, c.studio_id))
  )
);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_appointments_updated_at
  BEFORE UPDATE ON public.recurring_appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blocked_time_updated_at
  BEFORE UPDATE ON public.blocked_time
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_rules_updated_at
  BEFORE UPDATE ON public.availability_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_buffers_updated_at
  BEFORE UPDATE ON public.service_buffers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_preferences_updated_at
  BEFORE UPDATE ON public.client_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_appointments_studio_date ON public.appointments(studio_id, appointment_date);
CREATE INDEX idx_appointments_team_member_date ON public.appointments(team_member_id, appointment_date);
CREATE INDEX idx_appointments_client ON public.appointments(client_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_availability_rules_team_member ON public.availability_rules(team_member_id, day_of_week);
CREATE INDEX idx_blocked_time_team_member_date ON public.blocked_time(team_member_id, start_date, end_date);
CREATE INDEX idx_waitlist_active ON public.waitlist(studio_id, is_active) WHERE is_active = true;
CREATE INDEX idx_clients_studio ON public.clients(studio_id);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_phone ON public.clients(phone);