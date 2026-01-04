-- Create destinations cache table
CREATE TABLE public.destinations_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  destinations JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'api',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for fast lookups
CREATE INDEX idx_destinations_cache_key ON public.destinations_cache(cache_key);
CREATE INDEX idx_destinations_cache_expires ON public.destinations_cache(expires_at);

-- Enable RLS
ALTER TABLE public.destinations_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (destinations are public data)
CREATE POLICY "Destinations cache is publicly readable"
ON public.destinations_cache
FOR SELECT
USING (true);

-- Only allow edge functions (service role) to insert/update/delete
CREATE POLICY "Service role can manage cache"
ON public.destinations_cache
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION public.clean_expired_destinations_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.destinations_cache WHERE expires_at < now();
END;
$$;