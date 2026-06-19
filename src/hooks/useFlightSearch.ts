import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractEdgeFunctionError, getPayloadError } from "@/lib/edgeFunctionError";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  travelClass?: string;
}

export const useFlightSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = useCallback(async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-flights', {
        body: params,
      });

      if (functionError) {
        const msg = await extractEdgeFunctionError(
          functionError,
          "Le service de recherche de vols est temporairement indisponible."
        );
        throw new Error(msg);
      }

      const payloadError = getPayloadError(data);
      if (payloadError) throw new Error(payloadError);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de la recherche des vols.";
      setError(errorMessage);
      toast.error("Recherche de vols échouée", { description: errorMessage });
      console.error('Flight search error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchFlights, loading, error };
};
