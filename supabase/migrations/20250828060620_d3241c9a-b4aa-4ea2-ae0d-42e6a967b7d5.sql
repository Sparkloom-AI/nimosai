-- Create junction table for studio business categories (many-to-many)
CREATE TABLE public.studio_business_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL,
  business_category_id uuid NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT studio_business_categories_pkey PRIMARY KEY (id),
  CONSTRAINT studio_business_categories_studio_id_fkey FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE,
  CONSTRAINT studio_business_categories_business_category_id_fkey FOREIGN KEY (business_category_id) REFERENCES public.business_categories(id) ON DELETE CASCADE,
  CONSTRAINT studio_business_categories_unique UNIQUE (studio_id, business_category_id)
);

-- Enable RLS
ALTER TABLE public.studio_business_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for studio business categories
CREATE POLICY "Role-based studio business categories access" 
ON public.studio_business_categories 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id)
);

-- Create index for better performance
CREATE INDEX idx_studio_business_categories_studio_id ON public.studio_business_categories(studio_id);
CREATE INDEX idx_studio_business_categories_business_category_id ON public.studio_business_categories(business_category_id);

-- Update create_studio_with_data function to handle multiple categories
CREATE OR REPLACE FUNCTION public.create_studio_with_data(
  studio_name text, 
  studio_website text DEFAULT NULL::text, 
  studio_business_category_id uuid DEFAULT NULL::uuid, 
  studio_description text DEFAULT NULL::text, 
  studio_phone text DEFAULT NULL::text, 
  studio_email text DEFAULT NULL::text, 
  studio_timezone text DEFAULT 'UTC'::text,
  additional_category_ids uuid[] DEFAULT NULL::uuid[]
)
RETURNS TABLE(id uuid, name text, description text, business_category_id uuid, phone text, email text, website text, timezone text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_studio_id uuid;
  studio_record RECORD;
  default_category_id uuid;
  category_id uuid;
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

  -- Insert primary category into junction table
  INSERT INTO public.studio_business_categories (studio_id, business_category_id, is_primary)
  VALUES (new_studio_id, studio_business_category_id, true);

  -- Insert additional categories into junction table
  IF additional_category_ids IS NOT NULL THEN
    FOREACH category_id IN ARRAY additional_category_ids
    LOOP
      -- Only insert if it's not the primary category
      IF category_id != studio_business_category_id THEN
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
$$;

-- Create function to get all categories for a studio
CREATE OR REPLACE FUNCTION public.get_studio_categories(studio_id uuid)
RETURNS TABLE(
  category_id uuid, 
  category_name text, 
  category_description text, 
  is_primary boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
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