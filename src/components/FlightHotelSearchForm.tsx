import { useState } from "react";
import { Plane, Hotel, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { UnifiedForm, UnifiedAutocomplete, UnifiedDatePicker, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [travelClass, setTravelClass] = useState("ECONOMY");

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination || !departureDate || !returnDate) {
      return;
    }

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const adults = parseInt(formData.get("adults") as string);
    const children = parseInt(formData.get("children") as string);
    const rooms = parseInt(formData.get("rooms") as string);

    onSearch({
      origin,
      destination,
      departureDate: format(departureDate, "yyyy-MM-dd"),
      returnDate: format(returnDate, "yyyy-MM-dd"),
      adults,
      children,
      rooms,
      travelClass,
    });
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-6xl mx-auto mb-8 p-4 md:p-6">
      <div className="space-y-4">
        {/* Ligne 1: Origine et Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <UnifiedAutocomplete
              label="Départ"
              value={origin}
              onChange={setOrigin}
              placeholder="Ville de départ"
              type="airport"
              required
            />
          </div>

          <div className="relative">
            <UnifiedAutocomplete
              label="Destination"
              value={destination}
              onChange={setDestination}
              placeholder="Ville d'arrivée"
              type="airport"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex"
              aria-label="Échanger origine et destination"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ligne 2: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UnifiedDatePicker
            label="Date de départ"
            value={departureDate}
            onChange={setDepartureDate}
            required
            minDate={new Date()}
          />
          
          <UnifiedDatePicker
            label="Date de retour"
            value={returnDate}
            onChange={setReturnDate}
            required
            minDate={departureDate || new Date()}
          />
        </div>

        {/* Ligne 3: Voyageurs et Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <UnifiedFormField
            label="Adultes"
            name="adults"
            type="number"
            defaultValue="1"
            min={1}
            max={9}
            required
          />
          <UnifiedFormField
            label="Enfants"
            name="children"
            type="number"
            defaultValue="0"
            min={0}
            max={9}
          />
          <UnifiedFormField
            label="Chambres"
            name="rooms"
            type="number"
            defaultValue="1"
            min={1}
            max={9}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Classe</label>
            <Select value={travelClass} onValueChange={setTravelClass}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ECONOMY">Économique</SelectItem>
                <SelectItem value="PREMIUM_ECONOMY">Économique Premium</SelectItem>
                <SelectItem value="BUSINESS">Affaires</SelectItem>
                <SelectItem value="FIRST">Première</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bouton de recherche */}
        <div className="pt-2">
          <UnifiedSubmitButton fullWidth>
            Rechercher Vol + Hôtel
          </UnifiedSubmitButton>
        </div>
      </div>
    </UnifiedForm>
  );
};
