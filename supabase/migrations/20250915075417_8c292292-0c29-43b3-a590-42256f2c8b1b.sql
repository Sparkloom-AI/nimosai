-- Add profile_setup_complete column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_setup_complete boolean NOT NULL DEFAULT false;