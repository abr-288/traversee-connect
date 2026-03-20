-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  image_url TEXT,
  duration TEXT NOT NULL,
  category TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  price_per_unit NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  highlights TEXT[] DEFAULT '{}',
  included TEXT[] DEFAULT '{}',
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stays table
CREATE TABLE public.stays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  image_url TEXT,
  duration TEXT NOT NULL,
  type TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  price_per_unit NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  highlights TEXT[] DEFAULT '{}',
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on stays
ALTER TABLE public.stays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
CREATE POLICY "Activities are viewable by everyone"
ON public.activities
FOR SELECT
USING (available = true);

CREATE POLICY "Admins can manage activities"
ON public.activities
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for stays
CREATE POLICY "Stays are viewable by everyone"
ON public.stays
FOR SELECT
USING (available = true);

CREATE POLICY "Admins can manage stays"
ON public.stays
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_stays_updated_at
BEFORE UPDATE ON public.stays
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();