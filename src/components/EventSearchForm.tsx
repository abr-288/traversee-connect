import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EventLocationAutocomplete } from "@/components/EventLocationAutocomplete";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { useEventSearch } from "@/hooks/useEventSearch";
import { useToast } from "@/hooks/use-toast";

interface EventSearchFormProps {
  onResults: (results: any) => void;
}

export const EventSearchForm = ({ onResults }: EventSearchFormProps) => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState("");
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
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <EventLocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Paris, Londres..."
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PP") : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border border-border shadow-lg z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

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
                  <SelectItem value="family">Famille</SelectItem>
                  <SelectItem value="comedy">Comédie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            {loading ? "Recherche..." : "Rechercher"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
