-- Create enum types for service categories and booking status
CREATE TYPE public.service_type AS ENUM ('hotel', 'flight', 'car', 'tour', 'event', 'flight_hotel');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table (hotels, flights, cars, tours, events)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type service_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  destination TEXT,
  price_per_unit DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  image_url TEXT,
  images TEXT[], -- Array of image URLs
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  amenities JSONB, -- For hotels: wifi, pool, etc.
  specifications JSONB, -- For cars: seats, transmission, etc. | For flights: airline, class, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  
  -- Booking details
  start_date DATE NOT NULL,
  end_date DATE,
  guests INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Additional data (flight details, car rental info, etc.)
  booking_details JSONB,
  
  -- Special requests
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_id, booking_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Services policies (public read, admin write will be added later)
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (available = true);

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_reviews
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update service rating when review is added/updated
CREATE OR REPLACE FUNCTION public.update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.services
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.reviews
      WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
    )
  WHERE id = COALESCE(NEW.service_id, OLD.service_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers to update service rating
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_rating();

CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_rating();

CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_rating();

-- Create indexes for better performance
CREATE INDEX idx_services_type ON public.services(type);
CREATE INDEX idx_services_featured ON public.services(featured) WHERE featured = true;
CREATE INDEX idx_services_location ON public.services(location);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX idx_reviews_service_id ON public.reviews(service_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);