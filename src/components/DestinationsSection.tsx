import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import hotelImg from "@/assets/destination-hotel.jpg";
import safariImg from "@/assets/destination-safari.jpg";
import cityImg from "@/assets/destination-city.jpg";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { useNavigate } from "react-router-dom";

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

  return (
    <>
    <BookingDialog 
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      service={selectedDestination}
    />
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Destinations Populaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explorez nos destinations les plus prisées et vivez des expériences inoubliables
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Card
              key={destination.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-smooth cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
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
