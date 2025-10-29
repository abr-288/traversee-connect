import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, MapPin, Calendar, Users, Check, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { BookingDialog } from "@/components/BookingDialog";
import { FlightHotelSearchForm } from "@/components/FlightHotelSearchForm";
import { useFlightHotelSearch } from "@/hooks/useFlightHotelSearch";
import { toast } from "sonner";

const FlightHotel = () => {
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const { searchPackages, loading } = useFlightHotelSearch();

  const handleSearch = async (params: any) => {
    const results = await searchPackages(params);
    
    if (results && results.flights && results.hotels) {
      setFlights(results.flights);
      setHotels(results.hotels);
      setSelectedFlight(null);
      setSelectedHotel(null);
      toast.success(`${results.flights.length} vol(s) et ${results.hotels.length} hôtel(s) trouvé(s)`);
    } else {
      toast.error("Erreur lors de la recherche");
    }
  };

  const calculateTotal = () => {
    if (!selectedFlight || !selectedHotel) return { original: 0, discounted: 0, savings: 0 };
    const original = selectedFlight.price + selectedHotel.price;
    const discounted = original * 0.7; // 30% discount
    const savings = original - discounted;
    return { original, discounted, savings };
  };

  const handleBooking = () => {
    if (selectedFlight && selectedHotel) {
      setDialogOpen(true);
    } else {
      toast.error("Veuillez sélectionner un vol et un hôtel");
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

        {!loading && flights.length === 0 && hotels.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              Utilisez le formulaire ci-dessus pour rechercher des vols et hôtels
            </p>
          </div>
        )}

        {!loading && (flights.length > 0 || hotels.length > 0) && (
          <div className="space-y-8">
            {/* Flights Section */}
            {flights.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Plane className="h-6 w-6 text-primary" />
                  Vols disponibles
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {flights.map((flight) => (
                    <Card 
                      key={flight.id} 
                      className={`cursor-pointer transition-all ${
                        selectedFlight?.id === flight.id 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedFlight(flight)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="text-lg">{flight.airline}</span>
                          {selectedFlight?.id === flight.id && (
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="text-white h-4 w-4" />
                            </div>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Départ:</span>
                            <span className="font-medium">{new Date(flight.departure).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Retour:</span>
                            <span className="font-medium">{new Date(flight.return).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Durée:</span>
                            <span className="font-medium">{flight.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Escales:</span>
                            <span className="font-medium">
                              {flight.stops === 0 ? 'Direct' : `${flight.stops} escale(s)`}
                            </span>
                          </div>
                        </div>
                        <div className="pt-3 border-t">
                          <div className="text-2xl font-bold text-primary">
                            {flight.price.toLocaleString()} FCFA
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Hotels Section */}
            {hotels.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Hotel className="h-6 w-6 text-primary" />
                  Hôtels disponibles
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {hotels.map((hotel) => (
                    <Card 
                      key={hotel.id}
                      className={`cursor-pointer transition-all overflow-hidden ${
                        selectedHotel?.id === hotel.id 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedHotel(hotel)}
                    >
                      <div className="relative h-40">
                        <img 
                          src={hotel.image} 
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                        {selectedHotel?.id === hotel.id && (
                          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="text-white h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">{hotel.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          {[...Array(hotel.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {hotel.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                            <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div className="pt-3 border-t">
                          <div className="text-2xl font-bold text-primary">
                            {hotel.price.toLocaleString()} FCFA
                          </div>
                          <p className="text-xs text-muted-foreground">par nuit</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Summary and Booking */}
            {(selectedFlight || selectedHotel) && (
              <Card className="sticky bottom-4 shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Votre sélection</span>
                    {selectedFlight && selectedHotel && (
                      <span className="text-sm font-normal text-green-600">
                        Économisez {calculateTotal().savings.toLocaleString()} FCFA (30%)
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        Vol sélectionné
                      </h3>
                      {selectedFlight ? (
                        <div className="text-sm">
                          <p className="font-medium">{selectedFlight.airline}</p>
                          <p className="text-muted-foreground">{selectedFlight.price.toLocaleString()} FCFA</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun vol sélectionné</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Hotel className="h-4 w-4" />
                        Hôtel sélectionné
                      </h3>
                      {selectedHotel ? (
                        <div className="text-sm">
                          <p className="font-medium">{selectedHotel.name}</p>
                          <p className="text-muted-foreground">{selectedHotel.price.toLocaleString()} FCFA</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun hôtel sélectionné</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Total</h3>
                      {selectedFlight && selectedHotel ? (
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {calculateTotal().discounted.toLocaleString()} FCFA
                          </p>
                          <p className="text-sm text-muted-foreground line-through">
                            {calculateTotal().original.toLocaleString()} FCFA
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sélectionnez un vol et un hôtel</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleBooking}
                    disabled={!selectedFlight || !selectedHotel}
                  >
                    Réserver maintenant
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        )}
      </main>

      {selectedFlight && selectedHotel && (
        <BookingDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          service={{
            id: `${selectedFlight.id}-${selectedHotel.id}`,
            name: `Vol + Hôtel`,
            price_per_unit: calculateTotal().discounted,
            currency: "FCFA",
            type: "package"
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default FlightHotel;
