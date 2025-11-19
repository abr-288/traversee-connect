import { useState } from "react";
import { format } from "date-fns";
import { useEventSearch } from "@/hooks/useEventSearch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedForm, UnifiedAutocomplete, UnifiedDatePicker, UnifiedSubmitButton } from "@/components/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface EventSearchFormProps {
  onResults: (results: any) => void;
}

export const EventSearchForm = ({ onResults }: EventSearchFormProps) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [category, setCategory] = useState("all");
  const { searchEvents, loading } = useEventSearch();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      toast({
        title: t("errors.generic"),
        description: t("search.location"),
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
        title: t("common.success"),
        description: `${results.events?.length || 0} ${t("search.results")}`,
      });
    } else {
      toast({
        title: t("errors.generic"),
        description: t("errors.networkError"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <UnifiedForm onSubmit={handleSearch} variant="search" loading={loading}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <UnifiedAutocomplete
              label={t("search.location")}
              type="location"
              value={location}
              onChange={setLocation}
              placeholder={t("search.cityOrAirport")}
              required
            />

            <UnifiedDatePicker
              label={t("search.date")}
              value={date}
              onChange={setDate}
              minDate={new Date()}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="category">{t("search.category")}</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t("search.allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("search.allCategories")}</SelectItem>
                  <SelectItem value="music">Musique</SelectItem>
                  <SelectItem value="sports">Sport</SelectItem>
                  <SelectItem value="theater">Théâtre</SelectItem>
                  <SelectItem value="comedy">Comédie</SelectItem>
                  <SelectItem value="family">Famille</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <UnifiedSubmitButton loading={loading} fullWidth className="mt-6">
            {t("search.search")}
          </UnifiedSubmitButton>
        </UnifiedForm>
      </CardContent>
    </Card>
  );
};
