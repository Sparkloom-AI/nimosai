-- Drop and recreate functions with new studio fields
DROP FUNCTION IF EXISTS public.get_user_studios();
DROP FUNCTION IF EXISTS public.get_studio_by_id(uuid);
DROP FUNCTION IF EXISTS public.update_studio_data(uuid, text, text, text, text, text, text);

-- Create updated functions
CREATE OR REPLACE FUNCTION public.get_user_studios()
 RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, country text, currency text, tax_included boolean, default_team_language text, default_client_language text, facebook_url text, instagram_url text, twitter_url text, linkedin_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT s.id, s.name, s.description, s.phone, s.email, s.website, s.timezone, s.country, s.currency, s.tax_included, s.default_team_language, s.default_client_language, s.facebook_url, s.instagram_url, s.twitter_url, s.linkedin_url, s.created_at, s.updated_at
  FROM public.studios s
  WHERE 
    has_role(auth.uid(), 'super_admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.studio_id = s.id
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_studio_by_id(studio_id uuid)
 RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, country text, currency text, tax_included boolean, default_team_language text, default_client_language text, facebook_url text, instagram_url text, twitter_url text, linkedin_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT s.id, s.name, s.description, s.phone, s.email, s.website, s.timezone, s.country, s.currency, s.tax_included, s.default_team_language, s.default_client_language, s.facebook_url, s.instagram_url, s.twitter_url, s.linkedin_url, s.created_at, s.updated_at
  FROM public.studios s
  WHERE s.id = studio_id
    AND (
      has_role(auth.uid(), 'super_admin'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.studio_id = s.id
      )
    );
$function$;