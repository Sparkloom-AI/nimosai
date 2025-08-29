-- Update database functions to include new studio fields
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

CREATE OR REPLACE FUNCTION public.update_studio_data(studio_id uuid, studio_name text DEFAULT NULL::text, studio_website text DEFAULT NULL::text, studio_description text DEFAULT NULL::text, studio_phone text DEFAULT NULL::text, studio_email text DEFAULT NULL::text, studio_timezone text DEFAULT NULL::text, studio_country text DEFAULT NULL::text, studio_currency text DEFAULT NULL::text, studio_tax_included boolean DEFAULT NULL::boolean, studio_default_team_language text DEFAULT NULL::text, studio_default_client_language text DEFAULT NULL::text, studio_facebook_url text DEFAULT NULL::text, studio_instagram_url text DEFAULT NULL::text, studio_twitter_url text DEFAULT NULL::text, studio_linkedin_url text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, name text, description text, phone text, email text, website text, timezone text, country text, currency text, tax_included boolean, default_team_language text, default_client_language text, facebook_url text, instagram_url text, twitter_url text, linkedin_url text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  studio_record RECORD;
BEGIN
  -- Check if user has permission to update this studio
  IF NOT (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'studio_owner'::app_role, studio_id)
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to update studio';
  END IF;

  -- Update the studio (only update fields that are not NULL)
  UPDATE public.studios 
  SET 
    name = COALESCE(studio_name, studios.name),
    website = COALESCE(studio_website, studios.website),
    description = COALESCE(studio_description, studios.description),
    phone = COALESCE(studio_phone, studios.phone),
    email = COALESCE(studio_email, studios.email),
    timezone = COALESCE(studio_timezone, studios.timezone),
    country = COALESCE(studio_country, studios.country),
    currency = COALESCE(studio_currency, studios.currency),
    tax_included = COALESCE(studio_tax_included, studios.tax_included),
    default_team_language = COALESCE(studio_default_team_language, studios.default_team_language),
    default_client_language = COALESCE(studio_default_client_language, studios.default_client_language),
    facebook_url = COALESCE(studio_facebook_url, studios.facebook_url),
    instagram_url = COALESCE(studio_instagram_url, studios.instagram_url),
    twitter_url = COALESCE(studio_twitter_url, studios.twitter_url),
    linkedin_url = COALESCE(studio_linkedin_url, studios.linkedin_url),
    updated_at = now()
  WHERE studios.id = studio_id;

  -- Return the updated studio
  SELECT s.id, s.name, s.description, s.phone, s.email, s.website, s.timezone, s.country, s.currency, s.tax_included, s.default_team_language, s.default_client_language, s.facebook_url, s.instagram_url, s.twitter_url, s.linkedin_url, s.created_at, s.updated_at
  INTO studio_record
  FROM public.studios s
  WHERE s.id = studio_id;

  RETURN QUERY SELECT studio_record.id, studio_record.name, studio_record.description, studio_record.phone, studio_record.email, studio_record.website, studio_record.timezone, studio_record.country, studio_record.currency, studio_record.tax_included, studio_record.default_team_language, studio_record.default_client_language, studio_record.facebook_url, studio_record.instagram_url, studio_record.twitter_url, studio_record.linkedin_url, studio_record.created_at, studio_record.updated_at;
END;
$function$;