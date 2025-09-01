-- Fix business categories RLS policy to allow authenticated users to view categories during onboarding
DROP POLICY IF EXISTS "Business categories viewable by studio members" ON public.business_categories;

CREATE POLICY "Business categories viewable by authenticated users" 
ON public.business_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep the existing policy for other operations unchanged
-- Only super admins can manage business categories remains the same