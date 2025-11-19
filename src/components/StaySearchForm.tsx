import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { UnifiedForm, UnifiedFormField, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const StaySearchForm = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [type, setType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const destination = formData.get("destination") as string;
    const guests = formData.get("guests") as string;

    if (!destination) {
      return;
    }

    const params = new URLSearchParams({
      destination,
      ...(checkIn && { checkIn: format(checkIn, "yyyy-MM-dd") }),
      ...(checkOut && { checkOut: format(checkOut, "yyyy-MM-dd") }),
      guests,
      ...(type && { type }),
    });

    navigate(`/stays?${params.toString()}`);
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <UnifiedFormField
            label="Destination"
            name="destination"
            placeholder="Où souhaitez-vous séjourner?"
            icon={MapPin}
            required
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedDatePicker
            label="Arrivée"
            value={checkIn}
            onChange={setCheckIn}
            minDate={new Date()}
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedDatePicker
            label="Départ"
            value={checkOut}
            onChange={setCheckOut}
            minDate={checkIn || new Date()}
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

      <div className="mt-4">
        <Label>Type d'hébergement</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="hotel">Hôtel</SelectItem>
            <SelectItem value="apartment">Appartement</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="resort">Resort</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </UnifiedForm>
  );
};
