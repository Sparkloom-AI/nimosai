-- Fix create_studio_with_data function to return all studio fields
CREATE OR REPLACE FUNCTION public.create_studio_with_data(
  p_studio_name text, 
  p_studio_website text DEFAULT NULL, 
  p_studio_business_category_id uuid DEFAULT NULL, 
  p_studio_description text DEFAULT NULL, 
  p_studio_phone text DEFAULT NULL, 
  p_studio_email text DEFAULT NULL, 
  p_studio_timezone text DEFAULT 'UTC', 
  p_additional_category_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  id uuid, 
  name text, 
  description text, 
  phone text, 
  email text, 
  website text, 
  timezone text, 
  country text, 
  currency text, 
  tax_included boolean, 
  default_team_language text, 
  default_client_language text, 
  facebook_url text, 
  instagram_url text, 
  twitter_url text, 
  linkedin_url text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

  -- Insert the new studio with all default values
  INSERT INTO public.studios (
    name, 
    website, 
    description, 
    phone, 
    email, 
    timezone,
    country,
    currency,
    tax_included,
    default_team_language,
    default_client_language
  )
  VALUES (
    p_studio_name, 
    p_studio_website, 
    p_studio_description, 
    p_studio_phone, 
    p_studio_email, 
    p_studio_timezone,
    'US',
    'USD',
    true,
    'en',
    'en'
  )
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

  -- Return the created studio with all fields
  SELECT 
    s.id, 
    s.name, 
    s.description, 
    s.phone, 
    s.email, 
    s.website, 
    s.timezone, 
    s.country, 
    s.currency, 
    s.tax_included, 
    s.default_team_language, 
    s.default_client_language, 
    s.facebook_url, 
    s.instagram_url, 
    s.twitter_url, 
    s.linkedin_url, 
    s.created_at, 
    s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = new_studio_id;

  RETURN QUERY SELECT 
    studio_record.id, 
    studio_record.name, 
    studio_record.description, 
    studio_record.phone, 
    studio_record.email, 
    studio_record.website, 
    studio_record.timezone, 
    studio_record.country, 
    studio_record.currency, 
    studio_record.tax_included, 
    studio_record.default_team_language, 
    studio_record.default_client_language, 
    studio_record.facebook_url, 
    studio_record.instagram_url, 
    studio_record.twitter_url, 
    studio_record.linkedin_url, 
    studio_record.created_at, 
    studio_record.updated_at;
END;
$function$;