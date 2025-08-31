-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.log_role_assignment_security_event()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;