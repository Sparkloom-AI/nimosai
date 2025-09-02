-- Create appointment booking rules table
CREATE TABLE public.appointment_booking_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID NOT NULL,
  
  -- Immediate booking restrictions
  immediate_booking_allowed BOOLEAN NOT NULL DEFAULT true,
  immediate_booking_buffer_minutes INTEGER NOT NULL DEFAULT 0, -- 0, 15, 30, 60, 120, etc.
  
  -- Future booking limits
  future_booking_limit_months INTEGER NOT NULL DEFAULT 12, -- 1-12 months
  
  -- Team member selection
  allow_team_member_selection BOOLEAN NOT NULL DEFAULT true,
  
  -- Group appointments
  allow_group_appointments BOOLEAN NOT NULL DEFAULT false,
  max_group_size INTEGER NOT NULL DEFAULT 1,
  
  -- Cancellation policy
  cancellation_allowed BOOLEAN NOT NULL DEFAULT true,
  cancellation_buffer_hours INTEGER NOT NULL DEFAULT 24, -- 0, 1, 2, 6, 12, 24, 48, 168 (1 week)
  
  -- Rescheduling policy  
  rescheduling_allowed BOOLEAN NOT NULL DEFAULT true,
  rescheduling_buffer_hours INTEGER NOT NULL DEFAULT 24,
  
  -- Online booking
  online_booking_enabled BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_booking_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Role-based appointment booking rules access" 
ON public.appointment_booking_rules 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id)
);

-- Create updated_at trigger
CREATE TRIGGER update_appointment_booking_rules_updated_at
  BEFORE UPDATE ON public.appointment_booking_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rules for existing studios
INSERT INTO public.appointment_booking_rules (studio_id, immediate_booking_allowed, immediate_booking_buffer_minutes, future_booking_limit_months, allow_team_member_selection, allow_group_appointments, cancellation_allowed, cancellation_buffer_hours, rescheduling_allowed, rescheduling_buffer_hours, online_booking_enabled)
SELECT 
  id as studio_id,
  true as immediate_booking_allowed,
  15 as immediate_booking_buffer_minutes,
  12 as future_booking_limit_months,
  true as allow_team_member_selection,
  false as allow_group_appointments,
  true as cancellation_allowed,
  24 as cancellation_buffer_hours,
  true as rescheduling_allowed,
  24 as rescheduling_buffer_hours,
  true as online_booking_enabled
FROM public.studios
WHERE NOT EXISTS (
  SELECT 1 FROM public.appointment_booking_rules 
  WHERE appointment_booking_rules.studio_id = studios.id
);