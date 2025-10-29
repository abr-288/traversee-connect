-- Add UPDATE policy for payments table to allow service role to update payment status
CREATE POLICY "Service role can update payment status"
ON public.payments
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);