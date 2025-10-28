import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plane, Clock, Calendar, Briefcase, Loader2 } from "lucide-react";
import { BookingDialog } from "@/components/BookingDialog";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { toast } from "sonner";

const Flights = () => {
  const [searchParams] = useSearchParams();
  const { searchFlights, loading } = useFlightSearch();
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiFlights, setApiFlights] = useState<any[]>([]);

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const returnDate = searchParams.get("returnDate");
    const adults = searchParams.get("adults");

    if (from && to && date && adults) {
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
    const result = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      travelClass: "ECONOMY"
    });

    if (result?.success && result?.data) {
      setApiFlights(result.data);
      toast.success(`${result.data.length} vols trouvés`);
    } else {
      toast.error("Erreur lors de la recherche de vols");
    }
  };

  const flights = [
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Recherche de Vols</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Filtres</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Départ</label>
                  <Input placeholder="Ville ou aéroport..." />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Arrivée</label>
                  <Input placeholder="Ville ou aéroport..." />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Escales</label>
                  <Select>
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
                  <label className="text-sm font-medium mb-2 block">Compagnies</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Air Côte d'Ivoire</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Air France</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Ethiopian Airlines</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Brussels Airlines</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Classe</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Économique</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Premium Éco</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Affaires</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Première</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full">Appliquer les filtres</Button>
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
                {apiFlights.length > 0 ? apiFlights.length : flights.length} vols trouvés
              </p>
              <Select defaultValue="cheapest">
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

            <div className="space-y-4">
              {(apiFlights.length > 0 ? apiFlights : flights).map((flight, index) => (
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
                          setSelectedFlight({
                            id: flight.id.toString(),
                            name: `${flight.airline} - ${flight.from} → ${flight.to}`,
                            price_per_unit: flight.price,
                            currency: "FCFA",
                            type: "flight"
                          });
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
          </div>
        </div>
      </main>

      {selectedFlight && (
        <BookingDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          service={selectedFlight}
        />
      )}

      <Footer />
    </div>
  );
};

export default Flights;
