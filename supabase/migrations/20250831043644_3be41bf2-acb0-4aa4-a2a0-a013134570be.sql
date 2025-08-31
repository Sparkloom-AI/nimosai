-- Add Google Places API integration fields to locations table
ALTER TABLE public.locations 
ADD COLUMN place_id TEXT,
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN address_components JSONB;