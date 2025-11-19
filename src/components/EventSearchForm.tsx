import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useEventSearch } from "@/hooks/useEventSearch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedForm, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";
import { EventLocationAutocomplete } from "@/components/EventLocationAutocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EventSearchFormProps {
  onResults: (results: any) => void;
}

export const EventSearchForm = ({ onResults }: EventSearchFormProps) => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState("all");
  const { searchEvents, loading } = useEventSearch();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une localisation",
        variant: "destructive",
      });
      return;
    }

    const results = await searchEvents({
      location: location.trim(),
      date: date ? format(date, "yyyy-MM-dd") : undefined,
      category: category && category !== "all" ? category : undefined,
    });

    if (results?.success) {
      onResults(results);
      toast({
        title: "Recherche réussie",
        description: `${results.events?.length || 0} événements trouvés`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de rechercher les événements",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <UnifiedForm onSubmit={handleSearch} variant="search" loading={loading}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <EventLocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Paris, Londres..."
              />
            </div>

            <UnifiedDatePicker
              label="Date"
              value={date}
              onChange={setDate}
              minDate={new Date()}
            />

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  <SelectItem value="music">Musique</SelectItem>
                  <SelectItem value="sports">Sport</SelectItem>
                  <SelectItem value="theater">Théâtre</SelectItem>
                  <SelectItem value="comedy">Comédie</SelectItem>
                  <SelectItem value="family">Famille</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <UnifiedSubmitButton loading={loading} fullWidth className="mt-4">
            Rechercher des événements
          </UnifiedSubmitButton>
        </UnifiedForm>
      </CardContent>
    </Card>
  );
};
