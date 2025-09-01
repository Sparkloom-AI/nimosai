-- Drop the existing function to avoid ambiguity
DROP FUNCTION IF EXISTS public.create_studio_with_data(text, text, uuid, text, text, text, text, uuid[]);

-- Create simplified function that returns only studio_id
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
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
      SELECT 1 FROM auth.users WHERE auth.users.id = current_user_id
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
    SELECT bc.id INTO default_category_id 
    FROM public.business_categories bc 
    WHERE bc.name = 'Other' 
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
    VALUES (new_studio_id, p_studio_business_category_id, true)
    ON CONFLICT (studio_id, business_category_id) DO NOTHING;

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
    VALUES (current_user_id, 'studio_owner'::app_role, new_studio_id)
    ON CONFLICT (user_id, studio_id) DO NOTHING;

    RAISE NOTICE 'Studio owner role assigned to user: %', current_user_id;

    -- Get user profile information for creating team member record
    SELECT p.full_name, p.email 
    INTO user_profile_name, user_profile_email
    FROM public.profiles p 
    WHERE p.id = current_user_id;

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

  -- Return the studio ID
  RETURN new_studio_id;
END;
$$;