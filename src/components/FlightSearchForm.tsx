import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRightLeft, AlertCircle, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  UnifiedForm, 
  UnifiedAutocomplete,
  UnifiedDatePicker,
  UnifiedSubmitButton,
  FormProgressBar
} from "@/components/forms";
import { useTranslation } from "react-i18next";
import { flightSearchSchema, type FlightSearchInput } from "@/lib/validationSchemas";
import { safeValidate } from "@/lib/formHelpers";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PriceCalendar } from "@/components/flights/PriceCalendar";

/**
 * FlightSearchForm - Recherche de vols avec UnifiedForm
 * Design premium type Opodo/Booking avec identité Bossiz
 * Optimisé pour mobile
 */
export const FlightSearchForm = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"round-trip" | "one-way">("round-trip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState<"economy" | "premium_economy" | "business" | "first">("economy");
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);
  
  // État des erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation en temps réel
  useEffect(() => {
    if (Object.keys(touched).length === 0) return;

    const formData: FlightSearchInput = {
      origin: from || "",
      destination: to || "",
      departureDate: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
      adults,
      children,
      infants,
      travelClass,
      tripType,
    };

    const validation = safeValidate(flightSearchSchema, formData);
    
    if (!validation.success) {
      const filteredErrors: Record<string, string> = {};
      Object.keys(validation.errors).forEach(key => {
        if (touched[key]) {
          filteredErrors[key] = validation.errors[key];
        }
      });
      setErrors(filteredErrors);
    } else {
      const clearedErrors = { ...errors };
      Object.keys(touched).forEach(key => {
        delete clearedErrors[key];
      });
      setErrors(clearedErrors);
    }
  }, [from, to, departureDate, returnDate, adults, children, infants, travelClass, tripType, touched]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      origin: true,
      destination: true,
      departureDate: true,
      returnDate: tripType === "round-trip",
      adults: true,
      children: true,
      infants: true,
      travelClass: true,
      tripType: true,
    });

    const formData: FlightSearchInput = {
      origin: from,
      destination: to,
      departureDate: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : undefined,
      adults,
      children,
      infants,
      travelClass,
      tripType,
    };

    const validation = safeValidate(flightSearchSchema, formData);

    if (!validation.success) {
      setErrors(validation.errors);
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      
      const firstErrorField = Object.keys(validation.errors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const params = new URLSearchParams({
      from: validation.data.origin,
      to: validation.data.destination,
      date: validation.data.departureDate,
      ...(validation.data.returnDate && { returnDate: validation.data.returnDate }),
      adults: validation.data.adults.toString(),
      children: validation.data.children.toString(),
      infants: validation.data.infants.toString(),
      class: validation.data.travelClass,
    });

    navigate(`/flights?${params.toString()}`);
  };

  const hasErrors = Object.keys(errors).length > 0;

  const totalFields = tripType === "round-trip" ? 7 : 6;
  const completedFields = [
    from,
    to,
    departureDate,
    tripType === "round-trip" ? returnDate : true,
    adults > 0,
    travelClass,
  ].filter(Boolean).length;

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="max-w-5xl mx-auto">
      {/* Barre de progression - Compacte */}
      <FormProgressBar 
        totalFields={totalFields} 
        completedFields={completedFields}
        className="mb-2 sm:mb-3"
      />

      {/* Alert d'erreur générale */}
      {hasErrors && (
        <Alert variant="destructive" className="mb-2 sm:mb-3 py-2">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">
            Veuillez corriger les erreurs dans le formulaire
          </AlertDescription>
        </Alert>
      )}

      {/* Trip Type Selector - Compact */}
      <div className="flex gap-1.5 mb-2 sm:mb-3">
        {[
          { value: "round-trip", label: t("search.roundTrip") },
          { value: "one-way", label: t("search.oneWay") }
        ].map(({ value, label }) => (
          <motion.button
            key={value}
            type="button"
            onClick={() => {
              setTripType(value as "round-trip" | "one-way");
              handleBlur("tripType");
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex-1 sm:flex-none px-2.5 sm:px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm",
              "border touch-target",
              tripType === value
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-foreground border-border hover:border-primary/50"
            )}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Origin & Destination - Compact */}
      <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2">
        {/* From */}
        <div className="sm:col-span-5">
          <UnifiedAutocomplete
            label={t("search.departure")}
            type="airport"
            value={from}
            onChange={(value) => {
              setFrom(value);
              handleBlur("origin");
            }}
            placeholder={t("search.cityOrAirport")}
            required
            className={cn("h-9 text-sm", errors.origin && touched.origin ? "border-destructive" : "")}
          />
          {errors.origin && touched.origin && (
            <p className="text-[10px] text-destructive mt-0.5">{errors.origin}</p>
          )}
        </div>

        {/* Swap Button */}
        <div className="sm:col-span-2 flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="h-8 w-8 rounded-full border hover:border-primary hover:bg-primary/5 transition-all sm:mt-5"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* To */}
        <div className="sm:col-span-5">
          <UnifiedAutocomplete
            label={t("search.to")}
            type="airport"
            value={to}
            onChange={(value) => {
              setTo(value);
              handleBlur("destination");
            }}
            placeholder={t("search.cityOrAirport")}
            required
            className={cn("h-9 text-sm", errors.destination && touched.destination ? "border-destructive" : "")}
          />
          {errors.destination && touched.destination && (
            <p className="text-[10px] text-destructive mt-0.5">{errors.destination}</p>
          )}
        </div>
      </div>

      {/* Dates - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        <div>
          <UnifiedDatePicker
            label={t("search.departure")}
            placeholder={t("flights.departureDate")}
            value={departureDate}
            onChange={(date) => {
              setDepartureDate(date);
              handleBlur("departureDate");
            }}
            minDate={new Date()}
            required
          />
          {errors.departureDate && touched.departureDate && (
            <p className="text-[10px] text-destructive mt-0.5">{errors.departureDate}</p>
          )}
        </div>

        {tripType === "round-trip" && (
          <div>
            <UnifiedDatePicker
              label={t("search.return")}
              placeholder={t("flights.returnDate")}
              value={returnDate}
              onChange={(date) => {
                setReturnDate(date);
                handleBlur("returnDate");
              }}
              minDate={departureDate || new Date()}
              required
            />
            {errors.returnDate && touched.returnDate && (
              <p className="text-[10px] text-destructive mt-0.5">{errors.returnDate}</p>
            )}
          </div>
        )}
      </div>

      {/* Passengers & Class - Compact grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
        <div className="space-y-1">
          <label className="text-[10px] sm:text-xs font-medium text-foreground">
            {t("search.adults")}
          </label>
          <Select 
            value={adults.toString()} 
            onValueChange={(value) => {
              setAdults(parseInt(value));
              handleBlur("adults");
            }}
          >
            <SelectTrigger className={cn("h-9 text-xs", errors.adults && touched.adults && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] sm:text-xs font-medium text-foreground">{t("search.children")}</label>
          <Select 
            value={children.toString()} 
            onValueChange={(value) => {
              setChildren(parseInt(value));
              handleBlur("children");
            }}
          >
            <SelectTrigger className={cn("h-9 text-xs", errors.children && touched.children && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] sm:text-xs font-medium text-foreground">Bébés</label>
          <Select 
            value={infants.toString()} 
            onValueChange={(value) => {
              setInfants(parseInt(value));
              handleBlur("infants");
            }}
          >
            <SelectTrigger className={cn("h-9 text-xs", errors.infants && touched.infants && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] sm:text-xs font-medium text-foreground">{t("search.class.title")}</label>
          <Select 
            value={travelClass} 
            onValueChange={(value) => {
              setTravelClass(value as typeof travelClass);
              handleBlur("travelClass");
            }}
          >
            <SelectTrigger className={cn("h-9 text-xs", errors.travelClass && touched.travelClass && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">{t("search.class.economy")}</SelectItem>
              <SelectItem value="premium_economy">{t("search.class.premium")}</SelectItem>
              <SelectItem value="business">{t("search.class.business")}</SelectItem>
              <SelectItem value="first">{t("search.class.first")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparateur de prix - Compact */}
      {departureDate && (
        <div className="mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPriceCalendar(!showPriceCalendar)}
            className="w-full sm:w-auto h-8 text-xs"
          >
            <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
            {showPriceCalendar ? "Masquer" : "Comparer"} les prix
          </Button>
        </div>
      )}

      {/* Calendrier de comparaison des prix */}
      {showPriceCalendar && departureDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 overflow-hidden"
        >
          <PriceCalendar
            departureDate={format(departureDate, "yyyy-MM-dd")}
            onDateSelect={(dateStr) => {
              setDepartureDate(new Date(dateStr));
              handleBlur("departureDate");
            }}
            lowestPrice={250}
            viewMode="week"
          />
        </motion.div>
      )}

      {/* Submit Button - Compact */}
      <div className="mt-3">
        <UnifiedSubmitButton 
          variant="search"
          disabled={hasErrors}
          className={cn("w-full h-10 text-sm", hasErrors && "opacity-50 cursor-not-allowed")}
        >
          {t("search.search")}
        </UnifiedSubmitButton>
      </div>
    </UnifiedForm>
  );
};