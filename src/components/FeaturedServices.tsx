import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Loader2, Plane, Hotel, Car, Calendar } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ServiceType = "car" | "event" | "flight" | "flight_hotel" | "hotel" | "tour";

const FeaturedServices = () => {
  const [selectedType, setSelectedType] = useState<ServiceType | undefined>(undefined);
  const { services, loading } = useServices(selectedType);
  const navigate = useNavigate();

  const serviceTypes = [
    { value: undefined, label: "Tous", icon: Star },
    { value: "flight" as ServiceType, label: "Vols", icon: Plane },
    { value: "hotel" as ServiceType, label: "Hôtels", icon: Hotel },
    { value: "car" as ServiceType, label: "Voitures", icon: Car },
    { value: "event" as ServiceType, label: "Événements", icon: Calendar },
    { value: "tour" as ServiceType, label: "Tours", icon: MapPin }
  ];

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "flight": return Plane;
      case "hotel": return Hotel;
      case "car": return Car;
      case "event": return Calendar;
      case "tour": return MapPin;
      default: return Star;
    }
  };

  const displayServices = services.slice(0, 8);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Services en Vedette
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Découvrez nos meilleures offres sélectionnées pour vous
          </p>
        </div>

        <div className="mb-6 md:mb-8 flex flex-wrap justify-center gap-2 md:gap-3">
          {serviceTypes.map((type) => (
            <Button
              key={type.label}
              variant={selectedType === type.value ? "default" : "outline"}
              onClick={() => setSelectedType(type.value)}
              className="gap-1.5 md:gap-2 text-xs md:text-sm h-8 md:h-10"
              size="sm"
            >
              <type.icon className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{type.label}</span>
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun service disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {displayServices.map((service, index) => {
              const ServiceIcon = getServiceIcon(service.type);
              return (
                <Card
                  key={service.id}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-smooth cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => {
                    const routes: Record<string, string> = {
                      flight: '/flights',
                      hotel: '/hotels',
                      car: '/cars',
                      event: '/events',
                      tour: '/tours'
                    };
                    navigate(routes[service.type] || '/');
                  }}
                >
                  <div className="relative h-40 md:h-48 overflow-hidden">
                    <img
                      src={service.image_url || service.images?.[0] || '/placeholder.svg'}
                      alt={service.name}
                      className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                    />
                    <Badge className="absolute top-3 left-3 gap-1">
                      <ServiceIcon className="w-3 h-3" />
                      {service.type}
                    </Badge>
                    {service.featured && (
                      <Badge className="absolute top-3 right-3 bg-secondary">
                        ⭐ Vedette
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-smooth">
                        {service.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm line-clamp-1">{service.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-secondary text-secondary" />
                        <span className="font-semibold text-sm">{Number(service.rating || 0).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({service.total_reviews || 0})</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {new Intl.NumberFormat('fr-FR').format(Number(service.price_per_unit))}
                        </p>
                        <p className="text-xs text-muted-foreground">{service.currency}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => navigate(selectedType ? `/${selectedType}s` : '/stays')}
            className="gap-2"
          >
            Voir Tous les Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
