
-- Create studios table
CREATE TABLE public.studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  business_category TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on studios table
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER update_studios_updated_at
  BEFORE UPDATE ON public.studios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS policies for studios
CREATE POLICY "Super admins can manage all studios" 
  ON public.studios 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Studio owners can manage their studios" 
  ON public.studios 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.studio_id = studios.id
        AND ur.role IN ('studio_owner', 'manager')
    )
  );

CREATE POLICY "Studio staff can view their studios" 
  ON public.studios 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.studio_id = studios.id
    )
  );

-- Add studio_id foreign key to existing tables that don't have it
ALTER TABLE public.team_members 
  ADD CONSTRAINT fk_team_members_studio 
  FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

ALTER TABLE public.services 
  ADD CONSTRAINT fk_services_studio 
  FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

ALTER TABLE public.locations 
  ADD CONSTRAINT fk_locations_studio 
  FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;

-- Create function to automatically assign studio owner role when studio is created
CREATE OR REPLACE FUNCTION public.assign_studio_owner_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert studio_owner role for the user who created the studio
  INSERT INTO public.user_roles (user_id, role, studio_id)
  VALUES (auth.uid(), 'studio_owner', NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign studio owner role
CREATE TRIGGER assign_studio_owner_after_insert
  AFTER INSERT ON public.studios
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_studio_owner_role();
