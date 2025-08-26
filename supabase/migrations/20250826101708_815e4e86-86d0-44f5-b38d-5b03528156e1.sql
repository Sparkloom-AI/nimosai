-- Fix foreign key constraint for team_members.studio_id
-- Drop the incorrect foreign key constraint that references profiles
ALTER TABLE public.team_members 
DROP CONSTRAINT IF EXISTS team_members_studio_id_fkey;

-- Add the correct foreign key constraint that references studios
ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_studio_id_fkey 
FOREIGN KEY (studio_id) REFERENCES public.studios(id) ON DELETE CASCADE;