import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";
import { Clock, Percent, MapPin, Star, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useServices } from "@/hooks/useServices";
import { useNavigate } from "react-router-dom";
import { BookingDialog } from "@/components/BookingDialog";
import { Price } from "@/components/ui/price";

const SpecialOffers = () => {
  const { t } = useTranslation();
  const { services, loading } = useServices();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Simuler des offres spéciales avec réduction
  const specialOffers = services
    .filter(s => s.featured)
    .slice(0, 3)
    .map(service => ({
      ...service,
      discount: Math.floor(Math.random() * 30) + 10, // 10-40% de réduction
      expiresIn: Math.floor(Math.random() * 7) + 1 // 1-7 jours
    }));

  if (loading || specialOffers.length === 0) return null;

  return (
    <>
      {selectedService && (
        <BookingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          service={selectedService}
        />
      )}
      <section className="py-20 md:py-24 lg:py-28 bg-gradient-to-br from-primary/5 via-secondary/5 to-background relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14 md:mb-16 animate-slide-up-fade">
            <Badge className="mb-6 gap-2 text-base px-6 py-3 bg-gradient-primary text-white border-0 shadow-primary animate-pulse-glow">
              <Percent className="w-5 h-5" />
              {t('offers.limited')}
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-6">
              {t('offers.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('offers.subtitle')}
            </p>
            
            {/* Decorative line */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-20 h-1.5 bg-gradient-primary rounded-full" />
              <div className="w-10 h-1.5 bg-secondary/50 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {specialOffers.map((offer, index) => (
              <Card
                key={offer.id}
                className="group relative overflow-hidden border-2 border-border/50 hover:border-secondary shadow-2xl hover:shadow-glow transition-all duration-500 animate-slide-up-fade hover-lift rounded-3xl bg-gradient-card"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Shine overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
                
                <div className="absolute top-6 right-6 z-10">
                  <Badge className="gradient-primary text-white text-xl px-6 py-3 shadow-glow border-0 font-bold animate-pulse-glow">
                    -{offer.discount}%
                  </Badge>
                </div>

                <div className="relative h-72 overflow-hidden rounded-t-3xl">
                  <LazyImage
                    src={offer.image_url || offer.images?.[0] || '/placeholder.svg'}
                    alt={`Offre spéciale ${offer.name} à ${offer.location} avec -${offer.discount}% de réduction`}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Floating icon */}
                  <div className="absolute bottom-6 left-6 w-16 h-16 glass rounded-2xl flex items-center justify-center animate-float">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                </div>

                <CardContent className="p-6 relative -mt-20 z-10">
                  <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                      {offer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{offer.location}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-secondary text-secondary" />
                        <span className="font-semibold text-sm">{Number(offer.rating || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('offers.expiresIn')} {offer.expiresIn}j</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-primary">
                        <Price 
                          amount={Number(offer.price_per_unit) * (1 - offer.discount / 100)} 
                          fromCurrency={offer.currency}
                          showLoader 
                        />
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        <Price amount={Number(offer.price_per_unit)} fromCurrency={offer.currency} />
                      </span>
                    </div>

                    <Button
                      className="w-full gap-2 gradient-primary shadow-primary"
                      onClick={() => {
                        setSelectedService({
                          id: offer.id,
                          name: offer.name,
                          price_per_unit: Number(offer.price_per_unit) * (1 - offer.discount / 100),
                          currency: offer.currency,
                          type: offer.type,
                          location: offer.location
                        });
                        setDialogOpen(true);
                      }}
                    >
                      {t('offers.bookNow')}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default SpecialOffers;
