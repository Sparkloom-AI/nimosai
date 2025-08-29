-- Update database functions to handle the new business_category_id column

-- Update create_studio_with_data function
CREATE OR REPLACE FUNCTION public.create_studio_with_data(
  studio_name text, 
  studio_website text DEFAULT NULL, 
  studio_business_category_id uuid DEFAULT NULL, 
  studio_description text DEFAULT NULL, 
  studio_phone text DEFAULT NULL, 
  studio_email text DEFAULT NULL, 
  studio_timezone text DEFAULT 'UTC'
)
RETURNS TABLE(
  id uuid, 
  name text, 
  description text, 
  business_category_id uuid, 
  phone text, 
  email text, 
  website text, 
  timezone text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_studio_id uuid;
  studio_record RECORD;
  default_category_id uuid;
BEGIN
  -- Get default category ID if none provided
  IF studio_business_category_id IS NULL THEN
    SELECT bc.id INTO default_category_id 
    FROM public.business_categories bc 
    WHERE bc.name = 'General' 
    LIMIT 1;
    studio_business_category_id := default_category_id;
  END IF;

  -- Insert the new studio
  INSERT INTO public.studios (name, website, business_category_id, description, phone, email, timezone)
  VALUES (studio_name, studio_website, studio_business_category_id, studio_description, studio_phone, studio_email, studio_timezone)
  RETURNING studios.id INTO new_studio_id;

  -- Assign the studio_owner role to the current user
  INSERT INTO public.user_roles (user_id, role, studio_id)
  VALUES (auth.uid(), 'studio_owner'::app_role, new_studio_id);

  -- Return the created studio
  SELECT s.id, s.name, s.description, s.business_category_id, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = new_studio_id;

  RETURN QUERY SELECT studio_record.id, studio_record.name, studio_record.description, studio_record.business_category_id, studio_record.phone, studio_record.email, studio_record.website, studio_record.timezone, studio_record.created_at, studio_record.updated_at;
END;
$function$;

-- Update update_studio_data function
CREATE OR REPLACE FUNCTION public.update_studio_data(
  studio_id uuid, 
  studio_name text DEFAULT NULL, 
  studio_website text DEFAULT NULL, 
  studio_business_category_id uuid DEFAULT NULL, 
  studio_description text DEFAULT NULL, 
  studio_phone text DEFAULT NULL, 
  studio_email text DEFAULT NULL, 
  studio_timezone text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, 
  name text, 
  description text, 
  business_category_id uuid, 
  phone text, 
  email text, 
  website text, 
  timezone text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
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
    business_category_id = COALESCE(studio_business_category_id, studios.business_category_id),
    description = COALESCE(studio_description, studios.description),
    phone = COALESCE(studio_phone, studios.phone),
    email = COALESCE(studio_email, studios.email),
    timezone = COALESCE(studio_timezone, studios.timezone),
    updated_at = now()
  WHERE studios.id = studio_id;

  -- Return the updated studio
  SELECT s.id, s.name, s.description, s.business_category_id, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = studio_id;

  RETURN QUERY SELECT studio_record.id, studio_record.name, studio_record.description, studio_record.business_category_id, studio_record.phone, studio_record.email, studio_record.website, studio_record.timezone, studio_record.created_at, studio_record.updated_at;
END;
$function$;

-- Update get_user_studios function
CREATE OR REPLACE FUNCTION public.get_user_studios()
RETURNS TABLE(
  id uuid, 
  name text, 
  description text, 
  business_category_id uuid, 
  phone text, 
  email text, 
  website text, 
  timezone text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT s.id, s.name, s.description, s.business_category_id, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  FROM public.studios s
  WHERE 
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.studio_id = s.id
    );
$function$;

-- Update get_studio_by_id function
CREATE OR REPLACE FUNCTION public.get_studio_by_id(studio_id uuid)
RETURNS TABLE(
  id uuid, 
  name text, 
  description text, 
  business_category_id uuid, 
  phone text, 
  email text, 
  website text, 
  timezone text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT s.id, s.name, s.description, s.business_category_id, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
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