import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, MapPin, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UnifiedForm } from "@/features/shared/components/UnifiedForm";
import { UnifiedSubmitButton } from "@/features/shared/components/UnifiedSubmitButton";
import { UnifiedAutocomplete } from "@/features/shared/components/UnifiedAutocomplete";
import { UnifiedDatePicker } from "@/features/shared/components/UnifiedDatePicker";
import { UnifiedPassengerSelector } from "@/features/shared/components/UnifiedPassengerSelector";

export const FlightSearchForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate: departureDate?.toISOString() || "",
      tripType,
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      infants: passengers.infants.toString(),
    });

    if (tripType === "roundtrip" && returnDate) {
      params.append("returnDate", returnDate.toISOString());
    }

    navigate(`/flights?${params.toString()}`);
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search">
      <div className="space-y-6">
        <RadioGroup
          value={tripType}
          onValueChange={(value) => setTripType(value as "roundtrip" | "oneway")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="roundtrip" id="roundtrip" />
            <Label htmlFor="roundtrip" className="cursor-pointer">
              {t("flights.roundtrip")}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oneway" id="oneway" />
            <Label htmlFor="oneway" className="cursor-pointer">
              {t("flights.oneway")}
            </Label>
          </div>
        </RadioGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UnifiedAutocomplete
            type="airport"
            value={origin}
            onChange={setOrigin}
            placeholder={t("flights.from")}
            icon={MapPin}
            label={t("flights.departure")}
          />
          <UnifiedAutocomplete
            type="airport"
            value={destination}
            onChange={setDestination}
            placeholder={t("flights.to")}
            icon={MapPin}
            label={t("flights.arrival")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UnifiedDatePicker
            value={departureDate}
            onChange={setDepartureDate}
            placeholder={t("flights.departureDate")}
            icon={Calendar}
            label={t("flights.departure")}
            minDate={new Date()}
          />
          {tripType === "roundtrip" && (
            <UnifiedDatePicker
              value={returnDate}
              onChange={setReturnDate}
              placeholder={t("flights.returnDate")}
              icon={Calendar}
              label={t("flights.return")}
              minDate={departureDate}
            />
          )}
        </div>

        <UnifiedPassengerSelector
          value={passengers}
          onChange={setPassengers}
          icon={Users}
          label={t("flights.passengers")}
        />

        <UnifiedSubmitButton variant="search" fullWidth>
          {t("flights.search")}
        </UnifiedSubmitButton>
      </div>
    </UnifiedForm>
  );
};
