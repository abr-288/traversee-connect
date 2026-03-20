import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, MapPin, Users } from "lucide-react";
import { UnifiedForm } from "@/features/shared/components/UnifiedForm";
import { UnifiedSubmitButton } from "@/features/shared/components/UnifiedSubmitButton";
import { UnifiedAutocomplete } from "@/features/shared/components/UnifiedAutocomplete";
import { UnifiedDatePicker } from "@/features/shared/components/UnifiedDatePicker";

export const HotelSearchForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams({
      destination,
      checkIn: checkIn?.toISOString() || "",
      checkOut: checkOut?.toISOString() || "",
      guests: guests.toString(),
    });

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search">
      <div className="space-y-6">
        <UnifiedAutocomplete
          type="hotel"
          value={destination}
          onChange={setDestination}
          placeholder={t("hotels.destination")}
          icon={MapPin}
          label={t("hotels.where")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UnifiedDatePicker
            value={checkIn}
            onChange={setCheckIn}
            placeholder={t("hotels.checkIn")}
            icon={Calendar}
            label={t("hotels.checkInDate")}
            minDate={new Date()}
          />
          <UnifiedDatePicker
            value={checkOut}
            onChange={setCheckOut}
            placeholder={t("hotels.checkOut")}
            icon={Calendar}
            label={t("hotels.checkOutDate")}
            minDate={checkIn}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t("hotels.guests")}
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
          />
        </div>

        <UnifiedSubmitButton variant="search" fullWidth>
          {t("hotels.search")}
        </UnifiedSubmitButton>
      </div>
    </UnifiedForm>
  );
};
