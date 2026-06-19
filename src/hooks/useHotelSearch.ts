import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractEdgeFunctionError, getPayloadError } from "@/lib/edgeFunctionError";

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
}

export const useHotelSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHotels = async (params: HotelSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-hotels', {
        body: params,
      });

      if (functionError) {
        const msg = await extractEdgeFunctionError(
          functionError,
          "Le service de recherche d'hôtels est temporairement indisponible."
        );
        throw new Error(msg);
      }

      const payloadError = getPayloadError(data);
      if (payloadError) throw new Error(payloadError);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de la recherche d'hôtels.";
      setError(errorMessage);
      toast.error("Recherche d'hôtels échouée", { description: errorMessage });
      console.error('Hotel search error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { searchHotels, loading, error };
};
