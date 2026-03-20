-- Allow authenticated users to create services for their bookings
CREATE POLICY "Users can create services for bookings"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK (true);