import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, MapPin, Calendar, Users, Check, Loader2, Star, Package, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlightHotelSearchForm } from "@/components/FlightHotelSearchForm";
import { useFlightHotelSearch } from "@/hooks/useFlightHotelSearch";
import { toast } from "sonner";
import { LazyImage } from "@/components/ui/lazy-image";
import bannerFlightHotel from "@/assets/banner-flight-hotel.jpg";
import { Price } from "@/components/ui/price";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FlightHotel = () => {
  const navigate = useNavigate();
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<any>(null);
  const { searchPackages, loading } = useFlightHotelSearch();

  const handleSearch = async (params: any) => {
    setSearchParams(params);
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

  // Calcul du nombre de nuits
  const calculateNights = () => {
    if (!searchParams?.departureDate || !searchParams?.returnDate) return 1;
    const departure = new Date(searchParams.departureDate);
    const returnDate = new Date(searchParams.returnDate);
    const nights = Math.ceil((returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, nights);
  };

  const calculateTotal = () => {
    if (!selectedFlight || !selectedHotel) return { flightTotal: 0, hotelTotal: 0, total: 0 };
    const nights = calculateNights();
    const rooms = searchParams?.rooms || 1;
    const passengers = (searchParams?.adults || 1) + (searchParams?.children || 0);
    
    const flightTotal = selectedFlight.price * passengers;
    const hotelTotal = selectedHotel.price * nights * rooms;
    const total = flightTotal + hotelTotal;
    
    return { flightTotal, hotelTotal, total, nights, rooms, passengers };
  };

  const handleBooking = () => {
    if (selectedFlight && selectedHotel) {
      // Rediriger vers le processus de réservation avec les données
      const flightParam = encodeURIComponent(JSON.stringify(selectedFlight));
      const hotelParam = encodeURIComponent(JSON.stringify(selectedHotel));
      const searchParam = encodeURIComponent(JSON.stringify(searchParams));
      
      navigate(`/flight-hotel/booking?flight=${flightParam}&hotel=${hotelParam}&search=${searchParam}`);
    } else {
      toast.error("Veuillez sélectionner un vol et un hôtel");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <Navbar />
      
      <main className="flex-1">
        <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background avec overlay */}
          <LazyImage
            src={bannerFlightHotel}
            alt="Forfaits Vol + Hôtel"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>

          <div className="relative z-10 container mx-auto px-4 py-12">
            {/* Titre */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="flex justify-center mb-4">
                <Package className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                Forfaits Vol + Hôtel
              </h1>
              <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">
                Réservez votre vol et votre hébergement en un seul forfait et économisez jusqu'à 30%
              </p>
            </div>

            {/* Formulaire de recherche */}
            <div className="max-w-6xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <FlightHotelSearchForm onSearch={handleSearch} />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
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
                            <Price amount={flight.price} fromCurrency="EUR" showLoader />
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
                            <Price amount={hotel.price} fromCurrency="EUR" showLoader />
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
                    {selectedFlight && selectedHotel && searchParams && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {calculateTotal().nights} nuit{calculateTotal().nights > 1 ? "s" : ""} • {calculateTotal().passengers} passager{calculateTotal().passengers > 1 ? "s" : ""}
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
                          <p className="text-muted-foreground">
                            <Price amount={calculateTotal().flightTotal || selectedFlight.price} fromCurrency="EUR" />
                          </p>
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
                          <p className="text-muted-foreground">
                            <Price amount={calculateTotal().hotelTotal || selectedHotel.price} fromCurrency="EUR" />
                          </p>
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
                            <Price amount={calculateTotal().total} fromCurrency="EUR" showLoader />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Vol + {calculateTotal().nights} nuit{calculateTotal().nights > 1 ? "s" : ""} d'hôtel
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Sélectionnez un vol et un hôtel</p>
                      )}
                    </div>
                  </div>

                  {/* Avertissement */}
                  {selectedFlight && selectedHotel && (
                    <Alert className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
                        Les disponibilités sont vérifiées lors de la confirmation. En cas d'indisponibilité, 
                        vous serez contacté pour des alternatives équivalentes.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleBooking}
                    disabled={!selectedFlight || !selectedHotel}
                  >
                    Continuer la réservation
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightHotel;
