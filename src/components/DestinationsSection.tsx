import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Loader2 } from "lucide-react";
import hotelImg from "@/assets/destination-hotel.jpg";
import safariImg from "@/assets/destination-safari.jpg";
import cityImg from "@/assets/destination-city.jpg";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { useNavigate } from "react-router-dom";
import { useServices } from "@/hooks/useServices";

const destinations = [
  {
    id: 1,
    title: "Hôtels de Luxe",
    location: "Grand-Bassam",
    image: hotelImg,
    rating: 4.9,
    reviews: 245,
    price: "75 000",
    description: "Séjournez dans des hôtels 5 étoiles avec vue sur l'océan",
  },
  {
    id: 2,
    title: "Safari Nature",
    location: "Parc National de Taï",
    image: safariImg,
    rating: 4.8,
    reviews: 189,
    price: "120 000",
    description: "Découvrez la faune sauvage dans son habitat naturel",
  },
  {
    id: 3,
    title: "Découverte Urbaine",
    location: "Abidjan",
    image: cityImg,
    rating: 4.7,
    reviews: 312,
    price: "45 000",
    description: "Explorez la capitale économique et ses attractions",
  },
];

const DestinationsSection = () => {
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { services, loading } = useServices();

  // Fallback destinations statiques avec format booking
  const fallbackDestinations = destinations.map(dest => ({
    ...dest,
    name: dest.title,
    price_per_unit: parseFloat(dest.price.replace(/\s/g, '')),
    currency: 'FCFA',
    type: 'hotel'
  }));

  // Transformer les services en format destinations
  const destinationsFromServices = services.slice(0, 6).map(service => ({
    id: service.id,
    title: service.name,
    location: service.location,
    image: service.image_url || service.images?.[0] || cityImg,
    rating: Number(service.rating) || 4.5,
    reviews: service.total_reviews || 0,
    price: new Intl.NumberFormat('fr-FR').format(Number(service.price_per_unit)),
    description: service.description || `Découvrez ${service.name}`,
    type: service.type,
    // Données pour le booking
    name: service.name,
    price_per_unit: Number(service.price_per_unit),
    currency: service.currency || 'FCFA'
  }));

  const displayDestinations = destinationsFromServices.length > 0 ? destinationsFromServices : fallbackDestinations;

  return (
    <>
    {selectedDestination && (
      <BookingDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selectedDestination}
      />
    )}
    <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Destinations Populaires
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Explorez nos destinations les plus prisées et vivez des expériences inoubliables
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {displayDestinations.map((destination) => (
            <Card
              key={destination.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-smooth cursor-pointer"
            >
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
                    <p className="text-xs text-muted-foreground">FCFA / nuit</p>
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
                  Réserver Maintenant
                </Button>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => navigate('/stays')}
          >
            Voir Toutes les Destinations
          </Button>
        </div>
      </div>
    </section>
    </>
  );
};

export default DestinationsSection;
