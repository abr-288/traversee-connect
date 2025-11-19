import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Percent, MapPin, Star, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useServices } from "@/hooks/useServices";
import { useNavigate } from "react-router-dom";
import { BookingDialog } from "@/components/BookingDialog";

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
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 gap-1 text-base px-4 py-2">
              <Percent className="w-4 h-4" />
              {t('offers.limited')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('offers.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('offers.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialOffers.map((offer, index) => (
              <Card
                key={offer.id}
                className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-smooth animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-secondary text-secondary-foreground text-lg px-4 py-2 shadow-lg">
                    -{offer.discount}%
                  </Badge>
                </div>

                <div className="relative h-64 overflow-hidden">
                  <img
                    src={offer.image_url || offer.images?.[0] || '/placeholder.svg'}
                    alt={offer.name}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                        {new Intl.NumberFormat('fr-FR').format(
                          Number(offer.price_per_unit) * (1 - offer.discount / 100)
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {new Intl.NumberFormat('fr-FR').format(Number(offer.price_per_unit))}
                      </span>
                      <span className="text-xs text-muted-foreground">{offer.currency}</span>
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
