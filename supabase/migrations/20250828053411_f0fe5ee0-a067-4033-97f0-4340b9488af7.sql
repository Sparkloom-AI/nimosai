-- Phase 1: Fix Foreign Key Issues
-- Remove incorrect foreign key constraints that reference profiles instead of studios

-- Fix locations table foreign key issues
ALTER TABLE public.locations 
DROP CONSTRAINT IF EXISTS locations_studio_id_fkey;

-- Fix services table foreign key issues  
ALTER TABLE public.services
DROP CONSTRAINT IF EXISTS services_studio_id_fkey;

-- Fix team_members table duplicate foreign key
ALTER TABLE public.team_members
DROP CONSTRAINT IF EXISTS fk_team_members_studio_id;

-- Phase 2: Convert address_type to enum
-- First ensure all existing data uses valid enum values
UPDATE public.team_member_addresses 
SET address_type = 'home' 
WHERE address_type NOT IN ('home', 'work', 'mailing', 'emergency');

-- Convert the column to use the enum
ALTER TABLE public.team_member_addresses 
ALTER COLUMN address_type TYPE address_type USING address_type::address_type;

-- Phase 3: Convert business_category to foreign key
-- First ensure 'General' category exists in business_categories
INSERT INTO public.business_categories (name, description) 
VALUES ('General', 'General business category')
ON CONFLICT (name) DO NOTHING;

-- Add a temporary column for the foreign key
ALTER TABLE public.studios 
ADD COLUMN business_category_id uuid;

-- Update existing studios to reference the General category
UPDATE public.studios 
SET business_category_id = (
  SELECT id FROM public.business_categories 
  WHERE name = business_category
  LIMIT 1
);

-- Set default to General category for any that didn't match
UPDATE public.studios 
SET business_category_id = (
  SELECT id FROM public.business_categories 
  WHERE name = 'General'
  LIMIT 1
)
WHERE business_category_id IS NULL;

-- Make the new column NOT NULL and add foreign key constraint
ALTER TABLE public.studios 
ALTER COLUMN business_category_id SET NOT NULL;

ALTER TABLE public.studios 
ADD CONSTRAINT fk_studios_business_category 
FOREIGN KEY (business_category_id) REFERENCES public.business_categories(id);

-- Drop the old text column
ALTER TABLE public.studios 
DROP COLUMN business_category;

-- Rename the new column to business_category_id for clarity
-- (keeping _id suffix to indicate it's a foreign key)

-- Phase 4: Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_locations_studio_id ON public.locations(studio_id);
CREATE INDEX IF NOT EXISTS idx_services_studio_id ON public.services(studio_id);  
CREATE INDEX IF NOT EXISTS idx_team_members_studio_id ON public.team_members(studio_id);
CREATE INDEX IF NOT EXISTS idx_team_shifts_team_member_id ON public.team_shifts(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_shifts_location_id ON public.team_shifts(location_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_studio_id ON public.user_roles(studio_id);
CREATE INDEX IF NOT EXISTS idx_studios_business_category_id ON public.studios(business_category_id);

-- Phase 5: Add unique constraints for business logic
-- Ensure only one primary location per studio
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_studio_primary 
ON public.locations(studio_id) 
WHERE is_primary = true;

-- Ensure only one primary address per team member
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_member_addresses_primary 
ON public.team_member_addresses(team_member_id) 
WHERE is_primary = true;

-- Ensure only one primary emergency contact per team member  
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_member_emergency_contacts_primary
ON public.team_member_emergency_contacts(team_member_id)
WHERE is_primary = true;