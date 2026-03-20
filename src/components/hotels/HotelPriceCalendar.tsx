import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingDown, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWeekend, getDay, getMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface HotelPriceCalendarProps {
  checkInDate: string;
  prices?: Record<string, number>;
  currency?: string;
  onDateSelect: (date: string) => void;
  basePrice?: number;
  viewMode?: "week" | "month";
}

/**
 * Génère un prix d'hôtel simulé basé sur des règles réalistes
 * Les prix d'hôtels varient selon:
 * - Jour de la semaine (week-end + cher)
 * - Saison (haute saison = été + vacances)
 * - Demande (jours fériés, événements)
 */
const generateHotelPrice = (date: Date, basePrice: number): number => {
  const dayOfWeek = getDay(date);
  const month = getMonth(date);
  const isWeekendDay = isWeekend(date);
  
  // Prix de base pour un hôtel
  let price = basePrice;
  
  // Week-end: +30-50% (les hôtels sont plus chers le week-end)
  if (isWeekendDay) {
    price *= 1.3 + Math.random() * 0.2;
  }
  
  // Vendredi soir: +20% (début de week-end)
  if (dayOfWeek === 5) {
    price *= 1.2;
  }
  
  // Mardi/Mercredi: -15-20% (jours les moins chers pour hôtels)
  if (dayOfWeek === 2 || dayOfWeek === 3) {
    price *= 0.8 - Math.random() * 0.05;
  }
  
  // Haute saison (été: juin, juillet, août)
  if (month >= 5 && month <= 7) {
    price *= 1.4 + Math.random() * 0.2;
  }
  
  // Vacances de Noël/Nouvel An (décembre)
  if (month === 11) {
    price *= 1.5 + Math.random() * 0.1;
  }
  
  // Basse saison (janvier, février, novembre)
  if (month === 0 || month === 1 || month === 10) {
    price *= 0.7 + Math.random() * 0.1;
  }
  
  // Variation aléatoire ±15% pour simuler la disponibilité
  price *= 0.85 + Math.random() * 0.3;
  
  return Math.round(price);
};

export const HotelPriceCalendar = ({ 
  checkInDate, 
  prices = {}, 
  currency = "€", 
  onDateSelect, 
  basePrice = 120,
  viewMode: initialViewMode = "week"
}: HotelPriceCalendarProps) => {
  const baseDate = parseISO(checkInDate);
  const [currentMonth, setCurrentMonth] = useState(baseDate);
  const [viewMode, setViewMode] = useState<"week" | "month">(initialViewMode);

  // Génération des prix avec cache
  const pricesWithDefaults = useMemo(() => {
    const result: Record<string, number> = { ...prices };
    
    if (viewMode === "week") {
      const weekDates = Array.from({ length: 7 }, (_, i) => addDays(baseDate, i - 3));
      weekDates.forEach(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (!result[dateStr]) {
          result[dateStr] = generateHotelPrice(date, basePrice);
        }
      });
    } else {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const monthDates = eachDayOfInterval({ start, end });
      
      monthDates.forEach(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (!result[dateStr]) {
          result[dateStr] = generateHotelPrice(date, basePrice);
        }
      });
    }
    
    return result;
  }, [viewMode, baseDate, currentMonth, prices, basePrice]);

  // Calcul du meilleur prix et prix moyen
  const priceStats = useMemo(() => {
    const priceValues = Object.values(pricesWithDefaults);
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
    return { min, max, avg };
  }, [pricesWithDefaults]);

  // Fonction pour obtenir la couleur selon le prix
  const getPriceColor = (price: number) => {
    const { min, max } = priceStats;
    const range = max - min;
    const position = (price - min) / range;
    
    if (position < 0.33) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
    if (position < 0.66) return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800";
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
  };

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  if (viewMode === "week") {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(baseDate, i - 3));

    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              Prix par nuit - Meilleur: <Price amount={priceStats.min} fromCurrency={currency} />
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setViewMode("month")}
            className="text-xs"
          >
            <CalendarIcon className="h-3 w-3 mr-1" />
            Vue mois
          </Button>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          {dates.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const isSelected = dateStr === checkInDate;
            const price = pricesWithDefaults[dateStr];
            const colorClass = getPriceColor(price);
            const isPast = date < new Date();
            const dayOfWeek = getDay(date);
            const isWeekendDay = isWeekend(date);
            
            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: isPast ? 1 : 1.02 }}
                whileTap={{ scale: isPast ? 1 : 0.98 }}
                onClick={() => !isPast && onDateSelect(dateStr)}
                disabled={isPast}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all min-w-[100px]",
                  isPast
                    ? "opacity-40 cursor-not-allowed bg-muted/50"
                    : isSelected
                    ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20"
                    : colorClass
                )}
              >
                <span className="text-xs font-medium capitalize opacity-80">
                  {format(date, "EEE", { locale: fr })}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(date, "d MMM", { locale: fr })}
                </span>
                <span className="text-lg font-bold mt-1">
                  <Price amount={price} fromCurrency={currency} />
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  par nuit
                </span>
                {price === priceStats.min && !isPast && (
                  <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 mt-0.5">
                    Meilleur prix
                  </span>
                )}
                {isWeekendDay && !isPast && (
                  <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 mt-0.5">
                    Week-end
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Info tarification */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            💡 Les prix des hôtels sont généralement plus élevés les week-ends et en haute saison
          </p>
        </div>
      </motion.div>
    );
  }

  // Vue mois
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-background to-muted/20 rounded-lg border border-border p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold capitalize min-w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h3>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <span className="font-medium">
              Min: <Price amount={priceStats.min} fromCurrency={currency} />
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setViewMode("week")}
            className="text-xs"
          >
            Vue semaine
          </Button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-2">
        <AnimatePresence mode="wait">
          {days.map((date, idx) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const isSelected = isSameDay(date, baseDate);
            const price = pricesWithDefaults[dateStr];
            const colorClass = getPriceColor(price);
            const isPast = date < new Date();
            const isWeekendDay = isWeekend(date);

            return (
              <motion.button
                key={dateStr}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.01 }}
                whileHover={{ scale: isPast ? 1 : 1.05 }}
                whileTap={{ scale: isPast ? 1 : 0.95 }}
                onClick={() => !isPast && onDateSelect(dateStr)}
                disabled={isPast}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border transition-all min-h-[80px] relative",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                    : isPast
                    ? "opacity-40 cursor-not-allowed bg-muted/50"
                    : colorClass
                )}
              >
                {isWeekendDay && !isPast && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />
                )}
                <span className="text-xs font-medium mb-1">
                  {format(date, "d")}
                </span>
                <span className="text-xs font-bold">
                  <Price amount={price} fromCurrency={currency} className="text-[10px]" />
                </span>
                <span className="text-[9px] text-muted-foreground">
                  /nuit
                </span>
                {price === priceStats.min && !isPast && (
                  <TrendingDown className="h-3 w-3 text-green-600 mt-0.5" />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" />
          <span className="text-xs text-muted-foreground">Prix bas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800" />
          <span className="text-xs text-muted-foreground">Prix moyen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800" />
          <span className="text-xs text-muted-foreground">Prix élevé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs text-muted-foreground">Week-end</span>
        </div>
      </div>

      {/* Info tarification */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          💡 Tarifs par nuit - Week-ends et haute saison généralement plus chers
        </p>
      </div>
    </motion.div>
  );
};
