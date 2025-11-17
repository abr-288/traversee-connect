import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  UnifiedForm, 
  UnifiedAutocomplete,
  UnifiedDatePicker,
  UnifiedPassengerSelector,
  UnifiedSubmitButton 
} from "@/components/forms";

/**
 * HotelSearchForm - Recherche d'hôtels avec UnifiedForm
 * Design premium type Booking/Hotels.com avec identité Bossiz
 */
export const HotelSearchForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [passengers, setPassengers] = useState({
    adults: 2,
    children: 0,
    rooms: 1,
    infants: 0
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !checkIn || !checkOut) {
      return;
    }

    const params = new URLSearchParams({
      destination,
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      adults: passengers.adults.toString(),
      children: passengers.children.toString(),
      rooms: passengers.rooms?.toString() || "1",
    });

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Destination */}
        <div className="lg:col-span-4">
          <UnifiedAutocomplete
            label="Destination"
            type="hotel"
            value={destination}
            onChange={(value) => setDestination(value)}
            placeholder="Ville, région ou pays"
            required
          />
        </div>

        {/* Check-in */}
        <div className="lg:col-span-3">
          <UnifiedDatePicker
            label="Arrivée"
            value={checkIn}
            onChange={setCheckIn}
            minDate={new Date()}
            required
          />
        </div>

        {/* Check-out */}
        <div className="lg:col-span-3">
          <UnifiedDatePicker
            label="Départ"
            value={checkOut}
            onChange={setCheckOut}
            minDate={checkIn || new Date()}
            required
          />
        </div>

        {/* Guests & Rooms */}
        <div className="lg:col-span-2">
          <UnifiedPassengerSelector
            label="Voyageurs"
            value={passengers}
            onChange={(value) => setPassengers({ ...value, infants: value.infants || 0 })}
            showRooms
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <UnifiedSubmitButton variant="search">
          Rechercher des hôtels
        </UnifiedSubmitButton>
      </div>
    </UnifiedForm>
  );
};
