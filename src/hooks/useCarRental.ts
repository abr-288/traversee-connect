import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractEdgeFunctionError, getPayloadError } from "@/lib/edgeFunctionError";

export interface CarRentalParams {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  dropoffDate: string;
}

export const useCarRental = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCarRentals = async (params: CarRentalParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('car-rental', {
        body: params,
      });

      if (functionError) {
        const msg = await extractEdgeFunctionError(
          functionError,
          "Le service de location de voitures est temporairement indisponible."
        );
        throw new Error(msg);
      }

      const payloadError = getPayloadError(data);
      if (payloadError) throw new Error(payloadError);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de la recherche de voitures.";
      setError(errorMessage);
      toast.error("Recherche de voitures échouée", { description: errorMessage });
      console.error('Car rental search error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { searchCarRentals, loading, error };
};
