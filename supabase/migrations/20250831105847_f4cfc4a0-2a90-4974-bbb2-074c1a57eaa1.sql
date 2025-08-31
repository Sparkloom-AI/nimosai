-- Create service_categories table for standardized categories
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on service_categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_categories
CREATE POLICY "Authenticated users can view service categories" 
ON public.service_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only super admins can manage service categories" 
ON public.service_categories 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add service_category_id to existing services table (nullable initially)
ALTER TABLE public.services 
ADD COLUMN service_category_id UUID REFERENCES public.service_categories(id);

-- Create index for performance
CREATE INDEX idx_services_category_id ON public.services(service_category_id);

-- Add trigger for updated_at on service_categories
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Populate service categories and services with comprehensive data
DO $$
DECLARE
    barbering_id UUID;
    tattoo_piercing_id UUID;
    nails_id UUID;
    medical_dental_id UUID;
    massage_id UUID;
    makeup_id UUID;
    injectables_fillers_id UUID;
    hair_styling_id UUID;
    hair_removal_id UUID;
    fitness_id UUID;
    facials_skincare_id UUID;
    eyebrows_eyelashes_id UUID;
    counseling_holistic_id UUID;
    vajacial_id UUID;
    body_id UUID;
BEGIN
    -- Insert Service Categories and capture their IDs
    INSERT INTO service_categories (name) VALUES ('Barbering') RETURNING id INTO barbering_id;
    INSERT INTO service_categories (name) VALUES ('Tattoo & Piercing') RETURNING id INTO tattoo_piercing_id;
    INSERT INTO service_categories (name) VALUES ('Nails') RETURNING id INTO nails_id;
    INSERT INTO service_categories (name) VALUES ('Medical & Dental') RETURNING id INTO medical_dental_id;
    INSERT INTO service_categories (name) VALUES ('Massage') RETURNING id INTO massage_id;
    INSERT INTO service_categories (name) VALUES ('Makeup') RETURNING id INTO makeup_id;
    INSERT INTO service_categories (name) VALUES ('Injectables & Fillers') RETURNING id INTO injectables_fillers_id;
    INSERT INTO service_categories (name) VALUES ('Hair & Styling') RETURNING id INTO hair_styling_id;
    INSERT INTO service_categories (name) VALUES ('Hair Removal') RETURNING id INTO hair_removal_id;
    INSERT INTO service_categories (name) VALUES ('Fitness') RETURNING id INTO fitness_id;
    INSERT INTO service_categories (name) VALUES ('Facials & Skincare') RETURNING id INTO facials_skincare_id;
    INSERT INTO service_categories (name) VALUES ('Eyebrows & Eyelashes') RETURNING id INTO eyebrows_eyelashes_id;
    INSERT INTO service_categories (name) VALUES ('Counseling & Holistic') RETURNING id INTO counseling_holistic_id;
    INSERT INTO service_categories (name) VALUES ('Vajacial') RETURNING id INTO vajacial_id;
    INSERT INTO service_categories (name) VALUES ('Body') RETURNING id INTO body_id;
END $$;