import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Price } from "@/components/ui/price";

interface PriceCalendarProps {
  departureDate: string;
  prices?: Record<string, number>;
  currency?: string;
  onDateSelect: (date: string) => void;
}

export const PriceCalendar = ({ departureDate, prices = {}, currency = "€", onDateSelect }: PriceCalendarProps) => {
  const baseDate = parseISO(departureDate);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(baseDate, i - 3));

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
            {dates.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const isSelected = dateStr === departureDate;
              const price = prices[dateStr] || 304;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => onDateSelect(dateStr)}
                  className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-lg border transition-all min-w-[100px] ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-xs text-muted-foreground capitalize">
                    {format(date, "EEE. d MMM", { locale: fr })}
                  </span>
                  <span className={`text-lg font-semibold mt-1 ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}>
                    <Price amount={price} fromCurrency={currency} />
                  </span>
                </button>
              );
            })}
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
