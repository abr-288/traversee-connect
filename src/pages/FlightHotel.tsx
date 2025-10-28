import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, MapPin, Calendar, Users, Check } from "lucide-react";

const FlightHotel = () => {
  const packages = [
    {
      id: 1,
      destination: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
      duration: "5 jours / 4 nuits",
      flight: "Aller-retour depuis Abidjan",
      hotel: "Hôtel 4* centre-ville",
      price: 1250000,
      includes: ["Vol aller-retour", "Hôtel 4 étoiles", "Petit-déjeuner", "Transferts aéroport"]
    },
    {
      id: 2,
      destination: "Dubaï, EAU",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
      duration: "7 jours / 6 nuits",
      flight: "Aller-retour depuis Abidjan",
      hotel: "Hôtel 5* Palm Jumeirah",
      price: 2100000,
      includes: ["Vol aller-retour", "Hôtel 5 étoiles", "Demi-pension", "Transferts", "Visa"]
    },
    {
      id: 3,
      destination: "Dakar, Sénégal",
      image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24",
      duration: "3 jours / 2 nuits",
      flight: "Aller-retour depuis Abidjan",
      hotel: "Hôtel 3* bord de mer",
      price: 380000,
      includes: ["Vol aller-retour", "Hôtel 3 étoiles", "Petit-déjeuner", "Transferts aéroport"]
    },
    {
      id: 4,
      destination: "Istanbul, Turquie",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200",
      duration: "6 jours / 5 nuits",
      flight: "Aller-retour depuis Abidjan",
      hotel: "Hôtel 4* Sultanahmet",
      price: 1450000,
      includes: ["Vol aller-retour", "Hôtel 4 étoiles", "Petit-déjeuner", "Visite guidée", "Transferts"]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Forfaits Vol + Hôtel</h1>
          <p className="text-muted-foreground text-lg">
            Réservez votre vol et votre hébergement en un seul forfait et économisez jusqu'à 30%
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-64">
                <img 
                  src={pkg.image} 
                  alt={pkg.destination}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Économisez 30%
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {pkg.destination}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {pkg.duration}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Plane className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Vol</p>
                      <p className="text-sm text-muted-foreground">{pkg.flight}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hotel className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Hébergement</p>
                      <p className="text-sm text-muted-foreground">{pkg.hotel}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="font-semibold mb-2">Inclus dans le forfait :</p>
                  <ul className="space-y-1">
                    {pkg.includes.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">À partir de</p>
                    <p className="text-3xl font-bold text-primary">
                      {pkg.price.toLocaleString()} <span className="text-base">FCFA</span>
                    </p>
                  </div>
                  <Button size="lg" className="gradient-primary shadow-primary">
                    Réserver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightHotel;
