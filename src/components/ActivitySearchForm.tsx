import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { UnifiedForm, UnifiedFormField, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const ActivitySearchForm = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const location = formData.get("location") as string;
    const guests = formData.get("guests") as string;

    if (!location) {
      return;
    }

    const params = new URLSearchParams({
      location,
      ...(date && { date: format(date, "yyyy-MM-dd") }),
      guests,
      ...(category && { category }),
    });

    navigate(`/activities?${params.toString()}`);
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <UnifiedFormField
            label="Destination"
            name="location"
            placeholder="Où cherchez-vous?"
            icon={MapPin}
            required
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedDatePicker
            label="Date"
            value={date}
            onChange={setDate}
            minDate={new Date()}
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedFormField
            label="Participants"
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
        <Label>Catégorie</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes catégories</SelectItem>
            <SelectItem value="adventure">Aventure</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="relaxation">Détente</SelectItem>
            <SelectItem value="gastronomy">Gastronomie</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </UnifiedForm>
  );
};
