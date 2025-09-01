-- Create business_hours table for location-specific operating hours
CREATE TABLE public.business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME,
  end_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(location_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Role-based business hours access" 
ON public.business_hours 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.locations l
    WHERE l.id = business_hours.location_id 
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      can_manage_studio(auth.uid(), l.studio_id)
    )
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_business_hours_updated_at
  BEFORE UPDATE ON public.business_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update studios table to add TikTok and remove Twitter/LinkedIn
ALTER TABLE public.studios 
  ADD COLUMN tiktok_url TEXT,
  DROP COLUMN IF EXISTS twitter_url,
  DROP COLUMN IF EXISTS linkedin_url;