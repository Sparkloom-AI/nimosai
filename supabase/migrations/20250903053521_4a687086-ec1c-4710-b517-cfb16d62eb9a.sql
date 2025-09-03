-- Add account_setup_complete flag and rename onboarding_complete to studio_setup_complete
ALTER TABLE public.profiles 
ADD COLUMN account_setup_complete boolean NOT NULL DEFAULT false;

-- Update the handle_new_user function to initialize both flags
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    language,
    account_setup_complete,
    onboarding_complete
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
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'en'),
    false, -- account_setup_complete
    false  -- onboarding_complete (studio_setup_complete)
  );
  RETURN NEW;
END;
$$;