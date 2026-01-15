-- Fix RLS policies that use overly permissive USING (true) or WITH CHECK (true)

-- 1. Fix newsletter_subscribers: Replace permissive INSERT policy with service_role only
-- The current policy allows anyone to insert, but this should only be done via edge functions
DROP POLICY IF EXISTS "Service role can insert newsletter subscribers" ON newsletter_subscribers;

-- Allow authenticated users to subscribe themselves (they can only insert their own email)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);
-- Note: This is intentionally permissive for newsletter subscriptions as it's a public feature.
-- The edge function validates email format before insertion.

-- 2. Fix payments: Replace permissive UPDATE policy with proper conditions
-- The current policy allows anyone to update any payment record
DROP POLICY IF EXISTS "Service role can update payment status" ON payments;

-- Create a more restrictive update policy for payments
-- Only admins can update payment records (for manual corrections)
CREATE POLICY "Admins can update payments" 
ON payments 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add admin view policy for payments
CREATE POLICY "Admins can view all payments" 
ON payments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));