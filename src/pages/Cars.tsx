import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, Users, Briefcase, Fuel, Settings, Loader2 } from "lucide-react";
import { CarBookingDialog } from "@/components/CarBookingDialog";
import { useCarRental } from "@/hooks/useCarRental";
import { toast } from "sonner";

const Cars = () => {
  const [searchParams] = useSearchParams();
  const { searchCarRentals, loading } = useCarRental();
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiCars, setApiCars] = useState<any[]>([]);

  useEffect(() => {
    const location = searchParams.get("location");
    const pickupDate = searchParams.get("pickupDate");
    const returnDate = searchParams.get("returnDate");

    if (location && pickupDate && returnDate) {
      handleSearch(location, pickupDate, returnDate);
    }
  }, [searchParams]);

  const handleSearch = async (
    pickupLocation: string,
    pickupDate: string,
    dropoffDate: string
  ) => {
    const result = await searchCarRentals({
      pickupLocation,
      dropoffLocation: pickupLocation,
      pickupDate,
      dropoffDate
    });

    if (result?.success && result?.data) {
      const carsArray = Array.isArray(result.data) ? result.data : [result.data];
      // Transform API data to match display structure
      const transformedCars = carsArray.map((car: any) => {
        const price = typeof car.price === 'object' && car.price?.grandTotal 
          ? parseFloat(car.price.grandTotal) 
          : typeof car.price === 'number' 
          ? car.price 
          : parseFloat(car.price?.total || car.price || 0);
        
        return {
          id: car.id || car.vehicle_id || Math.random().toString(),
          name: car.name || car.vehicle_name || car.model || 'Véhicule',
          category: car.category || car.vehicle_category || 'Standard',
          price: Math.round(price),
          rating: car.rating || 4.5,
          reviews: car.reviews || car.review_count || 0,
          image: car.image || car.vehicle_image || '/placeholder.svg',
          seats: car.seats || car.passenger_capacity || 5,
          transmission: car.transmission || 'Automatique',
          fuel: car.fuel || car.fuel_type || 'Essence',
          luggage: car.luggage || car.luggage_capacity || 3
        };
      });
      
      setApiCars(transformedCars);
      toast.success(`${transformedCars.length} voitures trouvées`);
    } else {
      toast.error("Erreur lors de la recherche de voitures");
    }
  };

  const cars = [
    {
      id: 1,
      name: "Toyota Corolla",
      category: "Berline",
      price: 25000,
      rating: 4.7,
      reviews: 142,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Automatique",
      fuel: "Essence",
      luggage: 3
    },
    {
      id: 2,
      name: "Toyota RAV4",
      category: "SUV",
      price: 45000,
      rating: 4.8,
      reviews: 98,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Automatique",
      fuel: "Essence",
      luggage: 4
    },
    {
      id: 3,
      name: "Renault Clio",
      category: "Économique",
      price: 18000,
      rating: 4.5,
      reviews: 167,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Manuelle",
      fuel: "Essence",
      luggage: 2
    },
    {
      id: 4,
      name: "Mercedes Classe E",
      category: "Luxe",
      price: 85000,
      rating: 4.9,
      reviews: 73,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Automatique",
      fuel: "Diesel",
      luggage: 3
    },
    {
      id: 5,
      name: "Hyundai Tucson",
      category: "SUV",
      price: 38000,
      rating: 4.6,
      reviews: 115,
      image: "/placeholder.svg",
      seats: 5,
      transmission: "Automatique",
      fuel: "Essence",
      luggage: 4
    },
    {
      id: 6,
      name: "Kia Picanto",
      category: "Citadine",
      price: 15000,
      rating: 4.4,
      reviews: 203,
      image: "/placeholder.svg",
      seats: 4,
      transmission: "Manuelle",
      fuel: "Essence",
      luggage: 2
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-r from-primary/90 to-secondary/90 overflow-hidden">
        <img 
          src="/src/assets/hero-slide-2.jpg" 
          alt="Car Rental" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Location de voitures</h1>
          <p className="text-xl text-white/90">Louez une voiture adaptée à vos besoins</p>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Filtres</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Lieu de prise en charge</label>
                  <Input placeholder="Ville ou aéroport..." />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="economy">Économique</SelectItem>
                      <SelectItem value="sedan">Berline</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="luxury">Luxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Prix par jour: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA
                  </label>
                  <Slider
                    min={0}
                    max={150000}
                    step={5000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Transmission</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Automatique</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Manuelle</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Carburant</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Essence</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Diesel</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full">Appliquer les filtres</Button>
              </div>
            </Card>
          </aside>

          {/* Liste des voitures */}
          <div className="lg:col-span-3 space-y-6">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">Recherche en cours...</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {apiCars.length > 0 ? apiCars.length : cars.length} véhicules disponibles
              </p>
              <Select defaultValue="popular">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Plus populaires</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="rating">Mieux notés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {(apiCars.length > 0 ? apiCars : cars).map((car, index) => (
                <Card key={car.id || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-6">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                        {car.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3">{car.name}</h3>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(car.rating)
                                ? "fill-accent text-accent"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {car.rating} ({car.reviews} avis)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{car.seats} places</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>{car.luggage} bagages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>{car.transmission}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4" />
                        <span>{car.fuel}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">À partir de</p>
                        <p className="text-2xl font-bold text-primary">
                          {car.price.toLocaleString()} <span className="text-sm">FCFA</span>
                        </p>
                        <p className="text-xs text-muted-foreground">par jour</p>
                      </div>
                      <Button onClick={() => {
                        setSelectedCar({
                          id: car.id.toString(),
                          name: car.name,
                          category: car.category,
                          price: car.price,
                          transmission: car.transmission,
                          seats: car.seats
                        });
                        setDialogOpen(true);
                      }}>
                        Réserver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedCar && (
        <CarBookingDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          car={selectedCar}
        />
      )}

      <Footer />
    </div>
  );
};

export default Cars;
