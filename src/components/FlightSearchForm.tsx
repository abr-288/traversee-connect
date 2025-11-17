import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRightLeft, Plane } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  UnifiedForm, 
  UnifiedAutocomplete,
  UnifiedDatePicker,
  UnifiedSubmitButton 
} from "@/components/forms";

/**
 * FlightSearchForm - Recherche de vols avec UnifiedForm
 * Design premium type Opodo/Booking avec identité Bossiz
 */
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
    <UnifiedForm onSubmit={handleSearch} variant="search" className="max-w-6xl mx-auto">
      {/* Trip Type Selector */}
      <div className="flex gap-3 mb-6">
        {[
          { value: "roundtrip", label: "Aller-retour" },
          { value: "oneway", label: "Aller simple" }
        ].map(({ value, label }) => (
          <motion.button
            key={value}
            type="button"
            onClick={() => setTripType(value as "roundtrip" | "oneway")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "px-6 py-2.5 rounded-xl font-semibold transition-all duration-200",
              "border-2",
              tripType === value
                ? "bg-primary text-white border-primary shadow-lg"
                : "bg-white text-foreground border-border hover:border-primary/50"
            )}
          >
            {label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* From */}
        <div className="md:col-span-3">
          <UnifiedAutocomplete
            label="Départ"
            type="airport"
            value={from}
            onChange={(value) => setFrom(value)}
            placeholder="Ville ou aéroport"
            required
          />
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex items-end justify-center pb-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="h-12 w-12 rounded-full border-2 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* To */}
        <div className="md:col-span-3">
          <UnifiedAutocomplete
            label="Arrivée"
            type="airport"
            value={to}
            onChange={(value) => setTo(value)}
            placeholder="Ville ou aéroport"
            required
          />
        </div>

        {/* Departure Date */}
        <div className="md:col-span-2">
          <UnifiedDatePicker
            label="Départ"
            value={departureDate}
            onChange={setDepartureDate}
            minDate={new Date()}
            required
          />
        </div>

        {/* Return Date */}
        {tripType === "roundtrip" && (
          <div className="md:col-span-2">
            <UnifiedDatePicker
              label="Retour"
              value={returnDate}
              onChange={setReturnDate}
              minDate={departureDate || new Date()}
              required
            />
          </div>
        )}
      </div>

      {/* Passengers & Class */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            Adultes
          </label>
          <Select value={adults} onValueChange={setAdults}>
            <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} adulte{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Enfants</label>
          <Select value={children} onValueChange={setChildren}>
            <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} enfant{num > 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Classe</label>
          <Select value={travelClass} onValueChange={setTravelClass}>
            <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors">
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

      {/* Submit Button */}
      <div className="mt-6">
        <UnifiedSubmitButton variant="search">
          Rechercher des vols
        </UnifiedSubmitButton>
      </div>
    </UnifiedForm>
  );
};
