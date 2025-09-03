-- Fix security warning: Set search_path for the log_client_access function
CREATE OR REPLACE FUNCTION log_client_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;