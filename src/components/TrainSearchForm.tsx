import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Train } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { UnifiedForm, UnifiedAutocomplete, UnifiedDatePicker, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TrainSearchForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [travelClass, setTravelClass] = useState("economy");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination || !departureDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const adults = parseInt(formData.get("adults") as string);
    const children = parseInt(formData.get("children") as string);

    // Navigate to trains page with search params
    const searchParams = new URLSearchParams({
      from: origin,
      to: destination,
      date: format(departureDate, "yyyy-MM-dd"),
      adults: adults.toString(),
      children: children.toString(),
      class: travelClass,
    });

    if (returnDate) {
      searchParams.append("returnDate", format(returnDate, "yyyy-MM-dd"));
    }

    navigate(`/trains?${searchParams.toString()}`);
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Train className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">{t('search.from')} / {t('search.to')}</h2>
      </div>

      <UnifiedForm onSubmit={handleSearch} variant="search">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UnifiedAutocomplete
              label={t('search.from')}
              value={origin}
              onChange={setOrigin}
              placeholder="Paris"
              type="city"
              required
            />
            <UnifiedAutocomplete
              label={t('search.to')}
              value={destination}
              onChange={setDestination}
              placeholder="Londres"
              type="city"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UnifiedDatePicker
              label={t('search.departure')}
              value={departureDate}
              onChange={setDepartureDate}
              required
              minDate={new Date()}
            />
            <UnifiedDatePicker
              label={t('search.return')}
              value={returnDate}
              onChange={setReturnDate}
              minDate={departureDate || new Date()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <UnifiedFormField
              label="Adultes"
              name="adults"
              type="number"
              defaultValue="1"
              min={1}
              max={9}
              required
            />
            <UnifiedFormField
              label="Enfants"
              name="children"
              type="number"
              defaultValue="0"
              min={0}
              max={9}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Classe</label>
              <Select value={travelClass} onValueChange={setTravelClass}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Économique</SelectItem>
                  <SelectItem value="business">Affaires</SelectItem>
                  <SelectItem value="first">Première</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <UnifiedSubmitButton loading={loading} fullWidth className="mt-6">
            Rechercher des trains
          </UnifiedSubmitButton>
        </div>
      </UnifiedForm>
    </div>
  );
};
