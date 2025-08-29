-- Drop the existing function first
DROP FUNCTION public.create_studio_with_data(text,text,uuid,text,text,text,text,uuid[]);

-- Recreate with proper parameter names to avoid ambiguity
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
RETURNS TABLE(id uuid, name text, description text, business_category_id uuid, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_studio_id uuid;
  studio_record RECORD;
  default_category_id uuid;
  category_id uuid;
BEGIN
  -- Get default category ID if none provided
  IF p_studio_business_category_id IS NULL THEN
    SELECT bc.id INTO default_category_id 
    FROM public.business_categories bc 
    WHERE bc.name = 'General' 
    LIMIT 1;
    p_studio_business_category_id := default_category_id;
  END IF;

  -- Insert the new studio
  INSERT INTO public.studios (name, website, business_category_id, description, phone, email, timezone)
  VALUES (p_studio_name, p_studio_website, p_studio_business_category_id, p_studio_description, p_studio_phone, p_studio_email, p_studio_timezone)
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

  -- Return the created studio
  SELECT s.id, s.name, s.description, s.business_category_id, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = new_studio_id;

  RETURN QUERY SELECT studio_record.id, studio_record.name, studio_record.description, studio_record.business_category_id, studio_record.phone, studio_record.email, studio_record.website, studio_record.timezone, studio_record.created_at, studio_record.updated_at;
END;
$function$;