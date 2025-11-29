import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";

// Map IATA codes to city names
const cityNames: Record<string, string> = {
  'ABJ': 'Abidjan',
  'CDG': 'Paris CDG',
  'ORY': 'Paris Orly',
  'DXB': 'Dubai',
  'IST': 'Istanbul',
  'ACC': 'Accra',
  'DKR': 'Dakar',
  'CMN': 'Casablanca',
  'JNB': 'Johannesburg',
  'ADD': 'Addis-Abeba',
  'NBO': 'Nairobi',
  'LOS': 'Lagos',
  'CAI': 'Le Caire',
  'JFK': 'New York JFK',
  'LHR': 'Londres',
  'AMS': 'Amsterdam',
  'FRA': 'Francfort',
  'MAD': 'Madrid',
  'BCN': 'Barcelone',
  'ROM': 'Rome',
  'FCO': 'Rome FCO',
  'BRU': 'Bruxelles',
  'GVA': 'Genève',
  'ZRH': 'Zurich',
  'DOH': 'Doha',
  'AUH': 'Abu Dhabi',
  'RUH': 'Riyad',
  'JED': 'Djeddah',
  'BKO': 'Bamako',
  'OUA': 'Ouagadougou',
  'LFW': 'Lomé',
  'COO': 'Cotonou',
  'DSS': 'Dakar DSS',
  'ROB': 'Monrovia',
  'FNA': 'Freetown',
  'CKY': 'Conakry',
  'BJL': 'Banjul',
  'RAK': 'Marrakech',
  'TUN': 'Tunis',
  'ALG': 'Alger',
};

const getCityName = (code: string): string => cityNames[code] || code;

const formatDuration = (duration: string): string => {
  if (!duration) return '';
  const match = duration.match(/PT(\d+)H(\d+)?M?/);
  if (match) {
    const hours = match[1] || '0';
    const minutes = match[2] || '0';
    return `${hours}h${minutes.padStart(2, '0')}`;
  }
  return duration;
};

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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Airline Info */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg font-bold text-primary">
            {airlineCode.substring(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{airline}</span>
            <span className="text-xs text-muted-foreground">{airlineCode}</span>
          </div>
        </div>

        {/* Flight Info */}
        <div className="flex-1 flex items-center gap-4 lg:gap-6">
          {/* Departure */}
          <div className="flex flex-col items-start">
            <span className="text-xl lg:text-2xl font-bold">{formatTime(departureTime)}</span>
            <span className="text-sm font-medium">{getCityName(departureAirport)}</span>
            <span className="text-xs text-muted-foreground">{departureAirport}</span>
          </div>

          {/* Duration & Stops */}
          <div className="flex-1 flex flex-col items-center min-w-[100px]">
            <span className="text-xs text-muted-foreground mb-1">{formatDuration(duration)}</span>
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 h-[2px] bg-border relative">
                {stops > 0 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-secondary" />
                )}
              </div>
              <Plane className="h-4 w-4 text-secondary" />
            </div>
            <span className={`text-xs mt-1 ${stops === 0 ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
              {stops === 0 ? "Vol direct" : `${stops} escale${stops > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Arrival */}
          <div className="flex flex-col items-end">
            <span className="text-xl lg:text-2xl font-bold">{formatTime(arrivalTime)}</span>
            <span className="text-sm font-medium">{getCityName(arrivalAirport)}</span>
            <span className="text-xs text-muted-foreground">{arrivalAirport}</span>
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex flex-col items-end gap-2 min-w-[150px]">
          <div className="text-right">
            <div className="text-xs text-green-600 font-medium">
              Places disponibles
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-primary">
              <Price amount={price} fromCurrency={currency} showLoader />
            </div>
          </div>
          <Button 
            onClick={onSelect}
            className="w-full bg-secondary hover:bg-secondary/90 text-primary font-semibold"
          >
            Réserver
          </Button>
        </div>
      </div>
    </Card>
  );
};
