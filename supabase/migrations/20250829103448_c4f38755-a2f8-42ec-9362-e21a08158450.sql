-- Check if trigger exists and create handle_new_user function and trigger
-- This ensures profiles are automatically created for new users (including Google OAuth)

-- Create the function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    country,
    country_code,
    phone_prefix,
    timezone,
    currency,
    language
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'country', 'US'),
    COALESCE(NEW.raw_user_meta_data ->> 'country_code', 'US'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_prefix', '+1'),
    COALESCE(NEW.raw_user_meta_data ->> 'timezone', 'America/New_York'),
    COALESCE(NEW.raw_user_meta_data ->> 'currency', 'USD'),
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'en')
  );
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create profiles for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();