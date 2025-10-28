import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error: functionError } = await supabase.functions.invoke('currency-exchange', {
        body: { from, to, amount }
      });

      if (functionError) throw functionError;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to convert currency');
      }

      return data.data;
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
