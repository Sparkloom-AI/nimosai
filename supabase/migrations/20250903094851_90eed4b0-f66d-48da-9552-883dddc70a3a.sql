-- Fix critical security vulnerability: Restrict freelancer appointment access
-- Freelancers should only see appointments where they are the assigned team member

-- Drop existing policy
DROP POLICY "Role-based appointments access" ON public.appointments;

-- Create new secure policy with proper freelancer restrictions
CREATE POLICY "Secure role-based appointments access" 
ON public.appointments
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  can_manage_studio(auth.uid(), studio_id) OR
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR
  (
    has_role(auth.uid(), 'freelancer'::app_role, studio_id) AND
    team_member_id IN (
      SELECT tm.id 
      FROM public.team_members tm 
      JOIN public.profiles p ON p.email = tm.email 
      WHERE p.id = auth.uid() AND tm.studio_id = appointments.studio_id
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  can_manage_studio(auth.uid(), studio_id) OR
  has_role(auth.uid(), 'staff'::app_role, studio_id) OR
  (
    has_role(auth.uid(), 'freelancer'::app_role, studio_id) AND
    team_member_id IN (
      SELECT tm.id 
      FROM public.team_members tm 
      JOIN public.profiles p ON p.email = tm.email 
      WHERE p.id = auth.uid() AND tm.studio_id = appointments.studio_id
    )
  )
);

-- Also secure the appointment_history table with the same logic
DROP POLICY "Role-based appointment history access" ON public.appointment_history;

CREATE POLICY "Secure role-based appointment history access" 
ON public.appointment_history
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  EXISTS (
    SELECT 1 
    FROM public.appointments a 
    WHERE a.id = appointment_history.appointment_id 
    AND (
      can_manage_studio(auth.uid(), a.studio_id) OR
      has_role(auth.uid(), 'staff'::app_role, a.studio_id) OR
      (
        has_role(auth.uid(), 'freelancer'::app_role, a.studio_id) AND
        a.team_member_id IN (
          SELECT tm.id 
          FROM public.team_members tm 
          JOIN public.profiles p ON p.email = tm.email 
          WHERE p.id = auth.uid() AND tm.studio_id = a.studio_id
        )
      )
    )
  )
);