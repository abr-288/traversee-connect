import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import hotelImg from "@/assets/destination-hotel.jpg";
import safariImg from "@/assets/destination-safari.jpg";
import cityImg from "@/assets/destination-city.jpg";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { useNavigate } from "react-router-dom";
import { useServices } from "@/hooks/useServices";

const worldDestinations = [
  {
    id: 1,
    title: "Paris",
    location: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    rating: 4.9,
    reviews: 3245,
    price: "450 000",
    description: "La ville lumière, capitale de la mode et de la gastronomie",
  },
  {
    id: 2,
    title: "Dubaï",
    location: "Émirats Arabes Unis",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    rating: 4.9,
    reviews: 2890,
    price: "550 000",
    description: "Luxe et modernité dans le désert, shopping et architecture futuriste",
  },
  {
    id: 3,
    title: "Maldives",
    location: "Océan Indien",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    rating: 5.0,
    reviews: 1876,
    price: "780 000",
    description: "Paradis tropical avec plages de sable blanc et eaux cristallines",
  },
  {
    id: 4,
    title: "Tokyo",
    location: "Japon",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    rating: 4.8,
    reviews: 2567,
    price: "520 000",
    description: "Mélange unique de tradition et de technologie ultra-moderne",
  },
  {
    id: 5,
    title: "Bali",
    location: "Indonésie",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    rating: 4.9,
    reviews: 3102,
    price: "380 000",
    description: "Îles paradisiaques, temples anciens et rizières en terrasses",
  },
  {
    id: 6,
    title: "New York",
    location: "États-Unis",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
    rating: 4.7,
    reviews: 4123,
    price: "620 000",
    description: "La ville qui ne dort jamais, capitale culturelle et économique",
  },
  {
    id: 7,
    title: "Rome",
    location: "Italie",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    rating: 4.8,
    reviews: 2934,
    price: "420 000",
    description: "La ville éternelle, berceau de la civilisation occidentale",
  },
  {
    id: 8,
    title: "Barcelone",
    location: "Espagne",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
    rating: 4.8,
    reviews: 2645,
    price: "390 000",
    description: "Architecture de Gaudí, plages méditerranéennes et vie nocturne",
  },
  {
    id: 9,
    title: "Bangkok",
    location: "Thaïlande",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
    rating: 4.7,
    reviews: 2187,
    price: "340 000",
    description: "Temples dorés, street food légendaire et marchés flottants",
  },
];

const DestinationsSection = () => {
  const { t } = useTranslation();
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { services, loading } = useServices();

  // Utiliser les destinations mondiales
  const displayDestinations = worldDestinations.map(dest => ({
    ...dest,
    name: dest.title,
    price_per_unit: parseFloat(dest.price.replace(/\s/g, '')),
    currency: 'FCFA',
    type: 'tour'
  }));

  return (
    <>
    {selectedDestination && (
      <BookingDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selectedDestination}
      />
    )}
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-muted/20 via-background to-muted/30 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16 animate-slide-up-fade">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              🌍 Découvrez le Monde
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-4 md:mb-6">
            {t('destinations.title')}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t('destinations.subtitle')}
          </p>
          
          {/* Decorative line */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-16 h-1 bg-gradient-primary rounded-full" />
            <div className="w-8 h-1 bg-primary/50 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {displayDestinations.slice(0, 9).map((destination, index) => (
            <Card
              key={destination.id}
              className="group overflow-hidden border-2 border-border/50 hover:border-primary/50 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer animate-slide-up-fade hover-lift rounded-2xl relative bg-gradient-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              
              <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.title}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="font-semibold text-sm">{destination.rating}</span>
                  <span className="text-xs text-muted-foreground">({destination.reviews})</span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-smooth">
                      {destination.title}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{destination.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{destination.price}</p>
                    <p className="text-xs text-muted-foreground">FCFA / {t('destinations.perNight')}</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4">{destination.description}</p>

                <Button 
                  className="w-full gradient-primary shadow-primary"
                  onClick={() => {
                    setSelectedDestination({
                      id: destination.id.toString(),
                      name: destination.title,
                      price_per_unit: parseInt(destination.price.replace(/\s/g, '')),
                      currency: "FCFA",
                      type: "stay",
                      location: destination.location
                    });
                    setDialogOpen(true);
                  }}
                >
                  {t('destinations.book')}
                </Button>
              </CardContent>
            </Card>
            ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => navigate('/destinations')}
          >
            {t('destinations.viewAll')}
          </Button>
        </div>
      </div>
    </section>
    </>
  );
};

export default DestinationsSection;
