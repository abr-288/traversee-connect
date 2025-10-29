import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CityAutocomplete } from "./CityAutocomplete";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface FlightLeg {
  id: string;
  from: string;
  to: string;
  date?: Date;
}

interface MultiCityFlightFormProps {
  onSearch: (legs: FlightLeg[]) => void;
}

export const MultiCityFlightForm = ({ onSearch }: MultiCityFlightFormProps) => {
  const [legs, setLegs] = useState<FlightLeg[]>([
    { id: "1", from: "", to: "", date: undefined },
    { id: "2", from: "", to: "", date: undefined }
  ]);

  const addLeg = () => {
    if (legs.length < 5) {
      setLegs([...legs, { id: Date.now().toString(), from: "", to: "", date: undefined }]);
    }
  };

  const removeLeg = (id: string) => {
    if (legs.length > 2) {
      setLegs(legs.filter(leg => leg.id !== id));
    }
  };

  const updateLeg = (id: string, field: keyof FlightLeg, value: any) => {
    setLegs(legs.map(leg => leg.id === id ? { ...leg, [field]: value } : leg));
  };

  return (
    <div className="space-y-4">
      {legs.map((leg, index) => (
        <div key={leg.id} className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-border rounded-lg bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Départ</label>
                <CityAutocomplete
                  placeholder="Ville de départ"
                  value={leg.from}
                  onChange={(value) => updateLeg(leg.id, "from", value)}
                  className="h-12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Arrivée</label>
              <CityAutocomplete
                placeholder="Destination"
                value={leg.to}
                onChange={(value) => updateLeg(leg.id, "to", value)}
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {leg.date ? format(leg.date, "PPP", { locale: fr }) : "Date du vol"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={leg.date} 
                    onSelect={(date) => updateLeg(leg.id, "date", date)} 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {legs.length > 2 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeLeg(leg.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      
      {legs.length < 5 && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={addLeg}
        >
          <Plus className="w-4 h-4" />
          Ajouter un vol (max 5)
        </Button>
      )}
      
      <Button 
        onClick={() => onSearch(legs)}
        className="w-full md:w-auto px-4 md:px-8 h-12 gradient-primary shadow-primary text-base md:text-lg"
        disabled={legs.some(leg => !leg.from || !leg.to || !leg.date)}
      >
        <span className="truncate">Rechercher vols multi-destinations</span>
      </Button>
    </div>
  );
};
