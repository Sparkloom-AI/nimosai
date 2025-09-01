-- Convert category field from array to single string
-- First, update existing records to use the first category from the array
UPDATE public.services 
SET category = (
  CASE 
    WHEN category IS NOT NULL AND array_length(category, 1) > 0 
    THEN category[1]
    ELSE 'General'
  END
);

-- Drop the existing category column
ALTER TABLE public.services DROP COLUMN category;

-- Add new category column as text
ALTER TABLE public.services ADD COLUMN category TEXT DEFAULT 'General';

-- Update the new column with the converted values
UPDATE public.services 
SET category = 'General' 
WHERE category IS NULL;