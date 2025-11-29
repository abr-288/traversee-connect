-- Fix 1: Remove overly permissive profiles policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Fix 2: Remove dangerous services insert policy that allows anyone to create services
DROP POLICY IF EXISTS "Users can create services for bookings" ON public.services;

-- Fix 3: Add policy for admins to view all profiles (for admin dashboard user management)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));