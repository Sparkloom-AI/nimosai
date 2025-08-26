
-- Create the studios table
CREATE TABLE IF NOT EXISTS public.studios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  business_category text NOT NULL DEFAULT 'General',
  phone text,
  email text,
  website text,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create the business_categories table
CREATE TABLE IF NOT EXISTS public.business_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default business categories
INSERT INTO public.business_categories (name, description) VALUES
  ('Hair Salon', 'Hair cutting, styling, and coloring services'),
  ('Nail Salon', 'Manicure, pedicure, and nail art services'),
  ('Beauty Salon', 'Facial treatments, makeup, and beauty services'),
  ('Spa', 'Relaxation and wellness treatments'),
  ('Barbershop', 'Traditional barbering and grooming services'),
  ('Massage Therapy', 'Therapeutic and relaxation massage services'),
  ('Fitness Studio', 'Personal training and fitness classes'),
  ('Yoga Studio', 'Yoga classes and mindfulness practices'),
  ('Wellness Center', 'Holistic health and wellness services'),
  ('Medical Spa', 'Medical aesthetic treatments'),
  ('Tattoo & Piercing', 'Body art and piercing services'),
  ('General', 'General business services')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on studios table
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

-- Enable RLS on business_categories table
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for studios table
CREATE POLICY "Users can view studios they have access to" ON public.studios
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND studio_id = studios.id
    )
  );

CREATE POLICY "Studio owners and super admins can manage studios" ON public.studios
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'studio_owner'::app_role, studios.id)
  );

-- RLS policies for business_categories table (read-only for all authenticated users)
CREATE POLICY "Anyone can view business categories" ON public.business_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only super admins can manage business categories" ON public.business_categories
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add updated_at trigger for studios
CREATE TRIGGER update_studios_updated_at
  BEFORE UPDATE ON public.studios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for business_categories
CREATE TRIGGER update_business_categories_updated_at
  BEFORE UPDATE ON public.business_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get user studios
CREATE OR REPLACE FUNCTION public.get_user_studios()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  business_category text,
  phone text,
  email text,
  website text,
  timezone text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  FROM public.studios s
  WHERE 
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.studio_id = s.id
    );
$$;

-- Function to get studio by ID
CREATE OR REPLACE FUNCTION public.get_studio_by_id(studio_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  business_category text,
  phone text,
  email text,
  website text,
  timezone text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
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

-- Function to create studio with data and assign owner role
CREATE OR REPLACE FUNCTION public.create_studio_with_data(
  studio_name text,
  studio_website text DEFAULT NULL,
  studio_business_category text DEFAULT 'General',
  studio_description text DEFAULT NULL,
  studio_phone text DEFAULT NULL,
  studio_email text DEFAULT NULL,
  studio_timezone text DEFAULT 'UTC'
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  business_category text,
  phone text,
  email text,
  website text,
  timezone text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_studio_id uuid;
  studio_record RECORD;
BEGIN
  -- Insert the new studio
  INSERT INTO public.studios (name, website, business_category, description, phone, email, timezone)
  VALUES (studio_name, studio_website, studio_business_category, studio_description, studio_phone, studio_email, studio_timezone)
  RETURNING studios.id INTO new_studio_id;

  -- Assign the studio_owner role to the current user
  INSERT INTO public.user_roles (user_id, role, studio_id)
  VALUES (auth.uid(), 'studio_owner'::app_role, new_studio_id);

  -- Return the created studio
  SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = new_studio_id;

  RETURN QUERY SELECT studio_record.id, studio_record.name, studio_record.description, studio_record.business_category, studio_record.phone, studio_record.email, studio_record.website, studio_record.timezone, studio_record.created_at, studio_record.updated_at;
END;
$$;

-- Function to update studio data
CREATE OR REPLACE FUNCTION public.update_studio_data(
  studio_id uuid,
  studio_name text DEFAULT NULL,
  studio_website text DEFAULT NULL,
  studio_business_category text DEFAULT NULL,
  studio_description text DEFAULT NULL,
  studio_phone text DEFAULT NULL,
  studio_email text DEFAULT NULL,
  studio_timezone text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  business_category text,
  phone text,
  email text,
  website text,
  timezone text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
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
    business_category = COALESCE(studio_business_category, studios.business_category),
    description = COALESCE(studio_description, studios.description),
    phone = COALESCE(studio_phone, studios.phone),
    email = COALESCE(studio_email, studios.email),
    timezone = COALESCE(studio_timezone, studios.timezone),
    updated_at = now()
  WHERE studios.id = studio_id;

  -- Return the updated studio
  SELECT s.id, s.name, s.description, s.business_category, s.phone, s.email, s.website, s.timezone, s.created_at, s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = studio_id;

  RETURN QUERY SELECT studio_record.id, studio_record.name, studio_record.description, studio_record.business_category, studio_record.phone, studio_record.email, studio_record.website, studio_record.timezone, studio_record.created_at, studio_record.updated_at;
END;
$$;
