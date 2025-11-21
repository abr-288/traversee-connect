import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRightLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  UnifiedForm, 
  UnifiedAutocomplete,
  UnifiedDatePicker,
  UnifiedSubmitButton 
} from "@/components/forms";
import { useTranslation } from "react-i18next";
import { flightSearchSchema, type FlightSearchInput } from "@/lib/validationSchemas";
import { safeValidate } from "@/lib/formHelpers";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * FlightSearchForm - Recherche de vols avec UnifiedForm
 * Design premium type Opodo/Booking avec identité Bossiz
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

    // Validation complète mais on ne garde que les erreurs des champs touchés
    const validation = safeValidate(flightSearchSchema, formData);
    
    if (!validation.success) {
      // Ne garder que les erreurs des champs touchés
      const filteredErrors: Record<string, string> = {};
      Object.keys(validation.errors).forEach(key => {
        if (touched[key]) {
          filteredErrors[key] = validation.errors[key];
        }
      });
      setErrors(filteredErrors);
    } else {
      // Clear errors for touched fields
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
    
    // Marquer tous les champs comme touchés
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

    // Validation complète avant soumission
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
      
      // Scroll vers la première erreur
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

  return (
    <UnifiedForm onSubmit={handleSearch} variant="search" className="max-w-6xl mx-auto">
      {/* Alert d'erreur générale */}
      {hasErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veuillez corriger les erreurs dans le formulaire
          </AlertDescription>
        </Alert>
      )}

      {/* Trip Type Selector */}
      <div className="flex gap-3 mb-6">
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "px-6 py-2.5 rounded-xl font-semibold transition-all duration-200",
              "border-2",
              tripType === value
                ? "bg-primary text-white border-primary shadow-lg"
                : "bg-white text-foreground border-border hover:border-primary/50"
            )}
          >
            {label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* From */}
        <div className="md:col-span-3">
          <div className="space-y-1">
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
              className={errors.origin && touched.origin ? "border-destructive" : ""}
            />
            {errors.origin && touched.origin && (
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                {errors.origin}
              </p>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex items-center justify-center pt-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="h-12 w-12 rounded-full border-2 hover:border-primary hover:bg-primary/5 transition-all shadow-md"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* To */}
        <div className="md:col-span-3">
          <div className="space-y-1">
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
              className={errors.destination && touched.destination ? "border-destructive" : ""}
            />
            {errors.destination && touched.destination && (
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                {errors.destination}
              </p>
            )}
          </div>
        </div>

        {/* Departure Date */}
        <div className="md:col-span-2">
          <div className="space-y-1">
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
              <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                {errors.departureDate}
              </p>
            )}
          </div>
        </div>

        {/* Return Date */}
        {tripType === "round-trip" && (
          <div className="md:col-span-2">
            <div className="space-y-1">
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
                <p className="text-xs text-destructive mt-1 animate-in slide-in-from-top-1">
                  {errors.returnDate}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Passengers & Class */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("search.adults")}
          </label>
          <Select 
            value={adults.toString()} 
            onValueChange={(value) => {
              setAdults(parseInt(value));
              handleBlur("adults");
            }}
          >
            <SelectTrigger className={cn("h-11", errors.adults && touched.adults && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num > 1 ? t("search.adults").toLowerCase() : t("search.adults").toLowerCase().slice(0, -1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.adults && touched.adults && (
            <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors.adults}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("search.children")}</label>
          <Select 
            value={children.toString()} 
            onValueChange={(value) => {
              setChildren(parseInt(value));
              handleBlur("children");
            }}
          >
            <SelectTrigger className={cn("h-11", errors.children && touched.children && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.children && touched.children && (
            <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors.children}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Bébés (0-2 ans)</label>
          <Select 
            value={infants.toString()} 
            onValueChange={(value) => {
              setInfants(parseInt(value));
              handleBlur("infants");
            }}
          >
            <SelectTrigger className={cn("h-11", errors.infants && touched.infants && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.infants && touched.infants && (
            <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors.infants}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("search.class.title")}</label>
          <Select 
            value={travelClass} 
            onValueChange={(value) => {
              setTravelClass(value as typeof travelClass);
              handleBlur("travelClass");
            }}
          >
            <SelectTrigger className={cn("h-11", errors.travelClass && touched.travelClass && "border-destructive")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">{t("search.class.economy")}</SelectItem>
              <SelectItem value="premium_economy">{t("search.class.premium")}</SelectItem>
              <SelectItem value="business">{t("search.class.business")}</SelectItem>
              <SelectItem value="first">{t("search.class.first")}</SelectItem>
            </SelectContent>
          </Select>
          {errors.travelClass && touched.travelClass && (
            <p className="text-xs text-destructive animate-in slide-in-from-top-1">{errors.travelClass}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <UnifiedSubmitButton 
          variant="search"
          disabled={hasErrors}
          className={hasErrors ? "opacity-50 cursor-not-allowed" : ""}
        >
          {t("search.search")}
        </UnifiedSubmitButton>
      </div>
    </UnifiedForm>
  );
};
