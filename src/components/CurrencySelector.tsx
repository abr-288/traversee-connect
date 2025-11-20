import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DollarSign } from "lucide-react";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";

const CurrencySelector = () => {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();

  const currentCurrency = currencies.find(curr => curr.code === selectedCurrency) || currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10">
          <DollarSign className="w-4 h-4" />
          <span className="text-xs">{currentCurrency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => setSelectedCurrency(currency.code)}
            className="cursor-pointer"
          >
            {currency.symbol} {currency.code} - {currency.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
