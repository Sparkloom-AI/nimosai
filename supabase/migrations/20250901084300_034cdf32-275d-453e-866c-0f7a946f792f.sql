-- Complete rewrite of create_studio_with_data function to fix column ambiguity and improve reliability
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
  default_category_id uuid;
  category_id uuid;
  user_profile_name text;
  user_profile_email text;
  current_user_id uuid;
  user_exists boolean;
  retry_count integer := 0;
  max_retries integer := 5;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Validate user authentication
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated. Please ensure you are logged in.';
  END IF;

  -- Check if the current user exists in auth.users with retry logic
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM auth.users WHERE id = current_user_id
    ) INTO user_exists;
    
    IF user_exists OR retry_count >= max_retries THEN
      EXIT;
    END IF;
    
    retry_count := retry_count + 1;
    RAISE NOTICE 'User not found in auth.users, retry % of %', retry_count, max_retries;
    PERFORM pg_sleep(0.2);
  END LOOP;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User does not exist in auth.users table after % retries. Please ensure user is properly authenticated.', max_retries;
  END IF;

  -- Get default category ID if none provided (using 'Other' as default)
  IF p_studio_business_category_id IS NULL THEN
    SELECT business_categories.id INTO default_category_id 
    FROM public.business_categories 
    WHERE business_categories.name = 'Other' 
    LIMIT 1;
    p_studio_business_category_id := default_category_id;
  END IF;

  -- Begin transaction block
  BEGIN
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

    RAISE NOTICE 'Studio created with ID: %', new_studio_id;

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
    VALUES (current_user_id, 'studio_owner'::app_role, new_studio_id);

    RAISE NOTICE 'Studio owner role assigned to user: %', current_user_id;

    -- Get user profile information for creating team member record
    SELECT profiles.full_name, profiles.email 
    INTO user_profile_name, user_profile_email
    FROM public.profiles 
    WHERE profiles.id = current_user_id;

    -- Create a team member record for the studio owner with high permissions
    INSERT INTO public.team_members (
      studio_id,
      first_name,
      last_name,
      email,
      job_title,
      permission_level,
      employment_type,
      is_bookable,
      calendar_color,
      start_date
    )
    VALUES (
      new_studio_id,
      COALESCE(split_part(user_profile_name, ' ', 1), 'Studio'),
      COALESCE(split_part(user_profile_name, ' ', 2), 'Owner'),
      user_profile_email,
      'Studio Owner',
      'high'::permission_level,
      'full_time'::employment_type,
      true,
      '#2ECC71', -- Emerald green from brand colors
      CURRENT_DATE
    );

    RAISE NOTICE 'Team member record created for studio owner';

  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error during studio creation: %', SQLERRM;
  END;

  -- Return the created studio directly from the table to avoid ambiguity
  RETURN QUERY 
  SELECT 
    studios.id, 
    studios.name, 
    studios.description, 
    studios.phone, 
    studios.email, 
    studios.website, 
    studios.timezone, 
    studios.country, 
    studios.currency, 
    studios.tax_included, 
    studios.default_team_language, 
    studios.default_client_language, 
    studios.facebook_url, 
    studios.instagram_url, 
    studios.twitter_url, 
    studios.linkedin_url, 
    studios.created_at, 
    studios.updated_at
  FROM public.studios
  WHERE studios.id = new_studio_id;
END;
$function$;