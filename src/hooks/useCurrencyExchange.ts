import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedConversion, setCachedConversion } from "@/lib/currencyCache";

export interface ExchangeData {
  from: string;
  to: string;
  amount: number;
  converted: number;
  rate: number;
}

export const useCurrencyExchange = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertCurrency = async (
    from: string,
    to: string,
    amount: number
  ): Promise<ExchangeData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedConversion(from, to, amount);
      if (cached) {
        setLoading(false);
        return {
          from,
          to,
          amount,
          converted: cached.converted,
          rate: cached.rate,
        };
      }

      // Cache miss - call API
      console.log('Cache miss - fetching from API:', { from, to, amount });
      const { data, error: functionError } = await supabase.functions.invoke('currency-exchange', {
        body: { from, to, amount }
      });

      if (functionError) throw functionError;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to convert currency');
      }

      const result = data.data;

      // Store in cache for future use
      setCachedConversion(from, to, amount, result.rate, result.converted);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Currency exchange error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { convertCurrency, loading, error };
};
