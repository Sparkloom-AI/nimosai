-- Add missing columns to locations table
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'US',
ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Create additional useful enums
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.address_type AS ENUM ('home', 'work', 'mailing', 'emergency');
CREATE TYPE public.service_category AS ENUM ('haircut', 'color', 'styling', 'treatment', 'nails', 'skincare', 'massage', 'other');

-- Add foreign key constraints for data integrity
ALTER TABLE public.locations
ADD CONSTRAINT fk_locations_studio_id 
FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

ALTER TABLE public.services
ADD CONSTRAINT fk_services_studio_id 
FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

ALTER TABLE public.team_members
ADD CONSTRAINT fk_team_members_studio_id 
FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

ALTER TABLE public.team_member_addresses
ADD CONSTRAINT fk_team_member_addresses_team_member_id 
FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;

ALTER TABLE public.team_member_emergency_contacts
ADD CONSTRAINT fk_team_member_emergency_contacts_team_member_id 
FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;

ALTER TABLE public.team_member_services
ADD CONSTRAINT fk_team_member_services_team_member_id 
FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_team_member_services_service_id 
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

ALTER TABLE public.team_member_locations
ADD CONSTRAINT fk_team_member_locations_team_member_id 
FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_team_member_locations_location_id 
FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;

ALTER TABLE public.team_shifts
ADD CONSTRAINT fk_team_shifts_team_member_id 
FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_team_shifts_location_id 
FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;

-- Add update triggers for automatic timestamp management
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create performance indexes on foreign key columns
CREATE INDEX IF NOT EXISTS idx_locations_studio_id ON public.locations(studio_id);
CREATE INDEX IF NOT EXISTS idx_services_studio_id ON public.services(studio_id);
CREATE INDEX IF NOT EXISTS idx_team_members_studio_id ON public.team_members(studio_id);
CREATE INDEX IF NOT EXISTS idx_team_member_addresses_team_member_id ON public.team_member_addresses(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_emergency_contacts_team_member_id ON public.team_member_emergency_contacts(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_services_team_member_id ON public.team_member_services(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_services_service_id ON public.team_member_services(service_id);
CREATE INDEX IF NOT EXISTS idx_team_member_locations_team_member_id ON public.team_member_locations(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_locations_location_id ON public.team_member_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_team_shifts_team_member_id ON public.team_shifts(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_shifts_location_id ON public.team_shifts(location_id);

-- Add unique constraints for primary locations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_primary_location_per_studio 
ON public.locations(studio_id) 
WHERE is_primary = true;