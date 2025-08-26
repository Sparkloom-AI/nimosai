
-- Phase 1: Create missing tables

-- Create studios table (missing from database but used throughout frontend)
CREATE TABLE public.studios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  business_category text NOT NULL,
  phone text,
  email text,
  website text,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT studios_pkey PRIMARY KEY (id)
);

-- Create business_categories table (referenced in frontend)
CREATE TABLE public.business_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  CONSTRAINT business_categories_pkey PRIMARY KEY (id)
);

-- Phase 2: Add missing columns to locations table
ALTER TABLE public.locations 
ADD COLUMN city text,
ADD COLUMN state text,
ADD COLUMN postal_code text,
ADD COLUMN country text DEFAULT 'US',
ADD COLUMN is_primary boolean NOT NULL DEFAULT false,
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Make the new columns required (after adding them to avoid constraint violations)
ALTER TABLE public.locations 
ALTER COLUMN city SET NOT NULL,
ALTER COLUMN state SET NOT NULL,
ALTER COLUMN postal_code SET NOT NULL,
ALTER COLUMN country SET NOT NULL;

-- Phase 3: Update foreign key references
-- First, temporarily disable RLS to allow data migration
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Create a temporary function to migrate data from profiles to studios
CREATE OR REPLACE FUNCTION migrate_profiles_to_studios()
RETURNS void AS $$
DECLARE
    profile_record RECORD;
    new_studio_id uuid;
BEGIN
    -- For each profile that has associated data, create a studio
    FOR profile_record IN 
        SELECT DISTINCT p.id, p.email, p.full_name
        FROM profiles p
        WHERE EXISTS (
            SELECT 1 FROM locations l WHERE l.studio_id = p.id
            UNION
            SELECT 1 FROM services s WHERE s.studio_id = p.id
            UNION
            SELECT 1 FROM team_members tm WHERE tm.studio_id = p.id
            UNION
            SELECT 1 FROM user_roles ur WHERE ur.studio_id = p.id
        )
    LOOP
        -- Create studio record
        INSERT INTO studios (name, business_category, email)
        VALUES (
            COALESCE(profile_record.full_name, 'Studio'), 
            'General', 
            profile_record.email
        )
        RETURNING id INTO new_studio_id;
        
        -- Update foreign keys to point to new studio
        UPDATE locations SET studio_id = new_studio_id WHERE studio_id = profile_record.id;
        UPDATE services SET studio_id = new_studio_id WHERE studio_id = profile_record.id;
        UPDATE team_members SET studio_id = new_studio_id WHERE studio_id = profile_record.id;
        UPDATE user_roles SET studio_id = new_studio_id WHERE studio_id = profile_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
SELECT migrate_profiles_to_studios();

-- Drop the migration function
DROP FUNCTION migrate_profiles_to_studios();

-- Update foreign key constraints to reference studios table
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS locations_studio_id_fkey;
ALTER TABLE public.locations ADD CONSTRAINT locations_studio_id_fkey 
  FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_studio_id_fkey;
ALTER TABLE public.services ADD CONSTRAINT services_studio_id_fkey 
  FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_studio_id_fkey;
ALTER TABLE public.team_members ADD CONSTRAINT team_members_studio_id_fkey 
  FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

-- user_roles.studio_id can be nullable (for super_admin), so we add a conditional foreign key
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_studio_id_fkey;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_studio_id_fkey 
  FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

-- Add updated_at trigger for studios
CREATE TRIGGER update_studios_updated_at
  BEFORE UPDATE ON public.studios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for locations  
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 5: Set up RLS policies for new tables
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

-- Studios RLS policies
CREATE POLICY "Role-based studios access" ON public.studios
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.studio_id = studios.id
      AND ur.role IN ('studio_owner', 'manager', 'staff', 'freelancer')
    )
  );

-- Business categories can be read by all authenticated users
CREATE POLICY "Authenticated users can read business categories" ON public.business_categories
  FOR SELECT TO authenticated USING (true);

-- Super admins can manage business categories
CREATE POLICY "Super admins can manage business categories" ON public.business_categories
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Re-enable RLS for other tables
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Phase 6: Create studio management functions
CREATE OR REPLACE FUNCTION public.get_user_studios()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  business_category text,
  phone text,
  email text,
  website text,
  timezone text,
  created_at timestamptz,
  updated_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admin can see all studios
  IF has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN QUERY
    SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
    FROM studios s
    ORDER BY s.name;
  ELSE
    -- Regular users can only see studios they have roles in
    RETURN QUERY
    SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
    FROM studios s
    INNER JOIN user_roles ur ON s.id = ur.studio_id
    WHERE ur.user_id = auth.uid()
    ORDER BY s.name;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_studio_by_id(studio_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  business_category text,
  phone text,
  email text,
  website text,
  timezone text,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER  
SET search_path = public
AS $$
BEGIN
  -- Check if user has access to this studio
  IF has_role(auth.uid(), 'super_admin'::app_role) OR 
     EXISTS (
       SELECT 1 FROM user_roles ur 
       WHERE ur.user_id = auth.uid() 
       AND ur.studio_id = $1
     ) THEN
    RETURN QUERY
    SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
    FROM studios s
    WHERE s.id = $1;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.create_studio_with_data(
  studio_name text,
  studio_website text DEFAULT NULL,
  studio_business_category text DEFAULT 'General',
  studio_description text DEFAULT NULL,
  studio_phone text DEFAULT NULL,
  studio_email text DEFAULT NULL,
  studio_timezone text DEFAULT 'UTC'
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  business_category text,
  phone text,
  email text,
  website text,
  timezone text,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_studio_id uuid;
BEGIN
  -- Create the studio
  INSERT INTO studios (name, website, business_category, description, phone, email, timezone)
  VALUES (studio_name, studio_website, studio_business_category, studio_description, studio_phone, studio_email, studio_timezone)
  RETURNING studios.id INTO new_studio_id;
  
  -- Assign studio_owner role to the current user
  INSERT INTO user_roles (user_id, role, studio_id)
  VALUES (auth.uid(), 'studio_owner'::app_role, new_studio_id);
  
  -- Return the created studio
  RETURN QUERY
  SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  FROM studios s
  WHERE s.id = new_studio_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_studio_data(
  studio_id uuid,
  studio_name text DEFAULT NULL,
  studio_website text DEFAULT NULL,
  studio_business_category text DEFAULT NULL,
  studio_description text DEFAULT NULL,
  studio_phone text DEFAULT NULL,
  studio_email text DEFAULT NULL,
  studio_timezone text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  business_category text,
  phone text,
  email text,
  website text,
  timezone text,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user can manage this studio
  IF NOT (has_role(auth.uid(), 'super_admin'::app_role) OR can_manage_studio(auth.uid(), studio_id)) THEN
    RAISE EXCEPTION 'Insufficient permissions to update studio';
  END IF;
  
  -- Update the studio
  UPDATE studios SET
    name = COALESCE(studio_name, studios.name),
    website = COALESCE(studio_website, studios.website),
    business_category = COALESCE(studio_business_category, studios.business_category),
    description = COALESCE(studio_description, studios.description),
    phone = COALESCE(studio_phone, studios.phone),
    email = COALESCE(studio_email, studios.email),
    timezone = COALESCE(studio_timezone, studios.timezone),
    updated_at = now()
  WHERE studios.id = studio_id;
  
  -- Return the updated studio
  RETURN QUERY
  SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  FROM studios s
  WHERE s.id = studio_id;
END;
$$ LANGUAGE plpgsql;

-- Populate business categories with common types
INSERT INTO business_categories (name, description) VALUES
  ('Hair Salon', 'Hair cutting, styling, and treatments'),
  ('Beauty Salon', 'General beauty services'),
  ('Nail Salon', 'Manicures, pedicures, and nail art'),
  ('Spa', 'Wellness and relaxation services'),
  ('Barbershop', 'Traditional barbering services'),
  ('Massage Therapy', 'Therapeutic and relaxation massage'),
  ('Fitness Studio', 'Personal training and fitness classes'),
  ('Yoga Studio', 'Yoga and meditation classes'),
  ('Wellness Center', 'Holistic health and wellness'),
  ('Medical Spa', 'Medical aesthetic treatments'),
  ('Tattoo & Piercing', 'Body art services'),
  ('General', 'Other professional services')
ON CONFLICT (name) DO NOTHING;
