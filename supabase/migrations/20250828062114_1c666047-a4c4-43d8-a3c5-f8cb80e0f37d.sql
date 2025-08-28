-- First, find and update studios that reference categories we want to delete
-- Update any studios referencing 'Wellness Center' or 'Yoga Studio' to use 'Other'
DO $$
DECLARE
    other_category_id uuid;
    wellness_category_id uuid;
    yoga_category_id uuid;
BEGIN
    -- Get the 'General' category ID (we'll change this to 'Other' later)
    SELECT id INTO other_category_id FROM public.business_categories WHERE name = 'General';
    
    -- Get the categories we want to delete
    SELECT id INTO wellness_category_id FROM public.business_categories WHERE name = 'Wellness Center';
    SELECT id INTO yoga_category_id FROM public.business_categories WHERE name = 'Yoga Studio';
    
    -- Update studios that reference 'Wellness Center' to use 'General'
    IF wellness_category_id IS NOT NULL THEN
        UPDATE public.studios 
        SET business_category_id = other_category_id 
        WHERE business_category_id = wellness_category_id;
        
        -- Also update studio_business_categories junction table
        UPDATE public.studio_business_categories 
        SET business_category_id = other_category_id 
        WHERE business_category_id = wellness_category_id;
    END IF;
    
    -- Update studios that reference 'Yoga Studio' to use 'General'
    IF yoga_category_id IS NOT NULL THEN
        UPDATE public.studios 
        SET business_category_id = other_category_id 
        WHERE business_category_id = yoga_category_id;
        
        -- Also update studio_business_categories junction table
        UPDATE public.studio_business_categories 
        SET business_category_id = other_category_id 
        WHERE business_category_id = yoga_category_id;
    END IF;
END $$;

-- Now update existing business categories to match the new interface
UPDATE public.business_categories SET name = 'Nails' WHERE name = 'Nail Salon';
UPDATE public.business_categories SET name = 'Barber' WHERE name = 'Barbershop';
UPDATE public.business_categories SET name = 'Medspa' WHERE name = 'Medical Spa';
UPDATE public.business_categories SET name = 'Massage' WHERE name = 'Massage Therapy';
UPDATE public.business_categories SET name = 'Spa & sauna' WHERE name = 'Spa';
UPDATE public.business_categories SET name = 'Tattooing & piercing' WHERE name = 'Tattoo & Piercing';
UPDATE public.business_categories SET name = 'Fitness & recovery' WHERE name = 'Fitness Studio';
UPDATE public.business_categories SET name = 'Other' WHERE name = 'General';

-- Add new categories that are missing
INSERT INTO public.business_categories (name, description) VALUES 
('Eyebrows & lashes', 'Eyebrow shaping, lash extensions, and related beauty services'),
('Waxing salon', 'Hair removal and waxing services'),
('Tanning studio', 'Tanning and bronzing services'),
('Physical therapy', 'Physical rehabilitation and therapy services'),
('Health practice', 'General health and medical practice services'),
('Pet grooming', 'Pet care and grooming services');

-- Now safe to remove unused categories
DELETE FROM public.business_categories WHERE name IN ('Wellness Center', 'Yoga Studio');

-- Update the default category reference in the function to use 'Other' instead of 'General'
DROP FUNCTION IF EXISTS public.create_studio_with_data(text,text,uuid,text,text,text,text,uuid[]);

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
  -- Get default category ID if none provided (now using 'Other' instead of 'General')
  IF p_studio_business_category_id IS NULL THEN
    SELECT bc.id INTO default_category_id 
    FROM public.business_categories bc 
    WHERE bc.name = 'Other' 
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