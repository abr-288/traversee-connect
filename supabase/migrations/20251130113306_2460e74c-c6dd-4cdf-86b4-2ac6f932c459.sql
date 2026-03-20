-- Create site_config table for managing all site content
CREATE TABLE public.site_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general',
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read site config (for frontend)
CREATE POLICY "Site config is readable by everyone"
ON public.site_config FOR SELECT
USING (true);

-- Only admins can modify site config
CREATE POLICY "Admins can manage site config"
ON public.site_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_site_config_updated_at
BEFORE UPDATE ON public.site_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.site_config (config_key, config_value, category, description) VALUES
-- Branding
('branding', '{"siteName": "B-Reserve", "tagline": "Votre partenaire voyage", "logoLight": "/logo-light.png", "logoDark": "/logo-dark.png", "favicon": "/favicon.ico"}', 'branding', 'Site branding and logos'),

-- Contact Info
('contact', '{"email": "contact@b-reserve.com", "phone": "+225 00 00 00 00", "address": "Abidjan, Côte d''Ivoire", "whatsapp": "+225 00 00 00 00"}', 'contact', 'Contact information'),

-- Social Links
('social', '{"facebook": "https://facebook.com/breserve", "instagram": "https://instagram.com/breserve", "twitter": "https://twitter.com/breserve", "linkedin": "https://linkedin.com/company/breserve", "youtube": ""}', 'social', 'Social media links'),

-- Hero Section
('hero', '{"title": "Voyagez en toute sérénité", "subtitle": "Réservez vos vols, hôtels et voitures en quelques clics", "ctaText": "Commencer", "slides": [{"image": "/hero-slide-1.jpg", "title": "Découvrez le monde"}, {"image": "/hero-slide-2.jpg", "title": "Aventures inoubliables"}, {"image": "/hero-slide-3.jpg", "title": "Destinations de rêve"}]}', 'homepage', 'Hero section content'),

-- Features Section
('features', '{"title": "Pourquoi nous choisir?", "items": [{"icon": "Shield", "title": "Paiement sécurisé", "description": "Transactions 100% sécurisées"}, {"icon": "Clock", "title": "Support 24/7", "description": "Assistance disponible à tout moment"}, {"icon": "Star", "title": "Meilleurs prix", "description": "Garantie du meilleur tarif"}]}', 'homepage', 'Features section'),

-- SEO
('seo', '{"defaultTitle": "B-Reserve - Réservation de voyages", "defaultDescription": "Plateforme de réservation de vols, hôtels et voitures de location", "keywords": "voyage, vol, hôtel, voiture, réservation"}', 'seo', 'SEO metadata'),

-- Currency & Locale
('locale', '{"defaultCurrency": "EUR", "availableCurrencies": ["EUR", "USD", "XOF", "GBP"], "defaultLanguage": "fr", "availableLanguages": ["fr", "en", "zh"]}', 'settings', 'Currency and language settings'),

-- Footer
('footer', '{"copyright": "© 2024 B-Reserve. Tous droits réservés.", "showNewsletter": true, "newsletterTitle": "Abonnez-vous à notre newsletter"}', 'footer', 'Footer content'),

-- Pricing Display
('pricing', '{"showOriginalPrice": true, "discountBadgeColor": "red", "currencyPosition": "after"}', 'settings', 'Pricing display settings'),

-- Booking Settings
('booking', '{"minAdvanceHours": 24, "maxGuestsPerBooking": 10, "requirePhoneVerification": false, "autoConfirmBookings": false}', 'settings', 'Booking configuration');
