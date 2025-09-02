-- Security Enhancement: Add additional validation and security functions

-- Create enhanced security logging function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_event_type text,
  p_user_id uuid DEFAULT auth.uid(),
  p_event_details jsonb DEFAULT '{}'::jsonb,
  p_studio_id uuid DEFAULT NULL,
  p_ip_address inet DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_id, 
    event_details,
    studio_id,
    ip_address,
    success
  ) VALUES (
    p_event_type,
    p_user_id,
    p_event_details || jsonb_build_object(
      'timestamp', extract(epoch from now()),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    p_studio_id,
    p_ip_address,
    true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enhanced function to validate studio access with logging
CREATE OR REPLACE FUNCTION public.validate_studio_access_secure(
  p_user_id uuid,
  p_studio_id uuid,
  p_action text DEFAULT 'access'
) RETURNS boolean AS $$
DECLARE
  has_access boolean;
BEGIN
  -- Check if user has any role in the studio or is super admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p_user_id 
    AND (ur.studio_id = p_studio_id OR ur.role = 'super_admin')
  ) INTO has_access;
  
  -- Log access attempt
  PERFORM public.log_security_event_enhanced(
    'studio_access_attempt',
    p_user_id,
    jsonb_build_object(
      'studio_id', p_studio_id,
      'action', p_action,
      'access_granted', has_access
    ),
    p_studio_id
  );
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address inet,
  action_type text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policy for rate limiting table (only super admins can view)
CREATE POLICY "Super admins can manage rate limits" ON public.rate_limit_attempts
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Function to check and enforce rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid DEFAULT auth.uid(),
  p_ip_address inet DEFAULT NULL,
  p_action_type text DEFAULT 'general',
  p_max_attempts integer DEFAULT 10,
  p_window_minutes integer DEFAULT 15
) RETURNS boolean AS $$
DECLARE
  current_attempts integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.rate_limit_attempts 
  WHERE created_at < window_start;
  
  -- Count current attempts
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_attempts
  FROM public.rate_limit_attempts
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_ip_address IS NULL OR ip_address = p_ip_address)
    AND action_type = p_action_type
    AND window_start >= window_start;
  
  -- If limit exceeded, return false
  IF current_attempts >= p_max_attempts THEN
    -- Log the rate limit violation
    PERFORM public.log_security_event_enhanced(
      'rate_limit_exceeded',
      p_user_id,
      jsonb_build_object(
        'action_type', p_action_type,
        'attempts', current_attempts,
        'limit', p_max_attempts,
        'window_minutes', p_window_minutes
      )
    );
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO public.rate_limit_attempts (user_id, ip_address, action_type, window_start)
  VALUES (p_user_id, p_ip_address, p_action_type, window_start)
  ON CONFLICT (user_id, action_type, window_start) 
  DO UPDATE SET 
    attempt_count = rate_limit_attempts.attempt_count + 1,
    created_at = now();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add indexes for better performance on security tables
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_studio 
ON public.security_audit_log(user_id, studio_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type 
ON public.security_audit_log(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_attempts_lookup 
ON public.rate_limit_attempts(user_id, action_type, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limit_attempts_ip 
ON public.rate_limit_attempts(ip_address, action_type, window_start);