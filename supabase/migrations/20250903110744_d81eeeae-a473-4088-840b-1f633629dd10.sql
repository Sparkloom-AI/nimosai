-- Priority 1: Restrict Team Member Data Access
-- Update team_members RLS policy to be more restrictive for personal information
DROP POLICY IF EXISTS "Role-based team member access" ON public.team_members;

CREATE POLICY "Restricted team member access" 
ON public.team_members 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  can_manage_studio(auth.uid(), studio_id) OR
  -- Team members can only view their own data
  (has_role(auth.uid(), 'staff'::app_role, studio_id) AND 
   EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.email = team_members.email)) OR
  (has_role(auth.uid(), 'freelancer'::app_role, studio_id) AND 
   EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.email = team_members.email))
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  can_manage_studio(auth.uid(), studio_id) OR
  -- Team members can only update their own data
  (has_role(auth.uid(), 'staff'::app_role, studio_id) AND 
   EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.email = team_members.email)) OR
  (has_role(auth.uid(), 'freelancer'::app_role, studio_id) AND 
   EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.email = team_members.email))
);

-- Priority 2: Secure Audit Log System
-- Update security_audit_log to prevent user insertions and allow only system insertions
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;

CREATE POLICY "System insertions only" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (
  -- Only allow insertions through security definer functions
  current_setting('role') = 'authenticator' OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Ensure audit logs can only be modified by super admins
CREATE POLICY "Super admin audit management" 
ON public.security_audit_log 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin audit deletion" 
ON public.security_audit_log 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Priority 4: Enhanced Client Data Protection
-- Update clients RLS to be more restrictive for sensitive information
DROP POLICY IF EXISTS "Secure authenticated clients access" ON public.clients;

CREATE POLICY "Enhanced client data protection" 
ON public.clients 
FOR ALL 
USING (
  (auth.uid() IS NOT NULL) AND (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    can_manage_studio(auth.uid(), studio_id) OR
    has_role(auth.uid(), 'staff'::app_role, studio_id) OR
    has_role(auth.uid(), 'freelancer'::app_role, studio_id)
  )
)
WITH CHECK (
  (auth.uid() IS NOT NULL) AND (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    can_manage_studio(auth.uid(), studio_id) OR
    has_role(auth.uid(), 'staff'::app_role, studio_id) OR 
    has_role(auth.uid(), 'freelancer'::app_role, studio_id)
  )
);

-- Priority 5: Rate Limiting Enhancement
-- Update rate limiting function to be more secure and efficient
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  p_user_id uuid DEFAULT auth.uid(), 
  p_ip_address inet DEFAULT NULL::inet, 
  p_action_type text DEFAULT 'general'::text, 
  p_max_attempts integer DEFAULT 5, 
  p_window_minutes integer DEFAULT 15
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old entries first
  DELETE FROM public.rate_limit_attempts 
  WHERE created_at < window_start;
  
  -- Count current attempts within the window
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_attempts
  FROM public.rate_limit_attempts
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_ip_address IS NULL OR ip_address = p_ip_address)
    AND action_type = p_action_type
    AND window_start >= window_start;
  
  -- If limit exceeded, log violation and return false
  IF current_attempts >= p_max_attempts THEN
    PERFORM public.log_security_event_enhanced(
      'rate_limit_exceeded',
      p_user_id,
      jsonb_build_object(
        'action_type', p_action_type,
        'attempts', current_attempts,
        'limit', p_max_attempts,
        'window_minutes', p_window_minutes,
        'ip_address', p_ip_address::text
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
$$;