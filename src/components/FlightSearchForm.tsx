import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plane, Search, Users, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CityAutocomplete } from "./CityAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const FlightSearchForm = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [travelClass, setTravelClass] = useState("ECONOMY");

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!from || !to || !departureDate) {
      return;
    }

    const params = new URLSearchParams({
      from,
      to,
      date: format(departureDate, "yyyy-MM-dd"),
      ...(tripType === "roundtrip" && returnDate && { returnDate: format(returnDate, "yyyy-MM-dd") }),
      adults,
      children,
      class: travelClass,
    });

    navigate(`/flights?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-6xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6">
        {/* Trip Type Selector */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setTripType("roundtrip")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              tripType === "roundtrip"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Aller-retour
          </button>
          <button
            type="button"
            onClick={() => setTripType("oneway")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              tripType === "oneway"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Aller simple
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* From */}
          <div className="md:col-span-3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Départ
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <CityAutocomplete
                value={from}
                onChange={setFrom}
                placeholder="Ville ou aéroport"
                className="pl-10"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-end justify-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="mb-0"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* To */}
          <div className="md:col-span-3">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Arrivée
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90" />
              <CityAutocomplete
                value={to}
                onChange={setTo}
                placeholder="Ville ou aéroport"
                className="pl-10"
              />
            </div>
          </div>

          {/* Departure Date */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Départ
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !departureDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "dd MMM", { locale: fr }) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Return Date */}
          {tripType === "roundtrip" && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Retour
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "dd MMM", { locale: fr }) : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => date < (departureDate || new Date())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Passengers */}
          <div className={tripType === "roundtrip" ? "md:col-span-1" : "md:col-span-2"}>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Voyageurs
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {parseInt(adults) + parseInt(children)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Adultes</span>
                    <Input
                      type="number"
                      min="1"
                      max="9"
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      className="w-20"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enfants (0-11 ans)</span>
                    <Input
                      type="number"
                      min="0"
                      max="9"
                      value={children}
                      onChange={(e) => setChildren(e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <div className={tripType === "roundtrip" ? "md:col-span-1" : "md:col-span-2"}>
            <label className="text-sm font-medium text-gray-700 mb-2 block opacity-0">
              Search
            </label>
            <Button type="submit" className="w-full h-10">
              <Search className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Rechercher</span>
            </Button>
          </div>
        </div>

        {/* Class Selector */}
        <div className="mt-4">
          <Select value={travelClass} onValueChange={setTravelClass}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ECONOMY">Économique</SelectItem>
              <SelectItem value="PREMIUM_ECONOMY">Économique Premium</SelectItem>
              <SelectItem value="BUSINESS">Affaires</SelectItem>
              <SelectItem value="FIRST">Première Classe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  );
};
