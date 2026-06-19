import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractEdgeFunctionError, getPayloadError } from "@/lib/edgeFunctionError";

export interface TrainSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  travelClass?: string;
}

export const useTrainSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTrains = async (params: TrainSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-trains', {
        body: params,
      });

      if (functionError) {
        const msg = await extractEdgeFunctionError(
          functionError,
          "Le service de recherche de trains est temporairement indisponible."
        );
        throw new Error(msg);
      }

      const payloadError = getPayloadError(data);
      if (payloadError) throw new Error(payloadError);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de la recherche de trains.";
      setError(errorMessage);
      toast.error("Recherche de trains échouée", { description: errorMessage });
      console.error('Train search error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { searchTrains, loading, error };
};
