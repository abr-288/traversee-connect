import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Clock, ArrowRight, Plane } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlightBookingDialog } from "@/components/FlightBookingDialog";
import { getAirlineName } from "@/utils/airlineNames";

interface MappedFlight {
  id: string;
  airline: string;
  airlineCode: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  travelClass: string;
  departureDate?: string;
  returnDate?: string;
  raw: any;
}

const Flights = () => {
  const [searchParams] = useSearchParams();
  const { searchFlights, loading, error } = useFlightSearch();
  const [flights, setFlights] = useState<MappedFlight[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<MappedFlight | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const returnDate = searchParams.get("returnDate") || undefined;
    const adults = parseInt(searchParams.get("adults") || "1", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const travelClass = searchParams.get("class") || "ECONOMY";

    if (!from || !to || !date || Number.isNaN(adults)) {
      return;
    }

    const runSearch = async () => {
      setHasSearched(true);
      const result = await searchFlights({
        origin: from,
        destination: to,
        departureDate: date,
        returnDate,
        adults,
        children: Number.isNaN(children) ? 0 : children,
        travelClass,
      });

      if (result?.success && Array.isArray(result.data)) {
        const mapped: MappedFlight[] = result.data.map((offer: any) => {
          const firstItinerary = offer.itineraries?.[0];
          const segments = firstItinerary?.segments || [];
          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1] || firstSegment;

          const airlineCode = offer.validatingAirlineCodes?.[0] || "XX";
          const airline = getAirlineName(airlineCode);

          const priceTotal =
            typeof offer.price === "object" && offer.price?.total
              ? parseFloat(offer.price.total)
              : typeof offer.price === "number"
              ? offer.price
              : 0;

          const cabin =
            offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ||
            travelClass ||
            "ECONOMY";

          return {
            id: offer.id || Math.random().toString(),
            airline,
            airlineCode,
            from,
            to,
            departureTime: firstSegment?.departure?.at || "",
            arrivalTime: lastSegment?.arrival?.at || "",
            duration: firstItinerary?.duration || "",
            stops: segments.length > 0 ? segments.length - 1 : 0,
            price: Math.round(priceTotal),
            travelClass: cabin,
            departureDate: date,
            returnDate,
            raw: offer,
          };
        });

        setFlights(mapped);
      } else {
        setFlights([]);
      }
    };

    runSearch();
  }, [searchParams, searchFlights]);

  const handleBook = (flight: MappedFlight) => {
    setSelectedFlight(flight);
    setDialogOpen(true);
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "";
    const hours = duration.match(/(\d+)H/)?.[1] || "0";
    const minutes = duration.match(/(\d+)M/)?.[1] || "0";
    return `${hours}h${minutes.padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section with Background */}
        <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05" 
              alt="Vol" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-12">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                Rechercher des vols
              </h1>
              <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">
                Comparez et réservez les meilleurs vols aux meilleurs prix
              </p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <FlightSearchForm />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <section className="container mx-auto px-4 py-10">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Recherche des meilleurs vols...</span>
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-destructive">Une erreur est survenue lors de la recherche de vols.</p>
          )}

          {!loading && !error && !hasSearched && (
            <p className="text-center text-muted-foreground">
              Utilisez le formulaire ci-dessus pour lancer une recherche de vols.
            </p>
          )}

          {!loading && hasSearched && flights.length === 0 && !error && (
            <p className="text-center text-muted-foreground">
              Aucun vol trouvé pour cette recherche. Essayez d&apos;ajuster vos dates ou votre destination.
            </p>
          )}

          {!loading && flights.length > 0 && (
            <div className="space-y-4">
              {flights.map((flight) => (
                <Card key={flight.id} className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Plane className="w-5 h-5 text-primary" />
                        <span>{flight.airline}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {flight.from} 
                        <ArrowRight className="inline w-4 h-4 mx-1" />
                        {flight.to} • {flight.travelClass}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {flight.price.toLocaleString()} FCFA
                      </div>
                      <p className="text-xs text-muted-foreground">par passager</p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-lg font-semibold">{formatTime(flight.departureTime)}</div>
                        <p className="text-xs text-muted-foreground">Départ</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{formatTime(flight.arrivalTime)}</div>
                        <p className="text-xs text-muted-foreground">Arrivée</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(flight.duration)}</span>
                        <span>• {flight.stops === 0 ? "Direct" : `${flight.stops} escale(s)`}</span>
                      </div>
                    </div>

                    <Button onClick={() => handleBook(flight)} className="w-full md:w-auto">
                      Réserver ce vol
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />

      {selectedFlight && (
        <FlightBookingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          flight={{
            id: selectedFlight.id,
            airline: selectedFlight.airline,
            from: selectedFlight.from,
            to: selectedFlight.to,
            departure: selectedFlight.departureTime,
            arrival: selectedFlight.arrivalTime,
            price: selectedFlight.price,
            class: selectedFlight.travelClass,
            departureDate: selectedFlight.departureDate,
            returnDate: selectedFlight.returnDate,
          }}
          searchParams={{
            departureDate: selectedFlight.departureDate || "",
            returnDate: selectedFlight.returnDate,
          }}
        />
      )}
    </div>
  );
};

export default Flights;
