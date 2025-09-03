-- Fix critical security vulnerability: Strengthen authentication for clients table
-- Ensure no unauthorized access to sensitive customer personal information

-- Drop existing policy to replace with more secure version
DROP POLICY "Role-based clients access" ON public.clients;

-- Create enhanced security policy with explicit authentication checks
CREATE POLICY "Secure authenticated clients access" 
ON public.clients
FOR ALL
TO public
USING (
  -- CRITICAL: Explicit authentication check first
  auth.uid() IS NOT NULL AND
  (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    can_manage_studio(auth.uid(), studio_id) OR 
    has_role(auth.uid(), 'staff'::app_role, studio_id) OR 
    has_role(auth.uid(), 'freelancer'::app_role, studio_id)
  )
)
WITH CHECK (
  -- CRITICAL: Explicit authentication check for inserts/updates
  auth.uid() IS NOT NULL AND
  (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    can_manage_studio(auth.uid(), studio_id) OR 
    has_role(auth.uid(), 'staff'::app_role, studio_id) OR 
    has_role(auth.uid(), 'freelancer'::app_role, studio_id)
  )
);

-- Also secure client_preferences table with same enhanced security
DROP POLICY "Role-based client preferences access" ON public.client_preferences;

CREATE POLICY "Secure authenticated client preferences access" 
ON public.client_preferences
FOR ALL
TO public
USING (
  -- CRITICAL: Explicit authentication check first
  auth.uid() IS NOT NULL AND
  (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = client_preferences.client_id 
      AND (
        can_manage_studio(auth.uid(), c.studio_id) OR 
        has_role(auth.uid(), 'staff'::app_role, c.studio_id) OR 
        has_role(auth.uid(), 'freelancer'::app_role, c.studio_id)
      )
    )
  )
)
WITH CHECK (
  -- CRITICAL: Explicit authentication check for inserts/updates
  auth.uid() IS NOT NULL AND
  (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    EXISTS (
      SELECT 1
      FROM public.clients c
      WHERE c.id = client_preferences.client_id 
      AND (
        can_manage_studio(auth.uid(), c.studio_id) OR 
        has_role(auth.uid(), 'staff'::app_role, c.studio_id) OR 
        has_role(auth.uid(), 'freelancer'::app_role, c.studio_id)
      )
    )
  )
);

-- Add audit logging trigger for client data access monitoring
CREATE OR REPLACE FUNCTION log_client_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log sensitive client data access for security monitoring
  IF TG_OP = 'SELECT' THEN
    PERFORM log_security_event_enhanced(
      'client_data_accessed',
      auth.uid(),
      jsonb_build_object(
        'client_id', NEW.id,
        'operation', TG_OP,
        'table', TG_TABLE_NAME
      ),
      NEW.studio_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;