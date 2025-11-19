import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageBanner } from "@/components/PageBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plane, Clock, Calendar as CalendarIcon, Briefcase, Loader2, ArrowRightLeft, ArrowRight, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { FlightBookingDialog } from "@/components/FlightBookingDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { toast } from "sonner";
import { getAirlineName } from "@/utils/airlineNames";
import { Pagination } from "@/components/Pagination";

const Flights = () => {
  const [searchParams] = useSearchParams();
  const { searchFlights, loading } = useFlightSearch();
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiFlights, setApiFlights] = useState<any[]>([]);
  const [flightSearchParams, setFlightSearchParams] = useState<{ departureDate: string; returnDate?: string } | undefined>();
  
  // Filter states
  const [filterOrigin, setFilterOrigin] = useState("");
  const [filterDestination, setFilterDestination] = useState("");
  const [filterStops, setFilterStops] = useState("all");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("cheapest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const mappedFlights = result.data.map((flight: any) => ({
        id: flight.id,
        airline: getAirlineName(flight.validatingAirlineCodes?.[0] || "XX"),
        airlineCode: flight.validatingAirlineCodes?.[0] || "XX",
        from: origin,
        to: destination,
        departureTime: new Date(flight.itineraries[0].segments[0].departure.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        arrivalTime: new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        duration: flight.itineraries[0].duration,
        stops: flight.itineraries[0].segments.length - 1,
        price: parseFloat(flight.price.total),
        class: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY",
        bookingClass: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class || "M",
        departureDate: flight.itineraries[0].segments[0].departure.at,
        returnDate: flight.itineraries[1] ? flight.itineraries[1].segments[0].departure.at : undefined,
        segments: flight.itineraries[0].segments,
        returnSegments: flight.itineraries[1]?.segments,
        rawData: flight
      }));
      setApiFlights(mappedFlights);
    } else {
      toast.error("Aucun vol trouvé pour cette recherche");
    }
  };

  const filteredFlights = useMemo(() => {
    return apiFlights.filter(flight => {
      const matchesPrice = flight.price >= priceRange[0] && flight.price <= priceRange[1];
      const matchesOrigin = !filterOrigin || flight.from.toLowerCase().includes(filterOrigin.toLowerCase());
      const matchesDestination = !filterDestination || flight.to.toLowerCase().includes(filterDestination.toLowerCase());
      const matchesStops = filterStops === "all" || 
        (filterStops === "direct" && flight.stops === 0) ||
        (filterStops === "1-stop" && flight.stops === 1) ||
        (filterStops === "2+-stops" && flight.stops >= 2);
      const matchesAirline = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline);
      const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(flight.class);

      return matchesPrice && matchesOrigin && matchesDestination && matchesStops && matchesAirline && matchesClass;
    });
  }, [apiFlights, priceRange, filterOrigin, filterDestination, filterStops, selectedAirlines, selectedClasses]);

  const sortedFlights = useMemo(() => {
    const flights = [...filteredFlights];
    
    switch (sortBy) {
      case "cheapest":
        return flights.sort((a, b) => a.price - b.price);
      case "fastest":
        return flights.sort((a, b) => {
          const durationA = parseInt(a.duration.replace(/[PT HM]/g, ""));
          const durationB = parseInt(b.duration.replace(/[PT HM]/g, ""));
          return durationA - durationB;
        });
      case "earliest":
        return flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      case "latest":
        return flights.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
      default:
        return flights;
    }
  }, [filteredFlights, sortBy]);

  const paginatedFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedFlights.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedFlights, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedFlights.length / itemsPerPage);

  const availableAirlines = useMemo(() => {
    return Array.from(new Set(apiFlights.map(f => f.airline)));
  }, [apiFlights]);

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]
    );
  };

  const toggleClass = (flightClass: string) => {
    setSelectedClasses(prev =>
      prev.includes(flightClass) ? prev.filter(c => c !== flightClass) : [...prev, flightClass]
    );
  };

  const formatDuration = (duration: string) => {
    const hours = duration.match(/(\d+)H/)?.[1] || "0";
    const minutes = duration.match(/(\d+)M/)?.[1] || "0";
    return `${hours}h${minutes.padStart(2, '0')}`;
  };

  const handleBookFlight = (flight: any) => {
    setSelectedFlight(flight);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />
      
      <PageBanner 
        title="Rechercher des vols"
        subtitle="Comparez et réservez les meilleurs vols aux meilleurs prix"
        backgroundImage="https://images.unsplash.com/photo-1436491865332-7a61a109cc05"
        defaultTab="flight"
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Filtres Desktop */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filtres
                  </h3>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Origine</label>
                  <Input 
                    placeholder="Ville de départ..." 
                    value={filterOrigin}
                    onChange={(e) => setFilterOrigin(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Destination</label>
                  <Input 
                    placeholder="Ville d'arrivée..." 
                    value={filterDestination}
                    onChange={(e) => setFilterDestination(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Prix (FCFA): {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                  </label>
                  <Slider
                    min={0}
                    max={5000000}
                    step={50000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Escales</label>
                  <Select value={filterStops} onValueChange={setFilterStops}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="1-stop">1 escale</SelectItem>
                      <SelectItem value="2+-stops">2+ escales</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map((flightClass) => (
                      <label key={flightClass} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedClasses.includes(flightClass)}
                          onChange={() => toggleClass(flightClass)}
                        />
                        <span className="text-sm">{flightClass.replace('_', ' ')}</span>
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
              </CardContent>
            </Card>
          </aside>

          {/* Liste des vols */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Mobile Filters Button */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Origine</label>
                      <Input 
                        placeholder="Ville de départ..." 
                        value={filterOrigin}
                        onChange={(e) => setFilterOrigin(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Destination</label>
                      <Input 
                        placeholder="Ville d'arrivée..." 
                        value={filterDestination}
                        onChange={(e) => setFilterDestination(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        Prix (FCFA): {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                      </label>
                      <Slider
                        min={0}
                        max={5000000}
                        step={50000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Escales</label>
                      <Select value={filterStops} onValueChange={setFilterStops}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="1-stop">1 escale</SelectItem>
                          <SelectItem value="2+-stops">2+ escales</SelectItem>
                        </SelectContent>
                      </Select>
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
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Classe ({selectedClasses.length > 0 ? selectedClasses.length : 'Toutes'})
                      </label>
                      <div className="space-y-2">
                        {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map((flightClass) => (
                          <label key={flightClass} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="rounded"
                              checked={selectedClasses.includes(flightClass)}
                              onChange={() => toggleClass(flightClass)}
                            />
                            <span className="text-sm">{flightClass.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Barre de tri et résultats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recherche en cours...
                  </span>
                ) : (
                  <span>{sortedFlights.length} vol{sortedFlights.length > 1 ? 's' : ''} trouvé{sortedFlights.length > 1 ? 's' : ''}</span>
                )}
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Trier par:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cheapest">Prix croissant</SelectItem>
                    <SelectItem value="fastest">Durée</SelectItem>
                    <SelectItem value="earliest">Départ tôt</SelectItem>
                    <SelectItem value="latest">Départ tard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Liste des vols */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : paginatedFlights.length === 0 ? (
              <Card className="p-8 text-center">
                <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucun vol trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos critères de recherche ou vos filtres
                </p>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedFlights.map((flight) => (
                    <Card key={flight.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                          {/* Compagnie */}
                          <div className="flex items-center gap-3 lg:w-32">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Plane className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{flight.airline}</p>
                              <p className="text-xs text-muted-foreground">{flight.airlineCode}</p>
                            </div>
                          </div>

                          {/* Itinéraire */}
                          <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                            <div className="text-left">
                              <p className="text-2xl font-bold">{flight.departureTime}</p>
                              <p className="text-sm text-muted-foreground truncate">{flight.from}</p>
                            </div>
                            
                            <div className="flex flex-col items-center px-2 min-w-[100px]">
                              <p className="text-xs text-muted-foreground mb-1">{formatDuration(flight.duration)}</p>
                              <div className="flex items-center gap-2 w-full">
                                <div className="h-px bg-border flex-1" />
                                <Plane className="w-4 h-4 text-muted-foreground" />
                                <div className="h-px bg-border flex-1" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {flight.stops === 0 ? 'Direct' : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold">{flight.arrivalTime}</p>
                              <p className="text-sm text-muted-foreground truncate">{flight.to}</p>
                            </div>
                          </div>

                          {/* Prix et réservation */}
                          <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 lg:w-40 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-6">
                            <div className="text-left lg:text-right">
                              <p className="text-2xl font-bold text-primary">{flight.price.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">FCFA</p>
                            </div>
                            <Button 
                              onClick={() => handleBookFlight(flight)}
                              className="w-full lg:w-auto"
                            >
                              Réserver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <FlightBookingDialog
        flight={selectedFlight}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        searchParams={flightSearchParams}
      />
    </div>
  );
};

export default Flights;
