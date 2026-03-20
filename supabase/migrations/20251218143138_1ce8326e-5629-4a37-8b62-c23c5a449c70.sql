-- Create agencies table
CREATE TABLE public.agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_visible BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Policies for agencies
CREATE POLICY "Admins can manage all agencies" ON public.agencies
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Sub-agency owners can view their agency" ON public.agencies
FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Sub-agency owners can update their agency" ON public.agencies
FOR UPDATE USING (owner_id = auth.uid());

-- Add agency_id to content tables
ALTER TABLE public.services ADD COLUMN agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;
ALTER TABLE public.activities ADD COLUMN agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;
ALTER TABLE public.stays ADD COLUMN agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;
ALTER TABLE public.promotions ADD COLUMN agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;

-- Function to check if user is agency owner
CREATE OR REPLACE FUNCTION public.is_agency_owner(_user_id uuid, _agency_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agencies
    WHERE id = _agency_id AND owner_id = _user_id
  )
$$;

-- Update RLS policies for services to allow sub-agencies
CREATE POLICY "Sub-agencies can manage their own services" ON public.services
FOR ALL USING (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
)
WITH CHECK (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
);

-- Update RLS policies for activities to allow sub-agencies
CREATE POLICY "Sub-agencies can manage their own activities" ON public.activities
FOR ALL USING (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
)
WITH CHECK (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
);

-- Update RLS policies for stays to allow sub-agencies
CREATE POLICY "Sub-agencies can manage their own stays" ON public.stays
FOR ALL USING (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
)
WITH CHECK (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
);

-- Update RLS policies for promotions to allow sub-agencies
CREATE POLICY "Sub-agencies can manage their own promotions" ON public.promotions
FOR ALL USING (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
)
WITH CHECK (
  has_role(auth.uid(), 'sub_agency') AND 
  is_agency_owner(auth.uid(), agency_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_agencies_updated_at
BEFORE UPDATE ON public.agencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();