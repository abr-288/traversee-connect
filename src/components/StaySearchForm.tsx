import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const StaySearchForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [type, setType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination) {
      return;
    }

    const params = new URLSearchParams({
      destination,
      ...(checkIn && { checkIn: format(checkIn, "yyyy-MM-dd") }),
      ...(checkOut && { checkOut: format(checkOut, "yyyy-MM-dd") }),
      guests,
      ...(type && { type }),
    });

    navigate(`/stays?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-6xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Où souhaitez-vous séjourner?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Arrivée
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "dd MMM", { locale: fr }) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Départ
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "dd MMM", { locale: fr }) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < (checkIn || new Date())}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Voyageurs
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="md:col-span-1 flex items-end">
            <Button type="submit" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
