import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { UnifiedForm, UnifiedAutocomplete, UnifiedFormField, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ActivitySearchForm = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const guests = formData.get("guests") as string;

    if (!location) {
      return;
    }

    const params = new URLSearchParams({
      location,
      ...(date && { date: format(date, "yyyy-MM-dd") }),
      guests,
      ...(category && category !== "all" && { category }),
    });

    navigate(`/activities?${params.toString()}`);
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <UnifiedAutocomplete
            label="Destination"
            type="location"
            value={location}
            onChange={setLocation}
            placeholder="Où cherchez-vous?"
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

      <div className="mt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Catégorie</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="adventure">Aventure</SelectItem>
              <SelectItem value="culture">Culture</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="relaxation">Détente</SelectItem>
              <SelectItem value="gastronomy">Gastronomie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </UnifiedForm>
  );
};
