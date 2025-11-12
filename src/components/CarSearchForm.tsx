import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CarLocationAutocomplete } from "@/components/CarLocationAutocomplete";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const CarSearchForm = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location || !pickupDate || !returnDate) {
      return;
    }

    const params = new URLSearchParams({
      location,
      pickupDate: format(pickupDate, "yyyy-MM-dd"),
      returnDate: format(returnDate, "yyyy-MM-dd"),
    });

    navigate(`/cars?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Lieu
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <CarLocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Ville ou aéroport"
                className="pl-10"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Prise en charge
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !pickupDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{pickupDate ? format(pickupDate, "dd MMM", { locale: fr }) : "Date"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={pickupDate}
                  onSelect={setPickupDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Retour
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !returnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{returnDate ? format(returnDate, "dd MMM", { locale: fr }) : "Date"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  disabled={(date) => date < (pickupDate || new Date())}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-1 flex items-end">
            <Button type="submit" className="w-full h-10">
              <Search className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Rechercher</span>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
