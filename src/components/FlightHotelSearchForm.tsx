import { useState } from "react";
import { Plane, Hotel, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { UnifiedForm, UnifiedAutocomplete, UnifiedDatePicker, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
              label={t("search.departure")}
              value={origin}
              onChange={setOrigin}
              placeholder={t("search.cityOrAirport")}
              type="airport"
              required
            />
          </div>

          <div className="relative">
            <UnifiedAutocomplete
              label={t("search.destination")}
              value={destination}
              onChange={setDestination}
              placeholder={t("search.cityOrAirport")}
              type="airport"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex"
              aria-label={t("search.from")}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Ligne 2: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UnifiedDatePicker
            label={t("search.departure")}
            value={departureDate}
            onChange={setDepartureDate}
            required
            minDate={new Date()}
          />
          
          <UnifiedDatePicker
            label={t("search.return")}
            value={returnDate}
            onChange={setReturnDate}
            required
            minDate={departureDate || new Date()}
          />
        </div>

        {/* Ligne 3: Voyageurs et Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <UnifiedFormField
            label={t("search.adults")}
            name="adults"
            type="number"
            defaultValue="1"
            min={1}
            max={9}
            required
          />
          <UnifiedFormField
            label={t("search.children")}
            name="children"
            type="number"
            defaultValue="0"
            min={0}
            max={9}
          />
          <UnifiedFormField
            label={t("search.rooms")}
            name="rooms"
            type="number"
            defaultValue="1"
            min={1}
            max={9}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("search.class.title")}</label>
            <Select value={travelClass} onValueChange={setTravelClass}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ECONOMY">{t("search.class.economy")}</SelectItem>
                <SelectItem value="PREMIUM_ECONOMY">{t("search.class.premium")}</SelectItem>
                <SelectItem value="BUSINESS">{t("search.class.business")}</SelectItem>
                <SelectItem value="FIRST">{t("search.class.first")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bouton de recherche */}
        <div className="pt-2">
          <UnifiedSubmitButton fullWidth>
            {t("search.search")}
          </UnifiedSubmitButton>
        </div>
      </div>
    </UnifiedForm>
  );
};
