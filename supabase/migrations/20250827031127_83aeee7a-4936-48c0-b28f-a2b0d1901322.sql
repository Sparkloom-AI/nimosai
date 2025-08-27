
-- Create a function to check if an email exists in profiles table
CREATE OR REPLACE FUNCTION public.check_email_exists(email_address text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE email = email_address
  );
$$;
