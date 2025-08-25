
-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('studio_owner', 'manager', 'staff', 'receptionist', 'super_admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  studio_id UUID NULL, -- NULL for super_admin, required for other roles
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, studio_id)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role, _studio_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
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
$$;

-- Create function to get user's highest role for a studio
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID, _studio_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
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
      WHEN 'receptionist' THEN 5
    END
  LIMIT 1
$$;

-- Create function to check if user can manage studio
CREATE OR REPLACE FUNCTION public.can_manage_studio(_user_id UUID, _studio_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
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
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Studio owners can view roles in their studio" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    studio_id IS NOT NULL AND 
    public.has_role(auth.uid(), 'studio_owner', studio_id)
  );

CREATE POLICY "Managers can view roles in their studio" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    studio_id IS NOT NULL AND 
    public.has_role(auth.uid(), 'manager', studio_id)
  );

-- Insert/Update policies
CREATE POLICY "Super admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Studio owners can manage roles in their studio" 
  ON public.user_roles 
  FOR ALL 
  USING (
    studio_id IS NOT NULL AND 
    public.has_role(auth.uid(), 'studio_owner', studio_id) AND
    role != 'super_admin'
  );

-- Update existing table RLS policies to use role-based access

-- Update team_members policies
DROP POLICY IF EXISTS "Studio owners can manage their team members" ON public.team_members;

CREATE POLICY "Role-based team member access" 
  ON public.team_members 
  FOR ALL 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.can_manage_studio(auth.uid(), studio_id) OR
    public.has_role(auth.uid(), 'staff', studio_id) OR
    public.has_role(auth.uid(), 'receptionist', studio_id)
  );

-- Update services policies
DROP POLICY IF EXISTS "Studio owners can manage their services" ON public.services;

CREATE POLICY "Role-based services access" 
  ON public.services 
  FOR ALL 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.can_manage_studio(auth.uid(), studio_id)
  );

-- Update locations policies
DROP POLICY IF EXISTS "Studio owners can manage their locations" ON public.locations;

CREATE POLICY "Role-based locations access" 
  ON public.locations 
  FOR ALL 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.can_manage_studio(auth.uid(), studio_id)
  );

-- Update team member related tables policies
DROP POLICY IF EXISTS "Studio owners can manage team member addresses" ON public.team_member_addresses;
DROP POLICY IF EXISTS "Studio owners can manage emergency contacts" ON public.team_member_emergency_contacts;
DROP POLICY IF EXISTS "Studio owners can manage team member locations" ON public.team_member_locations;
DROP POLICY IF EXISTS "Studio owners can manage team member services" ON public.team_member_services;
DROP POLICY IF EXISTS "Studio owners can manage team shifts" ON public.team_shifts;

CREATE POLICY "Role-based team member addresses access" 
  ON public.team_member_addresses 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.id = team_member_addresses.team_member_id
        AND (
          public.has_role(auth.uid(), 'super_admin') OR
          public.can_manage_studio(auth.uid(), tm.studio_id) OR
          public.has_role(auth.uid(), 'staff', tm.studio_id) OR
          public.has_role(auth.uid(), 'receptionist', tm.studio_id)
        )
    )
  );

CREATE POLICY "Role-based emergency contacts access" 
  ON public.team_member_emergency_contacts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.id = team_member_emergency_contacts.team_member_id
        AND (
          public.has_role(auth.uid(), 'super_admin') OR
          public.can_manage_studio(auth.uid(), tm.studio_id) OR
          public.has_role(auth.uid(), 'staff', tm.studio_id) OR
          public.has_role(auth.uid(), 'receptionist', tm.studio_id)
        )
    )
  );

CREATE POLICY "Role-based team member locations access" 
  ON public.team_member_locations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.id = team_member_locations.team_member_id
        AND (
          public.has_role(auth.uid(), 'super_admin') OR
          public.can_manage_studio(auth.uid(), tm.studio_id) OR
          public.has_role(auth.uid(), 'staff', tm.studio_id) OR
          public.has_role(auth.uid(), 'receptionist', tm.studio_id)
        )
    )
  );

CREATE POLICY "Role-based team member services access" 
  ON public.team_member_services 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.id = team_member_services.team_member_id
        AND (
          public.has_role(auth.uid(), 'super_admin') OR
          public.can_manage_studio(auth.uid(), tm.studio_id) OR
          public.has_role(auth.uid(), 'staff', tm.studio_id) OR
          public.has_role(auth.uid(), 'receptionist', tm.studio_id)
        )
    )
  );

CREATE POLICY "Role-based team shifts access" 
  ON public.team_shifts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.id = team_shifts.team_member_id
        AND (
          public.has_role(auth.uid(), 'super_admin') OR
          public.can_manage_studio(auth.uid(), tm.studio_id) OR
          public.has_role(auth.uid(), 'staff', tm.studio_id) OR
          public.has_role(auth.uid(), 'receptionist', tm.studio_id)
        )
    )
  );
