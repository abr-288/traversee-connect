-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text NOT NULL UNIQUE,
  name text NOT NULL,
  subtitle text,
  icon text NOT NULL DEFAULT 'Building2',
  price text NOT NULL,
  price_note text,
  features text[] DEFAULT '{}',
  popular boolean DEFAULT false,
  color text DEFAULT 'from-primary to-primary/80',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create promotions table
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  image_url text,
  discount integer NOT NULL CHECK (discount >= 0 AND discount <= 100),
  original_price numeric NOT NULL,
  currency text DEFAULT 'EUR',
  expires_at timestamp with time zone,
  rating numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans
CREATE POLICY "Subscription plans are viewable by everyone"
ON public.subscription_plans FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
ON public.subscription_plans FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for promotions
CREATE POLICY "Promotions are viewable by everyone"
ON public.promotions FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage promotions"
ON public.promotions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_id, name, subtitle, icon, price, price_note, features, popular, color, sort_order) VALUES
('corporate', 'Corporate Mensuelle', 'Pour les entreprises', 'Building2', '230€ - 460€', 'par mois', ARRAY['Gestion complète des réservations', 'Négociation de tarifs corporate', 'Support prioritaire 7j/7', 'Gestionnaire dédié'], true, 'from-primary to-primary/80', 1),
('premium', 'Premium VIP', 'Abonnement individuel', 'Crown', '30€ - 55€', 'par mois', ARRAY['Réservations prioritaires', 'Traitement express visas', 'Assistance 24/7', 'Alertes exclusives'], false, 'from-amber-500 to-amber-600', 2),
('visa', 'Assistance Visa+', 'Personnes & Entreprises', 'FileCheck', 'Sur devis', 'selon destination', ARRAY['Constitution du dossier', 'Prise de rendez-vous', 'Coaching entretien', 'Suivi prioritaire'], false, 'from-emerald-500 to-emerald-600', 3),
('billets', 'Billets Pro & Famille', 'Tarifs négociés', 'Plane', 'Jusqu''à -18%', 'sur les tarifs publics', ARRAY['Tarifs professionnels', 'Options flexibles', 'Support complet', 'Tous les vols'], false, 'from-blue-500 to-blue-600', 4),
('family', 'Pack Famille', 'Voyages en famille', 'Users', '70€', 'par mois', ARRAY['Réservations groupées', 'Tarifs enfants réduits', 'Assurance voyage famille', 'Activités enfants incluses'], false, 'from-pink-500 to-pink-600', 5),
('business', 'Business Traveler', 'Voyageurs fréquents', 'Briefcase', '115€', 'par mois', ARRAY['Check-in prioritaire', 'Lounge aéroport inclus', 'Modifications illimitées', 'Conciergerie voyage'], false, 'from-slate-600 to-slate-700', 6),
('student', 'Évasion Jeunes', 'Étudiants & -26 ans', 'GraduationCap', '18€', 'par mois', ARRAY['Tarifs étudiants exclusifs', 'Bagages supplémentaires', 'Annulation flexible', 'Bons plans destinations'], false, 'from-violet-500 to-violet-600', 7),
('events', 'Events & MICE', 'Séminaires & Incentives', 'CalendarDays', 'Sur devis', 'selon groupe', ARRAY['Organisation complète', 'Logistique événementielle', 'Hébergement groupe', 'Team building inclus'], false, 'from-orange-500 to-orange-600', 8);