
-- Create enum for employment types
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contractor', 'intern');

-- Create enum for permission levels
CREATE TYPE permission_level AS ENUM ('low', 'medium', 'high');

-- Create enum for shift status
CREATE TYPE shift_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');

-- Create team_members table (renamed from staff)
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID REFERENCES public.profiles(id) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  job_title TEXT,
  calendar_color TEXT DEFAULT '#3B82F6',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  team_member_id TEXT,
  notes TEXT,
  is_bookable BOOLEAN NOT NULL DEFAULT true,
  permission_level permission_level NOT NULL DEFAULT 'low',
  hourly_rate DECIMAL(10,2),
  commission_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_member_addresses table
CREATE TABLE public.team_member_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  address_type TEXT NOT NULL DEFAULT 'home', -- home, work, other
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_member_emergency_contacts table
CREATE TABLE public.team_member_emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  contact_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table (if not exists)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create locations table (if not exists)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_member_services junction table
CREATE TABLE public.team_member_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  custom_price DECIMAL(10,2), -- optional custom pricing for this team member
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, service_id)
);

-- Create team_member_locations junction table
CREATE TABLE public.team_member_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_member_id, location_id)
);

-- Create team_shifts table
CREATE TABLE public.team_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status shift_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern TEXT, -- JSON string for recurring patterns
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Studio owners can manage their team members" 
  ON public.team_members 
  FOR ALL 
  USING (auth.uid() = studio_id);

-- RLS Policies for team_member_addresses
CREATE POLICY "Studio owners can manage team member addresses" 
  ON public.team_member_addresses 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE id = team_member_addresses.team_member_id 
      AND studio_id = auth.uid()
    )
  );

-- RLS Policies for team_member_emergency_contacts
CREATE POLICY "Studio owners can manage emergency contacts" 
  ON public.team_member_emergency_contacts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE id = team_member_emergency_contacts.team_member_id 
      AND studio_id = auth.uid()
    )
  );

-- RLS Policies for team_member_services
CREATE POLICY "Studio owners can manage team member services" 
  ON public.team_member_services 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE id = team_member_services.team_member_id 
      AND studio_id = auth.uid()
    )
  );

-- RLS Policies for team_member_locations
CREATE POLICY "Studio owners can manage team member locations" 
  ON public.team_member_locations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE id = team_member_locations.team_member_id 
      AND studio_id = auth.uid()
    )
  );

-- RLS Policies for team_shifts
CREATE POLICY "Studio owners can manage team shifts" 
  ON public.team_shifts 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE id = team_shifts.team_member_id 
      AND studio_id = auth.uid()
    )
  );

-- Enable RLS on services and locations if they don't have policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for services if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Studio owners can manage their services'
  ) THEN
    CREATE POLICY "Studio owners can manage their services" 
      ON public.services 
      FOR ALL 
      USING (auth.uid() = studio_id);
  END IF;
END $$;

-- Create policies for locations if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'locations' AND policyname = 'Studio owners can manage their locations'
  ) THEN
    CREATE POLICY "Studio owners can manage their locations" 
      ON public.locations 
      FOR ALL 
      USING (auth.uid() = studio_id);
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_team_shifts_updated_at BEFORE UPDATE ON public.team_shifts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
