-- Create a temporary column to store the converted category
ALTER TABLE public.services ADD COLUMN category_temp TEXT;

-- Convert existing array categories to single string (take first element)
UPDATE public.services 
SET category_temp = 
  CASE 
    WHEN category IS NOT NULL AND array_length(category, 1) > 0 
    THEN category[1]::text
    ELSE 'General'
  END;

-- Drop the old array column
ALTER TABLE public.services DROP COLUMN category;

-- Rename the temp column to category
ALTER TABLE public.services RENAME COLUMN category_temp TO category;

-- Set default value and not null constraint
ALTER TABLE public.services ALTER COLUMN category SET DEFAULT 'General';
ALTER TABLE public.services ALTER COLUMN category SET NOT NULL;