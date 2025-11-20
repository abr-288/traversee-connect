import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FlightCardProps {
  airline: string;
  airlineCode: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  onSelect: () => void;
}

export const FlightCard = ({
  airline,
  airlineCode,
  departureTime,
  arrivalTime,
  departureAirport,
  arrivalAirport,
  duration,
  stops,
  price,
  currency,
  onSelect,
}: FlightCardProps) => {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        {/* Flight Info */}
        <div className="flex-1 flex items-center gap-6">
          {/* Departure */}
          <div className="flex flex-col items-start">
            <span className="text-2xl font-bold">{formatTime(departureTime)}</span>
            <span className="text-sm text-muted-foreground">{departureAirport}</span>
          </div>

          {/* Duration & Stops */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">{duration}</span>
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-[2px] bg-border relative">
                {stops > 0 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
                )}
              </div>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              {stops === 0 ? "Direct" : `${stops} escale${stops > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Arrival */}
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold">{formatTime(arrivalTime)}</span>
            <span className="text-sm text-muted-foreground">{arrivalAirport}</span>
          </div>
        </div>

        {/* Airline & Icons */}
        <div className="flex items-center gap-4 px-4 border-l border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>✈️</span>
            <span>🎒</span>
            <span>🧳</span>
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground line-through">
              1 siège disponible à ce prix
            </div>
            <div className="text-3xl font-bold">{price.toLocaleString()} {currency}</div>
          </div>
          <Button 
            onClick={onSelect}
            className="w-full bg-[hsl(158,100%,48%)] hover:bg-[hsl(158,100%,40%)] text-primary-foreground"
          >
            Sélectionner
          </Button>
        </div>
      </div>
    </Card>
  );
};
