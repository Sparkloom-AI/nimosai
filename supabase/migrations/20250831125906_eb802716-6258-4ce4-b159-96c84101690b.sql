-- Change services.category from text to text[] to support multiple categories
-- First, create a temporary column to store array data
ALTER TABLE public.services ADD COLUMN category_array text[];

-- Migrate existing single category values to arrays
UPDATE public.services 
SET category_array = CASE 
  WHEN category IS NOT NULL AND category != '' THEN ARRAY[category]
  ELSE ARRAY[]::text[]
END;

-- Drop the old column and rename the new one
ALTER TABLE public.services DROP COLUMN category;
ALTER TABLE public.services RENAME COLUMN category_array TO category;

-- Set default value for new services
ALTER TABLE public.services ALTER COLUMN category SET DEFAULT ARRAY[]::text[];