import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRightLeft } from "lucide-react";
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
import { useTranslation } from "react-i18next";

/**
 * FlightSearchForm - Recherche de vols avec UnifiedForm
 * Design premium type Opodo/Booking avec identité Bossiz
 */
export const FlightSearchForm = () => {
  const { t } = useTranslation();
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
          { value: "roundtrip", label: t("search.roundTrip") },
          { value: "oneway", label: t("search.oneWay") }
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
            label={t("search.departure")}
            type="airport"
            value={from}
            onChange={(value) => setFrom(value)}
            placeholder={t("search.cityOrAirport")}
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
            label={t("search.to")}
            type="airport"
            value={to}
            onChange={(value) => setTo(value)}
            placeholder={t("search.cityOrAirport")}
            required
          />
        </div>

        {/* Departure Date */}
        <div className="md:col-span-2">
          <UnifiedDatePicker
            label={t("search.departure")}
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
              label={t("search.return")}
              value={returnDate}
              onChange={setReturnDate}
              minDate={departureDate || new Date()}
              required
            />
          </div>
        )}
      </div>

      {/* Passengers & Class */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("search.adults")}
          </label>
          <Select value={adults} onValueChange={setAdults}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num > 1 ? t("search.adults").toLowerCase() : t("search.adults").toLowerCase().slice(0, -1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("search.children")}</label>
          <Select value={children} onValueChange={setChildren}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

      {/* Submit Button */}
      <div className="mt-6">
        <UnifiedSubmitButton variant="search">
          {t("search.search")}
        </UnifiedSubmitButton>
      </div>
    </UnifiedForm>
  );
};
