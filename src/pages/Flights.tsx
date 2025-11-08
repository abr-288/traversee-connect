import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plane, Clock, Calendar as CalendarIcon, Briefcase, Loader2, ArrowRightLeft, ArrowRight, MapPin, Search } from "lucide-react";
import { FlightBookingDialog } from "@/components/FlightBookingDialog";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { toast } from "sonner";
import { getAirlineName } from "@/utils/airlineNames";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { TravelersSelector } from "@/components/TravelersSelector";

const Flights = () => {
  const [searchParams] = useSearchParams();
  const { searchFlights, loading } = useFlightSearch();
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiFlights, setApiFlights] = useState<any[]>([]);
  const [flightSearchParams, setFlightSearchParams] = useState<{ departureDate: string; returnDate?: string } | undefined>();
  
  // Search form state
  const [tripType, setTripType] = useState<"round-trip" | "one-way">("round-trip");
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [flightDate, setFlightDate] = useState<Date>();
  const [flightReturnDate, setFlightReturnDate] = useState<Date>();
  const [flightAdults, setFlightAdults] = useState(1);
  const [flightChildren, setFlightChildren] = useState(0);
  
  // Filter states
  const [filterOrigin, setFilterOrigin] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterStops, setFilterStops] = useState("all");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("cheapest");

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const returnDate = searchParams.get("returnDate");
    const adults = searchParams.get("adults");

    if (from && to && date && adults) {
      setFlightSearchParams({
        departureDate: date,
        returnDate: returnDate || undefined
      });
      handleSearch(from, to, date, returnDate || undefined, parseInt(adults));
    }
  }, [searchParams]);

  const handleSearch = async (
    origin: string,
    destination: string,
    departureDate: string,
    returnDate?: string,
    adults: number = 1
  ) => {
    // Extract IATA code from format "City (CODE)" -> "CODE"
    const extractIataCode = (location: string) => {
      const match = location.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : location;
    };

    const result = await searchFlights({
      origin: extractIataCode(origin),
      destination: extractIataCode(destination),
      departureDate,
      returnDate,
      adults,
      travelClass: "ECONOMY"
    });

    if (result?.success && result?.data) {
      // Transform Amadeus API data to match display structure
      const transformedFlights = result.data.map((flight: any) => {
        const firstSegment = flight.itineraries?.[0]?.segments?.[0];
        const lastSegment = flight.itineraries?.[0]?.segments?.[flight.itineraries[0].segments.length - 1];
        const allSegments = flight.itineraries?.[0]?.segments || [];
        
        // Calculate number of stops
        const numberOfStops = allSegments.length - 1;
        const stopsText = numberOfStops === 0 ? 'Direct' : numberOfStops === 1 ? '1 escale' : `${numberOfStops} escales`;
        
        // Extract departure and arrival times
        const departureTime = firstSegment?.departure?.at ? new Date(firstSegment.departure.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
        const arrivalTime = lastSegment?.arrival?.at ? new Date(lastSegment.arrival.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
        
        // Get airline code and convert to name
        const airlineCode = flight.validatingAirlineCodes?.[0] || firstSegment?.carrierCode || '';
        
        // Extract price
        const price = typeof flight.price === 'object' && flight.price?.grandTotal 
          ? parseFloat(flight.price.grandTotal) * 655 // Convert EUR to FCFA
          : typeof flight.price === 'number' 
          ? flight.price 
          : parseFloat(flight.price?.total || 0) * 655;
        
        return {
          id: flight.id,
          airline: getAirlineName(airlineCode),
          airlineCode: airlineCode,
          from: `${firstSegment?.departure?.iataCode || origin}`,
          to: `${lastSegment?.arrival?.iataCode || destination}`,
          departure: departureTime,
          arrival: arrivalTime,
          duration: flight.itineraries?.[0]?.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'min') || '',
          stops: stopsText,
          price: Math.round(price),
          class: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'Économique',
          date: departureDate
        };
      });
      
      setApiFlights(transformedFlights);
      toast.success(`${transformedFlights.length} vols trouvés`);
    } else {
      toast.error("Erreur lors de la recherche de vols");
    }
  };

  const mockFlights = [
    {
      id: 1,
      airline: "Air Côte d'Ivoire",
      from: "Abidjan (ABJ)",
      to: "Paris (CDG)",
      departure: "08:30",
      arrival: "15:45",
      duration: "6h 15min",
      stops: "Direct",
      price: 450000,
      class: "Économique",
      date: "2025-11-15"
    },
    {
      id: 2,
      airline: "Air France",
      from: "Abidjan (ABJ)",
      to: "Paris (CDG)",
      departure: "23:10",
      arrival: "06:30+1",
      duration: "6h 20min",
      stops: "Direct",
      price: 520000,
      class: "Économique",
      date: "2025-11-15"
    },
    {
      id: 3,
      airline: "Ethiopian Airlines",
      from: "Abidjan (ABJ)",
      to: "Addis-Abeba (ADD)",
      departure: "20:00",
      arrival: "06:15+1",
      duration: "9h 15min",
      stops: "Direct",
      price: 380000,
      class: "Économique",
      date: "2025-11-15"
    },
    {
      id: 4,
      airline: "Brussels Airlines",
      from: "Abidjan (ABJ)",
      to: "Bruxelles (BRU)",
      departure: "23:45",
      arrival: "07:30+1",
      duration: "6h 45min",
      stops: "Direct",
      price: 495000,
      class: "Économique",
      date: "2025-11-15"
    },
    {
      id: 5,
      airline: "Air Côte d'Ivoire",
      from: "Abidjan (ABJ)",
      to: "Dakar (DSS)",
      departure: "10:15",
      arrival: "12:30",
      duration: "2h 15min",
      stops: "Direct",
      price: 185000,
      class: "Économique",
      date: "2025-11-15"
    },
    {
      id: 6,
      airline: "Turkish Airlines",
      from: "Abidjan (ABJ)",
      to: "Istanbul (IST)",
      departure: "21:30",
      arrival: "08:45+1",
      duration: "10h 15min",
      stops: "Direct",
      price: 550000,
      class: "Économique",
      date: "2025-11-15"
    }
  ];

  // Get unique airlines from flights for filter
  const availableAirlines = useMemo(() => {
    const airlines = new Set<string>();
    (apiFlights.length > 0 ? apiFlights : mockFlights).forEach(flight => {
      airlines.add(flight.airline);
    });
    return Array.from(airlines).sort();
  }, [apiFlights]);

  // Toggle airline filter
  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airline) 
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  // Toggle class filter
  const toggleClass = (flightClass: string) => {
    setSelectedClasses(prev => 
      prev.includes(flightClass) 
        ? prev.filter(c => c !== flightClass)
        : [...prev, flightClass]
    );
  };

  // Helper function to parse duration string
  const parseDuration = (duration: string): number => {
    const hours = duration.match(/(\d+)h/);
    const minutes = duration.match(/(\d+)min/);
    return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
  };

  // Helper function to parse time string
  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(s => parseInt(s.replace(/\D/g, '')));
    return hours * 60 + minutes;
  };

  // Apply filters and sorting
  const filteredAndSortedFlights = useMemo(() => {
    let result = apiFlights.length > 0 ? [...apiFlights] : [...mockFlights];

    // Apply origin filter
    if (filterOrigin.trim()) {
      result = result.filter(f => 
        f.from.toLowerCase().includes(filterOrigin.toLowerCase())
      );
    }

    // Apply destination filter
    if (filterDestination.trim()) {
      result = result.filter(f => 
        f.to.toLowerCase().includes(filterDestination.toLowerCase())
      );
    }

    // Apply stops filter
    if (filterStops !== "all") {
      if (filterStops === "direct") {
        result = result.filter(f => f.stops === "Direct");
      } else if (filterStops === "1stop") {
        result = result.filter(f => f.stops === "1 escale");
      } else if (filterStops === "2plus") {
        result = result.filter(f => {
          const match = f.stops.match(/(\d+)/);
          return match && parseInt(match[1]) >= 2;
        });
      }
    }

    // Apply price range filter
    result = result.filter(f => 
      f.price >= priceRange[0] && f.price <= priceRange[1]
    );

    // Apply airline filter
    if (selectedAirlines.length > 0) {
      result = result.filter(f => selectedAirlines.includes(f.airline));
    }

    // Apply class filter
    if (selectedClasses.length > 0) {
      result = result.filter(f => selectedClasses.includes(f.class));
    }

    // Apply sorting
    switch (sortBy) {
      case "cheapest":
        result.sort((a, b) => a.price - b.price);
        break;
      case "fastest":
        result.sort((a, b) => {
          const durationA = parseDuration(a.duration);
          const durationB = parseDuration(b.duration);
          return durationA - durationB;
        });
        break;
      case "earliest":
        result.sort((a, b) => {
          const timeA = parseTime(a.departure);
          const timeB = parseTime(b.departure);
          return timeA - timeB;
        });
        break;
      case "latest":
        result.sort((a, b) => {
          const timeA = parseTime(a.departure);
          const timeB = parseTime(b.departure);
          return timeB - timeA;
        });
        break;
    }

    return result;
  }, [apiFlights, filterOrigin, filterDestination, filterStops, priceRange, selectedAirlines, selectedClasses, sortBy]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative py-32 bg-gradient-to-r from-primary/90 to-secondary/90 overflow-hidden">
        <img 
          src="/src/assets/hero-slide-1.jpg" 
          alt="Flights" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">Recherche de vols</h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium">Trouvez les meilleurs vols au meilleur prix</p>
          </div>
          
          {/* Search Form - Opodo Style */}
          <div className="max-w-6xl mx-auto bg-background rounded-xl shadow-2xl overflow-hidden p-6">
            <div className="mb-4 flex gap-3">
              <button
                onClick={() => setTripType("round-trip")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-smooth ${
                  tripType === "round-trip"
                    ? "bg-secondary text-primary font-medium"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <ArrowRightLeft className="w-3 h-3" />
                Aller-retour
              </button>
              <button
                onClick={() => setTripType("one-way")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-smooth ${
                  tripType === "one-way"
                    ? "bg-secondary text-primary font-medium"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <ArrowRight className="w-3 h-3" />
                Aller simple
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-end gap-0 lg:gap-0 bg-background rounded-lg overflow-hidden">
              <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Départ de</label>
                <CityAutocomplete
                  placeholder="Ville ou aéroport"
                  value={flightFrom}
                  onChange={setFlightFrom}
                  className="h-10 border-0 px-0 focus-visible:ring-0"
                />
              </div>
              
              <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Arrivée à</label>
                <CityAutocomplete
                  placeholder="Ville ou aéroport"
                  value={flightTo}
                  onChange={setFlightTo}
                  className="h-10 border-0 px-0 focus-visible:ring-0"
                />
              </div>

              <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de départ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {flightDate ? format(flightDate, "dd/MM/yyyy") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                    <Calendar mode="single" selected={flightDate} onSelect={setFlightDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              {tripType === "round-trip" && (
                <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de retour</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {flightReturnDate ? format(flightReturnDate, "dd/MM/yyyy") : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                      <Calendar mode="single" selected={flightReturnDate} onSelect={setFlightReturnDate} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Passagers</label>
                <TravelersSelector
                  adults={flightAdults}
                  children={flightChildren}
                  onAdultsChange={setFlightAdults}
                  onChildrenChange={setFlightChildren}
                />
              </div>

              <Button 
                onClick={() => {
                  if (flightFrom && flightTo && flightDate) {
                    handleSearch(
                      flightFrom,
                      flightTo,
                      format(flightDate, "yyyy-MM-dd"),
                      tripType === "round-trip" && flightReturnDate ? format(flightReturnDate, "yyyy-MM-dd") : undefined,
                      flightAdults + flightChildren
                    );
                  } else {
                    toast.error("Veuillez remplir tous les champs requis");
                  }
                }}
                className="lg:w-auto w-full h-14 lg:h-16 px-8 bg-secondary text-primary hover:bg-secondary/90 text-base font-semibold gap-2 rounded-none lg:rounded-r-lg"
              >
                <Search className="w-5 h-5" />
                Rechercher
              </Button>
            </div>
          </div>
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
                  <label className="text-sm font-medium mb-2 block">Départ</label>
                  <Input 
                    placeholder="Ville ou aéroport..." 
                    value={filterOrigin}
                    onChange={(e) => setFilterOrigin(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Arrivée</label>
                  <Input 
                    placeholder="Ville ou aéroport..." 
                    value={filterDestination}
                    onChange={(e) => setFilterDestination(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Escales</label>
                  <Select value={filterStops} onValueChange={setFilterStops}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="1stop">1 escale</SelectItem>
                      <SelectItem value="2plus">2+ escales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Prix: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA
                  </label>
                  <Slider
                    min={0}
                    max={2000000}
                    step={50000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Compagnies ({selectedAirlines.length > 0 ? selectedAirlines.length : 'Toutes'})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableAirlines.map((airline) => (
                      <label key={airline} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={selectedAirlines.includes(airline)}
                          onChange={() => toggleAirline(airline)}
                        />
                        <span className="text-sm">{airline}</span>
                      </label>
                    ))}
                  </div>
                  {selectedAirlines.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => setSelectedAirlines([])}
                    >
                      Réinitialiser
                    </Button>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Classe ({selectedClasses.length > 0 ? selectedClasses.length : 'Toutes'})
                  </label>
                  <div className="space-y-2">
                    {['Économique', 'Premium Éco', 'Affaires', 'Première'].map((flightClass) => (
                      <label key={flightClass} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedClasses.includes(flightClass)}
                          onChange={() => toggleClass(flightClass)}
                        />
                        <span className="text-sm">{flightClass}</span>
                      </label>
                    ))}
                  </div>
                  {selectedClasses.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => setSelectedClasses([])}
                    >
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </aside>

          {/* Liste des vols */}
          <div className="lg:col-span-3 space-y-6">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">Recherche en cours...</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {filteredAndSortedFlights.length} vol{filteredAndSortedFlights.length > 1 ? 's' : ''} trouvé{filteredAndSortedFlights.length > 1 ? 's' : ''}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheapest">Moins cher</SelectItem>
                  <SelectItem value="fastest">Plus rapide</SelectItem>
                  <SelectItem value="earliest">Plus tôt</SelectItem>
                  <SelectItem value="latest">Plus tard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredAndSortedFlights.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg mb-2">Aucun vol trouvé</p>
                <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedFlights.map((flight, index) => (
                <Card key={flight.id || index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <Plane className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-lg">{flight.airline}</span>
                          <span className="px-2 py-1 bg-muted rounded text-xs">
                            {flight.class}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Départ</p>
                            <p className="text-2xl font-bold">{flight.departure}</p>
                            <p className="text-sm text-muted-foreground">{flight.from}</p>
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{flight.duration}</span>
                            </div>
                            <div className="w-full h-0.5 bg-gradient-to-r from-primary via-accent to-secondary mb-2"></div>
                            <span className="text-xs text-muted-foreground">{flight.stops}</span>
                          </div>

                          <div className="text-right md:text-left">
                            <p className="text-sm text-muted-foreground mb-1">Arrivée</p>
                            <p className="text-2xl font-bold">{flight.arrival}</p>
                            <p className="text-sm text-muted-foreground">{flight.to}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(flight.date).toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between border-l pl-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">À partir de</p>
                          <p className="text-3xl font-bold text-primary mb-1">
                            {flight.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">FCFA</p>
                        </div>
                        <Button size="lg" className="w-full" onClick={() => {
                          setSelectedFlight(flight);
                          setDialogOpen(true);
                        }}>
                          Sélectionner
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedFlight && (
        <FlightBookingDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          flight={selectedFlight}
          searchParams={flightSearchParams}
        />
      )}

      <Footer />
    </div>
  );
};

export default Flights;
