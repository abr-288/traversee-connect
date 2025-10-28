import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { toast } from "sonner";

export const CurrencyConverter = () => {
  const { convertCurrency, loading } = useCurrencyExchange();
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("XOF");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);

  const currencies = [
    { code: "XOF", name: "Franc CFA (FCFA)" },
    { code: "EUR", name: "Euro (€)" },
    { code: "USD", name: "Dollar US ($)" },
    { code: "GBP", name: "Livre Sterling (£)" },
    { code: "JPY", name: "Yen Japonais (¥)" },
    { code: "CAD", name: "Dollar Canadien (CAD)" },
    { code: "CHF", name: "Franc Suisse (CHF)" },
    { code: "AUD", name: "Dollar Australien (AUD)" },
  ];

  const handleConvert = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    const data = await convertCurrency(from, to, amountNum);
    if (data) {
      setResult(data.converted);
      setRate(data.rate);
      toast.success("Conversion effectuée");
    } else {
      toast.error("Erreur lors de la conversion");
    }
  };

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
    setRate(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          Convertisseur de Devises
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Montant</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">De</label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vers</label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={swapCurrencies}
            className="rounded-full"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
        </div>

        {result !== null && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-2xl font-bold text-primary">
              {result.toFixed(2)} {to}
            </p>
            {rate && (
              <p className="text-sm text-muted-foreground">
                Taux: 1 {from} = {rate.toFixed(6)} {to}
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleConvert}
          className="w-full gradient-primary shadow-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Conversion...
            </>
          ) : (
            "Convertir"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
