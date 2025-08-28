-- Remove the business_category_id column from studios table to fix ambiguous reference
-- The business categories are now properly managed through the junction table only

-- First, drop the foreign key constraint
ALTER TABLE public.studios 
DROP CONSTRAINT IF EXISTS fk_studios_business_category;

-- Remove the business_category_id column from studios table
ALTER TABLE public.studios 
DROP COLUMN IF EXISTS business_category_id;

-- Update the create_studio_with_data function to not use the removed column
CREATE OR REPLACE FUNCTION public.create_studio_with_data(
  p_studio_name text,
  p_studio_website text DEFAULT NULL::text,
  p_studio_business_category_id uuid DEFAULT NULL::uuid,
  p_studio_description text DEFAULT NULL::text,
  p_studio_phone text DEFAULT NULL::text,
  p_studio_email text DEFAULT NULL::text,
  p_studio_timezone text DEFAULT 'UTC'::text,
  p_additional_category_ids uuid[] DEFAULT NULL::uuid[]
)
RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_studio_id uuid;
  studio_record RECORD;
  default_category_id uuid;
  category_id uuid;
BEGIN
  -- Get default category ID if none provided (using 'Other' as default)
  IF p_studio_business_category_id IS NULL THEN
    SELECT bc.id INTO default_category_id 
    FROM public.business_categories bc 
    WHERE bc.name = 'Other' 
    LIMIT 1;
    p_studio_business_category_id := default_category_id;
  END IF;

  -- Insert the new studio (without business_category_id column)
  INSERT INTO public.studios (name, website, description, phone, email, timezone)
  VALUES (p_studio_name, p_studio_website, p_studio_description, p_studio_phone, p_studio_email, p_studio_timezone)
  RETURNING studios.id INTO new_studio_id;

  -- Insert primary category into junction table
  INSERT INTO public.studio_business_categories (studio_id, business_category_id, is_primary)
  VALUES (new_studio_id, p_studio_business_category_id, true);

  -- Insert additional categories into junction table
  IF p_additional_category_ids IS NOT NULL THEN
    FOREACH category_id IN ARRAY p_additional_category_ids
    LOOP
      -- Only insert if it's not the primary category
      IF category_id != p_studio_business_category_id THEN
        INSERT INTO public.studio_business_categories (studio_id, business_category_id, is_primary)
        VALUES (new_studio_id, category_id, false)
        ON CONFLICT (studio_id, business_category_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  -- Assign the studio_owner role to the current user
  INSERT INTO public.user_roles (user_id, role, studio_id)
  VALUES (auth.uid(), 'studio_owner'::app_role, new_studio_id);

  -- Return the created studio (no more business_category_id column)
  SELECT s.id, s.name, s.description, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = new_studio_id;

  RETURN QUERY SELECT studio_record.id, studio_record.name, studio_record.description, studio_record.phone, studio_record.email, studio_record.website, studio_record.timezone, studio_record.created_at, studio_record.updated_at;
END;
$function$;

-- Update other functions that reference business_category_id
CREATE OR REPLACE FUNCTION public.get_user_studios()
RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT s.id, s.name, s.description, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  FROM public.studios s
  WHERE 
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.studio_id = s.id
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_studio_by_id(studio_id uuid)
RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT s.id, s.name, s.description, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  FROM public.studios s
  WHERE s.id = studio_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.studio_id = s.id
      )
    );
$function$;

CREATE OR REPLACE FUNCTION public.update_studio_data(
  studio_id uuid,
  studio_name text DEFAULT NULL::text,
  studio_website text DEFAULT NULL::text,
  studio_description text DEFAULT NULL::text,
  studio_phone text DEFAULT NULL::text,
  studio_email text DEFAULT NULL::text,
  studio_timezone text DEFAULT NULL::text
)
RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  studio_record RECORD;
BEGIN
  -- Check if user has permission to update this studio
  IF NOT (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'studio_owner'::app_role, studio_id)
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to update studio';
  END IF;

  -- Update the studio (only update fields that are not NULL)
  UPDATE public.studios 
  SET 
    name = COALESCE(studio_name, studios.name),
    website = COALESCE(studio_website, studios.website),
    description = COALESCE(studio_description, studios.description),
    phone = COALESCE(studio_phone, studios.phone),
    email = COALESCE(studio_email, studios.email),
    timezone = COALESCE(studio_timezone, studios.timezone),
    updated_at = now()
  WHERE studios.id = studio_id;

  -- Return the updated studio
  SELECT s.id, s.name, s.description, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = studio_id;

  RETURN QUERY SELECT studio_record.id, studio_record.name, studio_record.description, studio_record.phone, studio_record.email, studio_record.website, studio_record.timezone, studio_record.created_at, studio_record.updated_at;
END;
$function$;

-- Clean up test data
-- Delete in order to respect foreign key constraints
DELETE FROM public.team_shifts WHERE team_member_id IN (
  SELECT id FROM public.team_members WHERE studio_id IN (
    SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
  )
);

DELETE FROM public.team_member_services WHERE team_member_id IN (
  SELECT id FROM public.team_members WHERE studio_id IN (
    SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
  )
);

DELETE FROM public.team_member_locations WHERE team_member_id IN (
  SELECT id FROM public.team_members WHERE studio_id IN (
    SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
  )
);

DELETE FROM public.team_member_emergency_contacts WHERE team_member_id IN (
  SELECT id FROM public.team_members WHERE studio_id IN (
    SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
  )
);

DELETE FROM public.team_member_addresses WHERE team_member_id IN (
  SELECT id FROM public.team_members WHERE studio_id IN (
    SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
  )
);

DELETE FROM public.team_members WHERE studio_id IN (
  SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
);

DELETE FROM public.services WHERE studio_id IN (
  SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
);

DELETE FROM public.locations WHERE studio_id IN (
  SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
);

DELETE FROM public.studio_business_categories WHERE studio_id IN (
  SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
);

-- Delete user roles for test studios (but keep super_admin roles)
DELETE FROM public.user_roles WHERE studio_id IN (
  SELECT id FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%'
) AND role != 'super_admin';

-- Finally delete the test studios
DELETE FROM public.studios WHERE name LIKE '%Test%' OR name LIKE '%test%' OR name LIKE '%Demo%' OR name LIKE '%demo%';