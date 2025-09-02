-- Add Google Maps shortlink columns to locations table
ALTER TABLE public.locations 
ADD COLUMN google_maps_shortlink text,
ADD COLUMN shortlink_generated_at timestamp with time zone;

-- Add WhatsApp numbers to studios table
ALTER TABLE public.studios 
ADD COLUMN studio_manager_whatsapp text,
ADD COLUMN studio_owner_whatsapp text;

-- Create quick links settings table
CREATE TABLE public.quick_link_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_id uuid NOT NULL,
  auto_generate_maps_links boolean NOT NULL DEFAULT true,
  maps_link_refresh_days integer NOT NULL DEFAULT 90,
  whatsapp_link_template text DEFAULT 'Hello! I found your studio location and would like to get in touch.',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on quick_link_settings
ALTER TABLE public.quick_link_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for quick_link_settings
CREATE POLICY "Role-based quick link settings access" 
ON public.quick_link_settings 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  can_manage_studio(auth.uid(), studio_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_quick_link_settings_updated_at
  BEFORE UPDATE ON public.quick_link_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();