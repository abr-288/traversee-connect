-- Add commission_rate to agencies table
ALTER TABLE public.agencies ADD COLUMN commission_rate NUMERIC DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- Create commissions table to track earned commissions
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  booking_amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Policies for commissions
CREATE POLICY "Admins can manage all commissions" ON public.commissions
FOR ALL USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Sub-agencies can view their own commissions" ON public.commissions
FOR SELECT USING (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_commissions_updated_at
BEFORE UPDATE ON public.commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();