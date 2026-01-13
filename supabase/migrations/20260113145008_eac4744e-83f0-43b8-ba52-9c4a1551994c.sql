-- ============================================================
-- Flight Pre-Bookings Table
-- Implements mandatory pre-booking step with fare lock
-- ============================================================

-- Create booking status enum if not exists
DO $$ BEGIN
  CREATE TYPE flight_booking_status AS ENUM (
    'SEARCHED',
    'PREBOOKED', 
    'PENDING_PAYMENT',
    'PAYMENT_CONFIRMED',
    'TICKET_ISSUED',
    'FAILED',
    'REFUNDED',
    'EXPIRED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create flight_prebookings table
CREATE TABLE IF NOT EXISTS public.flight_prebookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Booking reference (unique identifier for the pre-booking)
  booking_reference TEXT NOT NULL UNIQUE,
  
  -- Flight data from API
  flight_data JSONB NOT NULL,
  provider TEXT NOT NULL DEFAULT 'amadeus',
  
  -- Price breakdown (calculated server-side ONLY)
  base_fare NUMERIC NOT NULL,
  taxes NUMERIC NOT NULL DEFAULT 0,
  service_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  
  -- Passenger data
  passengers JSONB NOT NULL DEFAULT '[]'::jsonb,
  adults_count INTEGER NOT NULL DEFAULT 1,
  children_count INTEGER NOT NULL DEFAULT 0,
  
  -- Status management
  status TEXT NOT NULL DEFAULT 'PREBOOKED',
  
  -- Expiration (fare lock expires after X minutes)
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Linked booking (created after pre-booking validation)
  booking_id UUID,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Signature for integrity verification
  price_signature TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('SEARCHED', 'PREBOOKED', 'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'TICKET_ISSUED', 'FAILED', 'REFUNDED', 'EXPIRED')),
  CONSTRAINT valid_amounts CHECK (base_fare >= 0 AND taxes >= 0 AND service_fee >= 0 AND total_amount > 0),
  CONSTRAINT valid_passenger_count CHECK (adults_count >= 1 AND children_count >= 0)
);

-- Add columns to bookings table if they don't exist
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS prebooking_id UUID,
  ADD COLUMN IF NOT EXISTS pnr TEXT,
  ADD COLUMN IF NOT EXISTS flight_status TEXT DEFAULT 'pending';

-- Add columns to payments table if they don't exist  
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_signature TEXT,
  ADD COLUMN IF NOT EXISTS prebooking_id UUID;

-- Enable RLS
ALTER TABLE public.flight_prebookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for flight_prebookings
CREATE POLICY "Users can view their own prebookings"
ON public.flight_prebookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prebookings"
ON public.flight_prebookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prebookings"
ON public.flight_prebookings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all prebookings"
ON public.flight_prebookings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prebookings_user_id ON public.flight_prebookings(user_id);
CREATE INDEX IF NOT EXISTS idx_prebookings_booking_ref ON public.flight_prebookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_prebookings_status ON public.flight_prebookings(status);
CREATE INDEX IF NOT EXISTS idx_prebookings_expires_at ON public.flight_prebookings(expires_at);

-- Create function to automatically expire old prebookings
CREATE OR REPLACE FUNCTION public.expire_old_prebookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.flight_prebookings
  SET status = 'EXPIRED', updated_at = now()
  WHERE status = 'PREBOOKED' 
    AND expires_at < now();
END;
$$;

-- Create trigger for updated_at on flight_prebookings
CREATE TRIGGER update_flight_prebookings_updated_at
  BEFORE UPDATE ON public.flight_prebookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for flight_prebookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.flight_prebookings;