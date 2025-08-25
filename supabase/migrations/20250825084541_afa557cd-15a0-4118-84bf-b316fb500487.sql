
-- Function to create a studio with data
CREATE OR REPLACE FUNCTION public.create_studio_with_data(
  studio_name TEXT,
  studio_website TEXT DEFAULT NULL,
  studio_business_category TEXT,
  studio_description TEXT DEFAULT NULL,
  studio_phone TEXT DEFAULT NULL,
  studio_email TEXT DEFAULT NULL,
  studio_timezone TEXT DEFAULT 'UTC'
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  business_category TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_studio public.studios%ROWTYPE;
BEGIN
  -- Insert the new studio
  INSERT INTO public.studios (
    name, website, business_category, description, phone, email, timezone
  ) VALUES (
    studio_name, studio_website, studio_business_category, 
    studio_description, studio_phone, studio_email, studio_timezone
  )
  RETURNING * INTO new_studio;
  
  -- Return the studio data
  RETURN QUERY SELECT 
    new_studio.id,
    new_studio.name,
    new_studio.description,
    new_studio.business_category,
    new_studio.phone,
    new_studio.email,
    new_studio.website,
    new_studio.timezone,
    new_studio.created_at,
    new_studio.updated_at;
END;
$$;

-- Function to get user's studios
CREATE OR REPLACE FUNCTION public.get_user_studios()
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  business_category TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    s.id,
    s.name,
    s.description,
    s.business_category,
    s.phone,
    s.email,
    s.website,
    s.timezone,
    s.created_at,
    s.updated_at
  FROM public.studios s
  INNER JOIN public.user_roles ur ON ur.studio_id = s.id
  WHERE ur.user_id = auth.uid()
  ORDER BY s.created_at DESC;
END;
$$;

-- Function to get a studio by ID
CREATE OR REPLACE FUNCTION public.get_studio_by_id(studio_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  business_category TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    s.id,
    s.name,
    s.description,
    s.business_category,
    s.phone,
    s.email,
    s.website,
    s.timezone,
    s.created_at,
    s.updated_at
  FROM public.studios s
  INNER JOIN public.user_roles ur ON ur.studio_id = s.id
  WHERE s.id = studio_id 
    AND ur.user_id = auth.uid()
  LIMIT 1;
END;
$$;

-- Function to update studio data
CREATE OR REPLACE FUNCTION public.update_studio_data(
  studio_id UUID,
  studio_name TEXT DEFAULT NULL,
  studio_website TEXT DEFAULT NULL,
  studio_business_category TEXT DEFAULT NULL,
  studio_description TEXT DEFAULT NULL,
  studio_phone TEXT DEFAULT NULL,
  studio_email TEXT DEFAULT NULL,
  studio_timezone TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  business_category TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_studio public.studios%ROWTYPE;
BEGIN
  -- Check if user has permission to update this studio
  IF NOT (
    SELECT public.can_manage_studio(auth.uid(), studio_id)
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to update studio';
  END IF;
  
  -- Update the studio
  UPDATE public.studios
  SET 
    name = COALESCE(studio_name, studios.name),
    website = COALESCE(studio_website, studios.website),
    business_category = COALESCE(studio_business_category, studios.business_category),
    description = COALESCE(studio_description, studios.description),
    phone = COALESCE(studio_phone, studios.phone),
    email = COALESCE(studio_email, studios.email),
    timezone = COALESCE(studio_timezone, studios.timezone),
    updated_at = now()
  WHERE studios.id = studio_id
  RETURNING * INTO updated_studio;
  
  -- Return the updated studio data
  RETURN QUERY SELECT 
    updated_studio.id,
    updated_studio.name,
    updated_studio.description,
    updated_studio.business_category,
    updated_studio.phone,
    updated_studio.email,
    updated_studio.website,
    updated_studio.timezone,
    updated_studio.created_at,
    updated_studio.updated_at;
END;
$$;
