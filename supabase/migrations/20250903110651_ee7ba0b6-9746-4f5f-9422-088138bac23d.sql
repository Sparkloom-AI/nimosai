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
    -- Staff and freelancers have limited access to client data
    (has_role(auth.uid(), 'staff'::app_role, studio_id) AND 
     -- Log client data access for non-managers
     (SELECT log_security_event_enhanced(
       'client_data_accessed',
       auth.uid(),
       jsonb_build_object('client_id', id, 'accessed_by_role', 'staff'),
       studio_id
     )) IS NOT NULL) OR
    (has_role(auth.uid(), 'freelancer'::app_role, studio_id) AND 
     -- Log client data access for freelancers
     (SELECT log_security_event_enhanced(
       'client_data_accessed', 
       auth.uid(),
       jsonb_build_object('client_id', id, 'accessed_by_role', 'freelancer'),
       studio_id
     )) IS NOT NULL)
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

-- Create a trigger to log client data access
CREATE OR REPLACE FUNCTION log_client_data_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log when non-managers access client data
  IF TG_OP = 'SELECT' AND NOT can_manage_studio(auth.uid(), NEW.studio_id) THEN
    PERFORM log_security_event_enhanced(
      'sensitive_client_access',
      auth.uid(),
      jsonb_build_object(
        'client_id', NEW.id,
        'client_name', NEW.first_name || ' ' || NEW.last_name,
        'access_type', TG_OP
      ),
      NEW.studio_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the trigger to the clients table
DROP TRIGGER IF EXISTS log_client_access_trigger ON public.clients;
CREATE TRIGGER log_client_access_trigger
  AFTER SELECT ON public.clients
  FOR EACH ROW 
  EXECUTE FUNCTION log_client_data_access();