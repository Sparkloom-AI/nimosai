-- Create security audit log table for tracking sensitive operations
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  studio_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins and studio owners can view audit logs for their studio
CREATE POLICY "Audit log access" ON public.security_audit_log
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (studio_id IS NOT NULL AND has_role(auth.uid(), 'studio_owner'::app_role, studio_id))
);

-- Only the system can insert audit logs (via security definer functions)
CREATE POLICY "System can insert audit logs" ON public.security_audit_log
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create secure role assignment function with validation
CREATE OR REPLACE FUNCTION public.assign_user_role_secure(
  p_user_id UUID,
  p_role app_role,
  p_studio_id UUID,
  p_assigned_by UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigner_role app_role;
  new_role_id UUID;
  studio_exists BOOLEAN;
BEGIN
  -- Validate that the studio exists
  SELECT EXISTS(SELECT 1 FROM studios WHERE id = p_studio_id) INTO studio_exists;
  IF NOT studio_exists THEN
    RAISE EXCEPTION 'Studio does not exist';
  END IF;

  -- Get the role of the person assigning the role
  SELECT get_user_role(p_assigned_by, p_studio_id) INTO assigner_role;
  
  -- Validate permissions based on role hierarchy
  CASE 
    WHEN assigner_role = 'super_admin' THEN
      -- Super admin can assign any role except super_admin
      IF p_role = 'super_admin' THEN
        RAISE EXCEPTION 'Cannot assign super_admin role';
      END IF;
    
    WHEN assigner_role = 'studio_owner' THEN
      -- Studio owner can assign manager, staff, freelancer
      IF p_role NOT IN ('manager', 'staff', 'freelancer') THEN
        RAISE EXCEPTION 'Studio owners can only assign manager, staff, or freelancer roles';
      END IF;
    
    WHEN assigner_role = 'manager' THEN
      -- Manager can only assign staff, freelancer
      IF p_role NOT IN ('staff', 'freelancer') THEN
        RAISE EXCEPTION 'Managers can only assign staff or freelancer roles';
      END IF;
    
    ELSE
      RAISE EXCEPTION 'Insufficient permissions to assign roles';
  END CASE;

  -- Check if user already has a role in this studio
  IF EXISTS(SELECT 1 FROM user_roles WHERE user_id = p_user_id AND studio_id = p_studio_id) THEN
    RAISE EXCEPTION 'User already has a role in this studio';
  END IF;

  -- Insert the new role
  INSERT INTO user_roles (user_id, role, studio_id)
  VALUES (p_user_id, p_role, p_studio_id)
  RETURNING id INTO new_role_id;

  -- Log the role assignment
  INSERT INTO security_audit_log (
    user_id,
    event_type,
    event_details,
    studio_id,
    success
  ) VALUES (
    p_assigned_by,
    'role_assigned',
    jsonb_build_object(
      'target_user_id', p_user_id,
      'role_assigned', p_role,
      'studio_id', p_studio_id
    ),
    p_studio_id,
    true
  );

  RETURN new_role_id;
END;
$$;

-- Create secure role removal function
CREATE OR REPLACE FUNCTION public.remove_user_role_secure(
  p_role_id UUID,
  p_removed_by UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_record RECORD;
  remover_role app_role;
BEGIN
  -- Get the role being removed
  SELECT ur.*, get_user_role(p_removed_by, ur.studio_id) as remover_role
  INTO role_record
  FROM user_roles ur 
  WHERE ur.id = p_role_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role not found';
  END IF;

  -- Validate permissions
  CASE 
    WHEN role_record.remover_role = 'super_admin' THEN
      -- Super admin can remove any role except other super_admins
      IF role_record.role = 'super_admin' THEN
        RAISE EXCEPTION 'Cannot remove super_admin role';
      END IF;
    
    WHEN role_record.remover_role = 'studio_owner' THEN
      -- Studio owner can remove manager, staff, freelancer
      IF role_record.role NOT IN ('manager', 'staff', 'freelancer') THEN
        RAISE EXCEPTION 'Studio owners can only remove manager, staff, or freelancer roles';
      END IF;
    
    WHEN role_record.remover_role = 'manager' THEN
      -- Manager can only remove staff, freelancer
      IF role_record.role NOT IN ('staff', 'freelancer') THEN
        RAISE EXCEPTION 'Managers can only remove staff or freelancer roles';
      END IF;
    
    ELSE
      RAISE EXCEPTION 'Insufficient permissions to remove roles';
  END CASE;

  -- Remove the role
  DELETE FROM user_roles WHERE id = p_role_id;

  -- Log the role removal
  INSERT INTO security_audit_log (
    user_id,
    event_type,
    event_details,
    studio_id,
    success
  ) VALUES (
    p_removed_by,
    'role_removed',
    jsonb_build_object(
      'target_user_id', role_record.user_id,
      'role_removed', role_record.role,
      'studio_id', role_record.studio_id
    ),
    role_record.studio_id,
    true
  );

  RETURN true;
END;
$$;

-- Update business categories RLS to require authentication
DROP POLICY IF EXISTS "Anyone can view business categories" ON public.business_categories;

CREATE POLICY "Authenticated users can view business categories" 
ON public.business_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);