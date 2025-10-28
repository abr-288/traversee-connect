import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, MapPin, Users, Wifi, UtensilsCrossed, Car, Loader2 } from "lucide-react";
import { HotelBookingDialog } from "@/components/HotelBookingDialog";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { toast } from "sonner";

const Hotels = () => {
  const [searchParams] = useSearchParams();
  const { searchHotels, loading } = useHotelSearch();
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiHotels, setApiHotels] = useState<any[]>([]);

  useEffect(() => {
    const destination = searchParams.get("destination");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const rooms = searchParams.get("rooms");

    if (destination && checkIn && checkOut && adults) {
      handleSearch(
        destination,
        checkIn,
        checkOut,
        parseInt(adults),
        children ? parseInt(children) : 0,
        rooms ? parseInt(rooms) : 1
      );
    }
  }, [searchParams]);

  const handleSearch = async (
    location: string,
    checkIn: string,
    checkOut: string,
    adults: number,
    children: number = 0,
    rooms: number = 1
  ) => {
    const result = await searchHotels({
      location,
      checkIn,
      checkOut,
      adults,
      children,
      rooms
    });

    if (result?.success) {
      const allHotels = [...(result.data?.booking || []), ...(result.data?.airbnb || [])];
      // Transform API data to match display structure
      const transformedHotels = allHotels.map((hotel: any) => {
        const price = typeof hotel.price === 'object' && hotel.price?.grandTotal 
          ? parseFloat(hotel.price.grandTotal) 
          : typeof hotel.price === 'number' 
          ? hotel.price 
          : parseFloat(hotel.price?.total || hotel.price || 0);
        
        return {
          id: hotel.id || hotel.hotel_id || Math.random().toString(),
          name: hotel.name || hotel.hotel_name || 'Hôtel',
          location: hotel.location || hotel.address || location,
          price: Math.round(price),
          rating: hotel.rating || hotel.review_score || 4.0,
          reviews: hotel.reviews || hotel.review_count || 0,
          image: hotel.image || hotel.main_photo_url || '/placeholder.svg',
          amenities: hotel.amenities || hotel.facilities || ['Wifi', 'Restaurant']
        };
      });
      
      setApiHotels(transformedHotels);
      toast.success(`${transformedHotels.length} hébergements trouvés`);
    } else {
      toast.error("Erreur lors de la recherche d'hôtels");
    }
  };

  const hotels = [
    {
      id: 1,
      name: "Hôtel Ivoire",
      location: "Abidjan, Cocody",
      price: 45000,
      rating: 4.8,
      reviews: 234,
      image: "/placeholder.svg",
      amenities: ["Wifi", "Restaurant", "Parking", "Piscine"]
    },
    {
      id: 2,
      name: "Sofitel Abidjan",
      location: "Abidjan, Plateau",
      price: 85000,
      rating: 4.9,
      reviews: 189,
      image: "/placeholder.svg",
      amenities: ["Wifi", "Restaurant", "Parking", "Spa"]
    },
    {
      id: 3,
      name: "Azalaï Hôtel",
      location: "Abidjan, Marcory",
      price: 35000,
      rating: 4.5,
      reviews: 156,
      image: "/placeholder.svg",
      amenities: ["Wifi", "Restaurant", "Bar"]
    },
    {
      id: 4,
      name: "Pullman Abidjan",
      location: "Abidjan, Plateau",
      price: 75000,
      rating: 4.7,
      reviews: 203,
      image: "/placeholder.svg",
      amenities: ["Wifi", "Restaurant", "Parking", "Gym"]
    },
    {
      id: 5,
      name: "Seen Hotel",
      location: "Abidjan, Zone 4",
      price: 55000,
      rating: 4.6,
      reviews: 142,
      image: "/placeholder.svg",
      amenities: ["Wifi", "Restaurant", "Piscine"]
    },
    {
      id: 6,
      name: "Onomo Hotel",
      location: "Abidjan, Aéroport",
      price: 28000,
      rating: 4.3,
      reviews: 98,
      image: "/placeholder.svg",
      amenities: ["Wifi", "Restaurant", "Navette"]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-r from-primary/90 to-secondary/90 overflow-hidden">
        <img 
          src="/src/assets/destination-hotel.jpg" 
          alt="Hotels" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Hôtels & Hébergements</h1>
          <p className="text-xl text-white/90">Des hébergements de qualité partout dans le monde</p>
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
                  <label className="text-sm font-medium mb-2 block">Destination</label>
                  <Input placeholder="Rechercher une ville..." />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Étoiles</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="5">5 étoiles</SelectItem>
                      <SelectItem value="4">4 étoiles</SelectItem>
                      <SelectItem value="3">3 étoiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Prix par nuit: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA
                  </label>
                  <Slider
                    min={0}
                    max={500000}
                    step={5000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Équipements</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Wifi gratuit</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Restaurant</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Parking</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Piscine</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full">Appliquer les filtres</Button>
              </div>
            </Card>
          </aside>

          {/* Liste des hôtels */}
          <div className="lg:col-span-3 space-y-6">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">Recherche en cours...</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {apiHotels.length > 0 ? apiHotels.length : hotels.length} hôtels trouvés
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

            <div className="grid gap-6">
              {(apiHotels.length > 0 ? apiHotels : hotels).map((hotel, index) => (
                <Card key={hotel.id || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="md:col-span-2 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-semibold mb-2">{hotel.name}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{hotel.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(hotel.rating)
                                      ? "fill-accent text-accent"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {hotel.rating} ({hotel.reviews} avis)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mb-4 flex-wrap">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-muted rounded-full text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-end mt-auto">
                        <div>
                          <p className="text-sm text-muted-foreground">À partir de</p>
                          <p className="text-3xl font-bold text-primary">
                            {hotel.price.toLocaleString()} <span className="text-lg">FCFA</span>
                          </p>
                          <p className="text-sm text-muted-foreground">par nuit</p>
                        </div>
                        <Button size="lg" onClick={() => {
                          setSelectedHotel({
                            id: hotel.id.toString(),
                            name: hotel.name,
                            location: hotel.location,
                            price: hotel.price
                          });
                          setDialogOpen(true);
                        }}>
                          Réserver
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {selectedHotel && (
        <HotelBookingDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          hotel={selectedHotel}
        />
      )}

      <Footer />
    </div>
  );
};

export default Hotels;
