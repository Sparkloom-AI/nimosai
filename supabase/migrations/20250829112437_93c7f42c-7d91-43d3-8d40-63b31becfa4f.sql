-- Add new fields to studios table for settings
ALTER TABLE public.studios 
ADD COLUMN country text DEFAULT 'US',
ADD COLUMN currency text DEFAULT 'USD',
ADD COLUMN tax_included boolean DEFAULT true,
ADD COLUMN default_team_language text DEFAULT 'en',
ADD COLUMN default_client_language text DEFAULT 'en',
ADD COLUMN facebook_url text,
ADD COLUMN instagram_url text,
ADD COLUMN twitter_url text,
ADD COLUMN linkedin_url text;