-- Clean up orphaned team members first
DELETE FROM team_member_addresses WHERE team_member_id IN (
  SELECT tm.id FROM team_members tm 
  LEFT JOIN studios s ON tm.studio_id = s.id 
  WHERE s.id IS NULL
);

DELETE FROM team_member_emergency_contacts WHERE team_member_id IN (
  SELECT tm.id FROM team_members tm 
  LEFT JOIN studios s ON tm.studio_id = s.id 
  WHERE s.id IS NULL
);

DELETE FROM team_member_services WHERE team_member_id IN (
  SELECT tm.id FROM team_members tm 
  LEFT JOIN studios s ON tm.studio_id = s.id 
  WHERE s.id IS NULL
);

DELETE FROM team_member_locations WHERE team_member_id IN (
  SELECT tm.id FROM team_members tm 
  LEFT JOIN studios s ON tm.studio_id = s.id 
  WHERE s.id IS NULL
);

DELETE FROM team_shifts WHERE team_member_id IN (
  SELECT tm.id FROM team_members tm 
  LEFT JOIN studios s ON tm.studio_id = s.id 
  WHERE s.id IS NULL
);

DELETE FROM team_members WHERE studio_id NOT IN (SELECT id FROM studios);

-- Add missing columns to locations table
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'US',
ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Create additional useful enums
DO $$ BEGIN
    CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.address_type AS ENUM ('home', 'work', 'mailing', 'emergency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.service_category AS ENUM ('haircut', 'color', 'styling', 'treatment', 'nails', 'skincare', 'massage', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraints (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE public.locations
    ADD CONSTRAINT fk_locations_studio_id 
    FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.services
    ADD CONSTRAINT fk_services_studio_id 
    FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.team_members
    ADD CONSTRAINT fk_team_members_studio_id 
    FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add update triggers only if they don't exist
DO $$ BEGIN
    CREATE TRIGGER update_locations_updated_at
        BEFORE UPDATE ON public.locations
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_locations_studio_id ON public.locations(studio_id);
CREATE INDEX IF NOT EXISTS idx_services_studio_id ON public.services(studio_id);
CREATE INDEX IF NOT EXISTS idx_team_members_studio_id ON public.team_members(studio_id);

-- Add unique constraint for primary locations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_primary_location_per_studio 
ON public.locations(studio_id) 
WHERE is_primary = true;