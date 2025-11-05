import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Search, Train } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTrainSearch } from "@/hooks/useTrainSearch";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface TrainSearchFormProps {
  onResults?: (results: any) => void;
}

export const TrainSearchForm = ({ onResults }: TrainSearchFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { searchTrains, loading } = useTrainSearch();
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [travelClass, setTravelClass] = useState("economy");

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const results = await searchTrains({
      origin,
      destination,
      departureDate: format(departureDate, "yyyy-MM-dd"),
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
      adults,
      children,
      travelClass,
    });

    if (results) {
      toast({
        title: "Recherche effectuée",
        description: `${results.trains?.length || 0} trains trouvés`,
      });
      onResults?.(results);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Train className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">{t('search.from')} / {t('search.to')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="origin">{t('search.from')}</Label>
          <Input
            id="origin"
            placeholder="Paris"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">{t('search.to')}</Label>
          <Input
            id="destination"
            placeholder="Londres"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('search.departure')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departureDate ? format(departureDate, "PP", { locale: fr }) : <span>Sélectionner</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50">
              <Calendar
                mode="single"
                selected={departureDate}
                onSelect={setDepartureDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>{t('search.return')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {returnDate ? format(returnDate, "PP", { locale: fr }) : <span>Sélectionner</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={setReturnDate}
                initialFocus
                disabled={(date) => departureDate ? date < departureDate : false}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="adults">{t('search.adults')}</Label>
          <Select value={adults.toString()} onValueChange={(v) => setAdults(parseInt(v))}>
            <SelectTrigger id="adults">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="children">{t('search.children')}</Label>
          <Select value={children.toString()} onValueChange={(v) => setChildren(parseInt(v))}>
            <SelectTrigger id="children">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Classe</Label>
          <Select value={travelClass} onValueChange={setTravelClass}>
            <SelectTrigger id="class">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">{t('search.class.economy')}</SelectItem>
              <SelectItem value="premium">{t('search.class.premium')}</SelectItem>
              <SelectItem value="business">{t('search.class.business')}</SelectItem>
              <SelectItem value="first">{t('search.class.first')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleSearch}
        disabled={loading}
        className="w-full h-10"
      >
        <Search className="mr-2 h-4 w-4 md:inline hidden" />
        <span className="truncate">{loading ? "Recherche..." : t('search.search')}</span>
      </Button>
    </div>
  );
};
