-- Create passengers table
CREATE TABLE IF NOT EXISTS public.passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  document_type TEXT,
  document_number TEXT,
  nationality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on passengers
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

-- RLS policies for passengers - users can only access their own booking's passengers
CREATE POLICY "Users can view their own passengers"
  ON public.passengers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert passengers for their bookings"
  ON public.passengers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own passengers"
  ON public.passengers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own passengers"
  ON public.passengers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Add external_ref column to bookings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'external_ref'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN external_ref TEXT;
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_passengers_booking_id ON public.passengers(booking_id);

-- Add trigger for updated_at
CREATE TRIGGER update_passengers_updated_at
  BEFORE UPDATE ON public.passengers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();