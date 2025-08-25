
-- First, update any existing 'receptionist' roles to 'freelancer'
UPDATE public.user_roles 
SET role = 'freelancer' 
WHERE role = 'receptionist';

-- Create a new enum without 'receptionist'
CREATE TYPE public.app_role_new AS ENUM ('super_admin', 'studio_owner', 'manager', 'staff', 'freelancer');

-- Update the user_roles table to use the new enum
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE public.app_role_new 
USING role::text::public.app_role_new;

-- Drop the old enum and rename the new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Update any database functions that reference the old enum
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role, _studio_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (
        -- Super admin doesn't need studio_id check
        (_role = 'super_admin' AND studio_id IS NULL) OR
        -- Other roles must match studio_id
        (_role != 'super_admin' AND studio_id = _studio_id)
      )
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid, _studio_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND (studio_id = _studio_id OR (role = 'super_admin' AND studio_id IS NULL))
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'studio_owner' THEN 2
      WHEN 'manager' THEN 3
      WHEN 'staff' THEN 4
      WHEN 'freelancer' THEN 5
    END
  LIMIT 1
$function$;
