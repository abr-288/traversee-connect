import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { UnifiedForm, UnifiedAutocomplete, UnifiedFormField, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export const StaySearchForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [type, setType] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const guests = formData.get("guests") as string;

    if (!destination) {
      return;
    }

    const params = new URLSearchParams({
      destination,
      ...(checkIn && { checkIn: format(checkIn, "yyyy-MM-dd") }),
      ...(checkOut && { checkOut: format(checkOut, "yyyy-MM-dd") }),
      guests,
      ...(type && type !== "all" && { type }),
    });

    navigate(`/stays?${params.toString()}`);
  };

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <UnifiedAutocomplete
            label={t("search.destination")}
            type="location"
            value={destination}
            onChange={setDestination}
            placeholder={t("search.location")}
            required
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedDatePicker
            label={t("search.checkIn")}
            value={checkIn}
            onChange={setCheckIn}
            minDate={new Date()}
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedDatePicker
            label={t("search.checkOut")}
            value={checkOut}
            onChange={setCheckOut}
            minDate={checkIn || new Date()}
          />
        </div>

        <div className="md:col-span-1">
          <UnifiedFormField
            label={t("search.guests")}
            name="guests"
            type="number"
            defaultValue="2"
            min={1}
            max={20}
          />
        </div>

        <div className="md:col-span-1 flex items-end">
          <UnifiedSubmitButton fullWidth>
            {t("search.search")}
          </UnifiedSubmitButton>
        </div>
      </div>

      <div className="mt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("search.type")}</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t("search.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allCategories")}</SelectItem>
              <SelectItem value="hotel">Hôtel</SelectItem>
              <SelectItem value="apartment">Appartement</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </UnifiedForm>
  );
};
