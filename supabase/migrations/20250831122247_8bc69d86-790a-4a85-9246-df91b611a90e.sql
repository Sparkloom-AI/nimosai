-- Drop the foreign key constraint if it exists and remove service_category_id column
ALTER TABLE services DROP COLUMN IF EXISTS service_category_id;

-- Drop the service_categories table entirely
DROP TABLE IF EXISTS service_categories CASCADE;