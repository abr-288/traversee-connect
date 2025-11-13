import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { HotelAutocomplete } from "./HotelAutocomplete";
import { TravelersSelector } from "./TravelersSelector";

export const HotelSearchForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !checkIn || !checkOut) {
      return;
    }

    const params = new URLSearchParams({
      destination,
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString(),
    });

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-6xl mx-auto">
      <div className="bg-background rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-end gap-0">
          {/* Destination */}
          <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Destination
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <HotelAutocomplete
                value={destination}
                onChange={setDestination}
                placeholder="Ville, région ou pays"
                className="border-0 px-0 focus-visible:ring-0 h-10"
              />
            </div>
          </div>

          {/* Check-in */}
          <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Arrivée
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "dd MMM yyyy", { locale: fr }) : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
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

          {/* Check-out */}
          <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Départ
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 justify-start text-left font-normal px-0 hover:bg-transparent",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "dd MMM yyyy", { locale: fr }) : "Sélectionner"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
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

          {/* Voyageurs et Chambres */}
          <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-border">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Voyageurs & Chambres
            </label>
            <TravelersSelector
              adults={adults}
              children={children}
              rooms={rooms}
              onAdultsChange={setAdults}
              onChildrenChange={setChildren}
              onRoomsChange={setRooms}
              showRooms
            />
          </div>

          {/* Search Button */}
          <div className="lg:w-auto w-full">
            <Button 
              type="submit"
              className="w-full h-12 lg:h-16 px-6 md:px-8 bg-secondary text-primary hover:bg-secondary/90 text-base font-semibold gap-2 rounded-none lg:rounded-r-xl"
            >
              <Search className="w-5 h-5" />
              Rechercher
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
