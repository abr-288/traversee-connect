import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { UnifiedForm, UnifiedFormField, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";

export const TourSearchForm = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const destination = formData.get("destination") as string;
    const guests = formData.get("guests") as string;
    const duration = formData.get("duration") as string;

    if (!destination) {
      return;
    }

    const params = new URLSearchParams({
      destination,
      ...(date && { date: format(date, "yyyy-MM-dd") }),
      guests,
      ...(duration && { duration }),
    });

    navigate(`/tours?${params.toString()}`);
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <UnifiedFormField
            label="Destination"
            name="destination"
            placeholder="Où voulez-vous aller?"
            icon={MapPin}
            required
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedDatePicker
            label="Date de départ"
            value={date}
            onChange={setDate}
            minDate={new Date()}
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedFormField
            label="Voyageurs"
            name="guests"
            type="number"
            defaultValue="2"
            min={1}
            max={20}
          />
        </div>

        <div className="md:col-span-1 flex items-end">
          <UnifiedSubmitButton fullWidth>
            Rechercher
          </UnifiedSubmitButton>
        </div>
      </div>
    </UnifiedForm>
  );
};
