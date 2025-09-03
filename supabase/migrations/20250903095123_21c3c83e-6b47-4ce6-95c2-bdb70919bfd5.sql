-- Fix critical security vulnerability: Restrict access to employee home addresses
-- Staff and freelancers should NOT see other team members' home addresses

-- Drop existing vulnerable policy
DROP POLICY "Role-based team member addresses access" ON public.team_member_addresses;

-- Create secure policy that protects employee privacy and safety
CREATE POLICY "Secure team member addresses access" 
ON public.team_member_addresses
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (
    SELECT 1 
    FROM public.team_members tm 
    WHERE tm.id = team_member_addresses.team_member_id 
    AND (
      -- Studio owners and managers can access for business purposes
      can_manage_studio(auth.uid(), tm.studio_id) OR
      -- Employees can access their own addresses
      EXISTS (
        SELECT 1 
        FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.email = tm.email
      )
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (
    SELECT 1 
    FROM public.team_members tm 
    WHERE tm.id = team_member_addresses.team_member_id 
    AND (
      -- Studio owners and managers can modify for business purposes
      can_manage_studio(auth.uid(), tm.studio_id) OR
      -- Employees can modify their own addresses
      EXISTS (
        SELECT 1 
        FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.email = tm.email
      )
    )
  )
);

-- Also secure emergency contacts with the same logic for consistency
DROP POLICY "Role-based emergency contacts access" ON public.team_member_emergency_contacts;

CREATE POLICY "Secure emergency contacts access" 
ON public.team_member_emergency_contacts
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (
    SELECT 1 
    FROM public.team_members tm 
    WHERE tm.id = team_member_emergency_contacts.team_member_id 
    AND (
      -- Studio owners and managers can access for emergency purposes
      can_manage_studio(auth.uid(), tm.studio_id) OR
      -- Employees can access their own emergency contacts
      EXISTS (
        SELECT 1 
        FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.email = tm.email
      )
    )
  )
);