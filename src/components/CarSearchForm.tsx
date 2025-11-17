import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  UnifiedForm, 
  UnifiedAutocomplete,
  UnifiedDatePicker,
  UnifiedSubmitButton 
} from "@/components/forms";

/**
 * CarSearchForm - Recherche de voitures avec UnifiedForm
 * Design premium type Rentalcars/Kayak avec identité Bossiz
 */
export const CarSearchForm = () => {
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
    <UnifiedForm onSubmit={handleSearch} variant="search" className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Location */}
        <div className="md:col-span-3">
          <UnifiedAutocomplete
            label="Lieu de prise en charge"
            type="location"
            value={location}
            onChange={(value) => setLocation(value)}
            placeholder="Ville ou aéroport"
            required
          />
        </div>

        {/* Pickup Date */}
        <div className="md:col-span-2">
          <UnifiedDatePicker
            label="Prise en charge"
            value={pickupDate}
            onChange={setPickupDate}
            minDate={new Date()}
            required
          />
        </div>

        {/* Return Date */}
        <div className="md:col-span-2">
          <UnifiedDatePicker
            label="Retour"
            value={returnDate}
            onChange={setReturnDate}
            minDate={pickupDate || new Date()}
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <UnifiedSubmitButton variant="search">
          Rechercher des voitures
        </UnifiedSubmitButton>
      </div>
    </UnifiedForm>
  );
};
