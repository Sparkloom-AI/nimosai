
-- First, update any existing receptionist roles to freelancer
UPDATE public.user_roles 
SET role = 'freelancer'::app_role 
WHERE role = 'receptionist'::app_role;

-- Add the new freelancer role to the enum
ALTER TYPE public.app_role ADD VALUE 'freelancer';

-- Remove the receptionist role from the enum
-- Note: We need to create a new enum and migrate since PostgreSQL doesn't support removing enum values directly
CREATE TYPE public.app_role_new AS ENUM ('studio_owner', 'manager', 'staff', 'freelancer', 'super_admin');

-- Update the user_roles table to use the new enum
ALTER TABLE public.user_roles ALTER COLUMN role TYPE app_role_new USING role::text::app_role_new;

-- Drop the old enum and rename the new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Update the database function to handle freelancer role in hierarchy
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

-- Update the has_role function to include freelancer
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

-- Update the can_manage_studio function to include freelancer in appropriate contexts
CREATE OR REPLACE FUNCTION public.can_manage_studio(_user_id uuid, _studio_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'studio_owner', 'manager')
      AND (
        (role = 'super_admin' AND studio_id IS NULL) OR
        (role IN ('studio_owner', 'manager') AND studio_id = _studio_id)
      )
  )
$function$;

-- Update RLS policies that referenced receptionist to use freelancer
-- For team_members table
DROP POLICY IF EXISTS "Role-based team member access" ON public.team_members;
CREATE POLICY "Role-based team member access" ON public.team_members
FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id) OR 
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR 
  has_role(auth.uid(), 'freelancer'::app_role, studio_id)
);

-- Update RLS policies for team member related tables
DROP POLICY IF EXISTS "Role-based team member addresses access" ON public.team_member_addresses;
CREATE POLICY "Role-based team member addresses access" ON public.team_member_addresses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.id = team_member_addresses.team_member_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR 
      can_manage_studio(auth.uid(), tm.studio_id) OR 
      has_role(auth.uid(), 'staff'::app_role, tm.studio_id) OR 
      has_role(auth.uid(), 'freelancer'::app_role, tm.studio_id)
    )
  )
);

DROP POLICY IF EXISTS "Role-based emergency contacts access" ON public.team_member_emergency_contacts;
CREATE POLICY "Role-based emergency contacts access" ON public.team_member_emergency_contacts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.id = team_member_emergency_contacts.team_member_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR 
      can_manage_studio(auth.uid(), tm.studio_id) OR 
      has_role(auth.uid(), 'staff'::app_role, tm.studio_id) OR 
      has_role(auth.uid(), 'freelancer'::app_role, tm.studio_id)
    )
  )
);

DROP POLICY IF EXISTS "Role-based team member locations access" ON public.team_member_locations;
CREATE POLICY "Role-based team member locations access" ON public.team_member_locations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.id = team_member_locations.team_member_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR 
      can_manage_studio(auth.uid(), tm.studio_id) OR 
      has_role(auth.uid(), 'staff'::app_role, tm.studio_id) OR 
      has_role(auth.uid(), 'freelancer'::app_role, tm.studio_id)
    )
  )
);

DROP POLICY IF EXISTS "Role-based team member services access" ON public.team_member_services;
CREATE POLICY "Role-based team member services access" ON public.team_member_services
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.id = team_member_services.team_member_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR 
      can_manage_studio(auth.uid(), tm.studio_id) OR 
      has_role(auth.uid(), 'staff'::app_role, tm.studio_id) OR 
      has_role(auth.uid(), 'freelancer'::app_role, tm.studio_id)
    )
  )
);

DROP POLICY IF EXISTS "Role-based team shifts access" ON public.team_shifts;
CREATE POLICY "Role-based team shifts access" ON public.team_shifts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.id = team_shifts.team_member_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR 
      can_manage_studio(auth.uid(), tm.studio_id) OR 
      has_role(auth.uid(), 'staff'::app_role, tm.studio_id) OR 
      has_role(auth.uid(), 'freelancer'::app_role, tm.studio_id)
    )
  )
);
