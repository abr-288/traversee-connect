import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, MapPin, Calendar, Users, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { FlightHotelSearchForm } from "@/components/FlightHotelSearchForm";
import { useFlightHotelSearch } from "@/hooks/useFlightHotelSearch";
import { toast } from "sonner";

const FlightHotel = () => {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const { searchPackages, loading } = useFlightHotelSearch();

  const handleSearch = async (params: any) => {
    const results = await searchPackages(params);
    
    if (results && results.packages) {
      setPackages(results.packages);
      if (results.packages.length === 0) {
        toast.info("Aucun forfait trouvé pour cette recherche");
      }
    } else {
      toast.error("Erreur lors de la recherche des forfaits");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="relative py-32 bg-gradient-to-r from-primary/90 to-secondary/90 overflow-hidden rounded-3xl mb-12">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05" 
            alt="Vol + Hotel" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 rounded-3xl"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">Forfaits Vol + Hôtel</h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium">
              Réservez votre vol et votre hébergement en un seul forfait et économisez jusqu'à 30%
            </p>
          </div>
        </div>

        <FlightHotelSearchForm onSearch={handleSearch} />

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        )}

        {!loading && packages.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              Utilisez le formulaire ci-dessus pour rechercher des forfaits Vol + Hôtel
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="relative h-64">
                <img 
                  src={pkg.hotel.image} 
                  alt={pkg.destination}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Économisez {pkg.savings?.toLocaleString()} FCFA
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
                      <p className="font-medium">Vol - {pkg.flight.airline}</p>
                      <p className="text-sm text-muted-foreground">
                        {pkg.flight.origin} → {pkg.flight.destination}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Durée: {pkg.flight.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hotel className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{pkg.hotel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {'⭐'.repeat(pkg.hotel.stars)} - {pkg.hotel.address}
                      </p>
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
                    <p className="text-sm text-muted-foreground line-through">
                      {pkg.originalPrice?.toLocaleString()} FCFA
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {pkg.discountedPrice?.toLocaleString()} <span className="text-base">FCFA</span>
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    className="gradient-primary shadow-primary"
                    onClick={() => {
                      setSelectedPackage({
                        id: pkg.id.toString(),
                        name: `Vol + Hôtel ${pkg.destination}`,
                        price_per_unit: pkg.discountedPrice,
                        currency: "FCFA",
                        type: "package",
                        location: pkg.destination
                      });
                      setDialogOpen(true);
                    }}
                  >
                    Réserver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {selectedPackage && (
        <BookingDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          service={selectedPackage}
        />
      )}

      <Footer />
    </div>
  );
};

export default FlightHotel;
