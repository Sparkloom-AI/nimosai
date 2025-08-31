-- Fix business categories RLS policy to restrict access based on studio membership
DROP POLICY IF EXISTS "Authenticated users can view business categories" ON public.business_categories;

-- Create more restrictive policy that only allows access when user has studio access
CREATE POLICY "Business categories viewable by studio members" 
ON public.business_categories 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid()
    )
  )
);

-- Enhance security audit logging for role assignments
CREATE OR REPLACE FUNCTION public.log_role_assignment_security_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role assignment events for security audit
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (
      user_id,
      event_type,
      event_details,
      studio_id,
      success
    ) VALUES (
      auth.uid(),
      'role_assigned',
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'role_assigned', NEW.role,
        'studio_id', NEW.studio_id,
        'assignment_method', 'direct_insert'
      ),
      NEW.studio_id,
      true
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_log (
      user_id,
      event_type,
      event_details,
      studio_id,
      success
    ) VALUES (
      auth.uid(),
      'role_removed',
      jsonb_build_object(
        'target_user_id', OLD.user_id,
        'role_removed', OLD.role,
        'studio_id', OLD.studio_id,
        'removal_method', 'direct_delete'
      ),
      OLD.studio_id,
      true
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role assignment audit logging
DROP TRIGGER IF EXISTS role_assignment_audit_trigger ON public.user_roles;
CREATE TRIGGER role_assignment_audit_trigger
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_assignment_security_event();