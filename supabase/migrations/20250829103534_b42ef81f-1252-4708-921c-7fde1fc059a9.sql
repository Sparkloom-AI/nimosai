-- Fix security issues by setting proper search_path for all functions

-- Update handle_new_user function with proper security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    country,
    country_code,
    phone_prefix,
    timezone,
    currency,
    language
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'country', 'US'),
    COALESCE(NEW.raw_user_meta_data ->> 'country_code', 'US'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_prefix', '+1'),
    COALESCE(NEW.raw_user_meta_data ->> 'timezone', 'America/New_York'),
    COALESCE(NEW.raw_user_meta_data ->> 'currency', 'USD'),
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'en')
  );
  RETURN NEW;
END;
$$;

-- Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.check_email_exists(email_address text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE email = email_address
  );
$$;

CREATE OR REPLACE FUNCTION public.get_studio_categories(studio_id uuid)
RETURNS TABLE(category_id uuid, category_name text, category_description text, is_primary boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bc.id as category_id,
    bc.name as category_name,
    bc.description as category_description,
    sbc.is_primary
  FROM public.studio_business_categories sbc
  JOIN public.business_categories bc ON bc.id = sbc.business_category_id
  WHERE sbc.studio_id = get_studio_categories.studio_id
  ORDER BY sbc.is_primary DESC, bc.name;
$$;

CREATE OR REPLACE FUNCTION public.get_user_studios()
RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.name, s.description, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  FROM public.studios s
  WHERE 
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.studio_id = s.id
    );
$$;

CREATE OR REPLACE FUNCTION public.get_studio_by_id(studio_id uuid)
RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_studio_data(studio_id uuid, studio_name text DEFAULT NULL::text, studio_website text DEFAULT NULL::text, studio_description text DEFAULT NULL::text, studio_phone text DEFAULT NULL::text, studio_email text DEFAULT NULL::text, studio_timezone text DEFAULT NULL::text)
RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid, _studio_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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
      WHEN 'freelancer' THEN 5
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role, _studio_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_studio(_user_id uuid, _studio_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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
  );
$$;

CREATE OR REPLACE FUNCTION public.create_studio_with_data(p_studio_name text, p_studio_website text DEFAULT NULL::text, p_studio_business_category_id uuid DEFAULT NULL::uuid, p_studio_description text DEFAULT NULL::text, p_studio_phone text DEFAULT NULL::text, p_studio_email text DEFAULT NULL::text, p_studio_timezone text DEFAULT 'UTC'::text, p_additional_category_ids uuid[] DEFAULT NULL::uuid[])
RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;