import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, TrendingUp, Plane } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { FlightBookingDialog } from "@/components/FlightBookingDialog";
import { getAirlineName } from "@/utils/airlineNames";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceCalendar } from "@/components/flights/PriceCalendar";
import { FlightFilters } from "@/components/flights/FlightFilters";
import { FlightCard } from "@/components/flights/FlightCard";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import bannerFlights from "@/assets/banner-flights.jpg";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchFlights, loading, error } = useFlightSearch();
  const [flights, setFlights] = useState<MappedFlight[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters state
  const [baggageHandCount, setBaggageHandCount] = useState(0);
  const [baggageCheckCount, setBaggageCheckCount] = useState(0);
  const [stopsFilter, setStopsFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("best");

  const departureDate = searchParams.get("date") || "";

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const returnDate = searchParams.get("returnDate") || undefined;
    const adults = parseInt(searchParams.get("adults") || "1", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const travelClass = searchParams.get("class") || "ECONOMY";

    // Validation stricte incluant les chaînes vides
    if (!from || from.trim() === '' || !to || to.trim() === '' || !date || Number.isNaN(adults)) {
      console.error('Paramètres de recherche invalides:', { from, to, date, adults });
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
            typeof offer.price === "object" && (offer.price?.grandTotal || offer.price?.total)
              ? parseFloat(offer.price.grandTotal || offer.price.total)
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
            duration: firstItinerary?.duration || "N/A",
            stops: segments.length - 1,
            price: priceTotal,
            travelClass: cabin,
            departureDate: date,
            returnDate,
            raw: offer,
          };
        });

        setFlights(mapped);
      }
    };

    runSearch();
  }, [searchParams, searchFlights]);

  const handleBook = (flight: MappedFlight) => {
    const adaptedFlight = {
      ...flight,
      departure: flight.departureTime,
      arrival: flight.arrivalTime,
      class: flight.travelClass,
    };
    setSelectedFlight(adaptedFlight as any);
    setDialogOpen(true);
  };

  const handleDateSelect = (newDate: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", newDate);
    setSearchParams(params);
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (!match) return 0;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  };

  // Filter and sort flights
  const filteredAndSortedFlights = flights
    .filter((flight) => {
      // Stops filter
      if (stopsFilter === "direct" && flight.stops !== 0) return false;
      if (stopsFilter === "1stop" && flight.stops > 1) return false;
      if (stopsFilter === "2stops" && flight.stops > 2) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "cheapest") return a.price - b.price;
      if (sortBy === "fastest") {
        const durationA = parseDuration(a.duration);
        const durationB = parseDuration(b.duration);
        return durationA - durationB;
      }
      // "best" = combination of price and duration
      return (a.price / 100 + parseDuration(a.duration)) - (b.price / 100 + parseDuration(b.duration));
    });

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      {/* Hero Section with Search Form */}
      <div className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
        <LazyImage
          src={bannerFlights}
          alt="Recherche de vols"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <Plane className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">Recherche de vols</h1>
            <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto">
              Trouvez les meilleurs prix pour votre voyage
            </p>
          </div>
          {hasSearched && (
            <div className="flex justify-center mb-6">
              <Link to={`/flight-comparison?${searchParams.toString()}`}>
                <Button variant="secondary" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Comparer les prix
                </Button>
              </Link>
            </div>
          )}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <FlightSearchForm />
          </div>
        </div>
      </div>

      {/* Price Calendar */}
      {hasSearched && departureDate && flights.length > 0 && (
        <PriceCalendar
          departureDate={departureDate}
          onDateSelect={handleDateSelect}
          currency="XOF"
          lowestPrice={Math.min(...flights.map(f => f.price))}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {!hasSearched && !loading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Utilisez le formulaire ci-dessus pour rechercher des vols
              </p>
            </div>
          )}

          {hasSearched && !loading && filteredAndSortedFlights.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Aucun vol trouvé pour cette recherche</p>
            </div>
          )}

          {hasSearched && !loading && filteredAndSortedFlights.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_300px] gap-6">
              {/* Left Sidebar - Filters */}
              <aside className="hidden lg:block">
                <FlightFilters
                  baggageHandCount={baggageHandCount}
                  baggageCheckCount={baggageCheckCount}
                  stopsFilter={stopsFilter}
                  onBaggageHandChange={setBaggageHandCount}
                  onBaggageCheckChange={setBaggageCheckCount}
                  onStopsFilterChange={setStopsFilter}
                />
              </aside>

              {/* Main Content - Results */}
              <main className="space-y-4">
                {/* Sort Tabs */}
                <Tabs value={sortBy} onValueChange={setSortBy}>
                  <TabsList className="w-full justify-start bg-card border border-border h-auto p-0">
                    <TabsTrigger 
                      value="best" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">Le meilleur</span>
                        <span className="text-xs text-muted-foreground">
                          {filteredAndSortedFlights[0]?.price.toLocaleString()} XOF · {filteredAndSortedFlights[0]?.duration}
                        </span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="cheapest"
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">Le moins cher</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.min(...filteredAndSortedFlights.map(f => f.price)).toLocaleString()} XOF
                        </span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="fastest"
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">Le plus court</span>
                        <span className="text-xs text-muted-foreground">
                          {filteredAndSortedFlights.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration))[0]?.duration}
                        </span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Flight Cards */}
                <div className="space-y-3">
                  {filteredAndSortedFlights.map((flight) => (
                    <FlightCard
                      key={flight.id}
                      airline={flight.airline}
                      airlineCode={flight.airlineCode}
                      departureTime={flight.departureTime}
                      arrivalTime={flight.arrivalTime}
                      departureAirport={flight.from}
                      arrivalAirport={flight.to}
                      duration={flight.duration}
                      stops={flight.stops}
                      price={flight.price}
                      currency="XOF"
                      onSelect={() => handleBook(flight)}
                    />
                  ))}
                </div>
              </main>

              {/* Right Sidebar - Ads */}
              <aside className="hidden xl:block">
                <div className="sticky top-6 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">✈️</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-primary-foreground">
                    Le forfait de voyage ultime
                  </h3>
                  <p className="text-sm text-primary-foreground/80 mb-4">
                    La Garantie B-Reserve offre des solutions instantanées aux perturbations, une assistance continue et des services de voyage automatisés.
                  </p>
                  <button className="px-4 py-2 bg-card hover:bg-card/90 text-foreground rounded-lg text-sm font-medium transition-colors">
                    En savoir plus
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {selectedFlight && (
        <FlightBookingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          flight={selectedFlight}
        />
      )}
    </div>
  );
};

export default Flights;
