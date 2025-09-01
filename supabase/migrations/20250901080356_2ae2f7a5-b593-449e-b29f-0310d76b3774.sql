-- First drop the existing policy and recreate it with correct permissions
DROP POLICY IF EXISTS "Business categories viewable by authenticated users" ON public.business_categories;
DROP POLICY IF EXISTS "Business categories viewable by studio members" ON public.business_categories;

-- Create a policy that allows any authenticated user to view business categories (for onboarding)
CREATE POLICY "Business categories viewable by authenticated users" 
ON public.business_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);