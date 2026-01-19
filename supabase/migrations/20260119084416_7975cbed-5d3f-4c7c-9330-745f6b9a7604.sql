-- Create advertisements table for managing ads from admin panel
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT DEFAULT 'En savoir plus',
  background_color TEXT DEFAULT '#1e3a5f',
  text_color TEXT DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT true,
  position TEXT DEFAULT 'homepage_before_subscriptions',
  sort_order INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Allow public read for active ads
CREATE POLICY "Active advertisements are viewable by everyone" 
ON public.advertisements 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()) AND (starts_at IS NULL OR starts_at <= now()));

-- Allow admins full access using user_roles table
CREATE POLICY "Admins can manage all advertisements" 
ON public.advertisements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample advertisements
INSERT INTO public.advertisements (title, description, image_url, link_url, link_text, background_color, position, sort_order) VALUES
('Offre Spéciale Été 2026', 'Profitez de -30% sur tous les vols vers l''Europe. Réservez maintenant !', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800', '/flights', 'Réserver maintenant', '#1e3a5f', 'homepage_before_subscriptions', 1),
('Pack Famille Vacances', 'Voyagez en famille avec nos offres exclusives. Jusqu''à 4 enfants gratuits !', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', '/subscriptions', 'Découvrir', '#2d5a3d', 'homepage_before_subscriptions', 2),
('Business Travel Premium', 'Services VIP pour vos déplacements professionnels. Salons, transferts, assistance 24/7.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', '/subscriptions', 'En savoir plus', '#4a2c5a', 'homepage_before_subscriptions', 3);