import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plane, Search, Users, Hotel } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CityAutocomplete } from "./CityAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface FlightHotelSearchFormProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    adults: number;
    children: number;
    rooms: number;
    travelClass: string;
  }) => void;
}

export const FlightHotelSearchForm = ({ onSearch }: FlightHotelSearchFormProps) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [rooms, setRooms] = useState("1");
  const [travelClass, setTravelClass] = useState("ECONOMY");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination || !departureDate || !returnDate) {
      return;
    }

    onSearch({
      origin,
      destination,
      departureDate: format(departureDate, "yyyy-MM-dd"),
      returnDate: format(returnDate, "yyyy-MM-dd"),
      adults: parseInt(adults),
      children: parseInt(children),
      rooms: parseInt(rooms),
      travelClass,
    });
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-6xl mx-auto mb-8">
      <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Origin */}
          <div className="md:col-span-3">
            <label className="text-sm font-medium mb-2 block">
              Départ
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <CityAutocomplete
                value={origin}
                onChange={setOrigin}
                placeholder="Ville de départ"
                className="pl-10"
              />
            </div>
          </div>

          {/* Destination */}
          <div className="md:col-span-3">
            <label className="text-sm font-medium mb-2 block">
              Destination
            </label>
            <div className="relative">
              <Hotel className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <CityAutocomplete
                value={destination}
                onChange={setDestination}
                placeholder="Ville d'arrivée"
                className="pl-10"
              />
            </div>
          </div>

          {/* Departure Date */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">
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
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">
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

          {/* Passengers and Rooms */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-2 block">
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
                    <span className="text-sm">Enfants</span>
                    <Input
                      type="number"
                      min="0"
                      max="9"
                      value={children}
                      onChange={(e) => setChildren(e.target.value)}
                      className="w-20"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Chambres</span>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-2 block opacity-0">
              Rechercher
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
