import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  UnifiedForm, 
  UnifiedAutocomplete,
  UnifiedDatePicker,
  UnifiedSubmitButton 
} from "@/components/forms";
import { useTranslation } from "react-i18next";

/**
 * CarSearchForm - Recherche de voitures avec UnifiedForm
 * Design premium type Rentalcars/Kayak avec identité Bossiz
 */
export const CarSearchForm = () => {
  const { t } = useTranslation();
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
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-6xl mx-auto p-4 md:p-6">
        <div className="space-y-4">
          {/* Ligne 1: Lieu de prise en charge */}
          <div className="grid grid-cols-1 gap-4">
            <UnifiedAutocomplete
              label={t("search.pickup")}
              type="location"
              value={location}
              onChange={(value) => setLocation(value)}
            placeholder={t("search.cityOrAirport")}
            required
          />
        </div>

        {/* Ligne 2: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UnifiedDatePicker
            label={t("search.pickup")}
            value={pickupDate}
            onChange={setPickupDate}
            minDate={new Date()}
            required
          />

          <UnifiedDatePicker
            label={t("search.dropoff")}
            value={returnDate}
            onChange={setReturnDate}
            minDate={pickupDate || new Date()}
            required
          />
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
