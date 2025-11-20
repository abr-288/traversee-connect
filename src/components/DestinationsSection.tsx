import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { useNavigate } from "react-router-dom";
import { useDestinations } from "@/hooks/useDestinations";


const DestinationsSection = () => {
  const { t } = useTranslation();
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { data: destinations, isLoading } = useDestinations();

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

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {destinations?.slice(0, 9).map((destination, index) => (
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
                    alt={destination.name}
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
                        {destination.name}
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
                        id: destination.id,
                        name: destination.name,
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
        )}

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
