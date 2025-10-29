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

export const ActivitySearchForm = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [category, setCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      return;
    }

    const params = new URLSearchParams({
      location,
      ...(date && { date: format(date, "yyyy-MM-dd") }),
      guests,
      ...(category && { category }),
    });

    navigate(`/activities?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-5xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Où cherchez-vous?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd MMM", { locale: fr }) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Participants
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
