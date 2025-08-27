
-- Add location fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN country text,
ADD COLUMN country_code text,
ADD COLUMN timezone text,
ADD COLUMN phone_prefix text,
ADD COLUMN currency text,
ADD COLUMN language text;
