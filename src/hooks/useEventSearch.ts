import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractEdgeFunctionError, getPayloadError } from "@/lib/edgeFunctionError";

export interface EventSearchParams {
  location: string;
  date?: string;
  category?: string;
}

export const useEventSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEvents = async (params: EventSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('search-events', {
        body: params,
      });

      if (functionError) {
        const msg = await extractEdgeFunctionError(
          functionError,
          "Le service de recherche d'événements est temporairement indisponible."
        );
        throw new Error(msg);
      }

      const payloadError = getPayloadError(data);
      if (payloadError) throw new Error(payloadError);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de la recherche d'événements.";
      setError(errorMessage);
      toast.error("Recherche d'événements échouée", { description: errorMessage });
      console.error('Event search error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { searchEvents, loading, error };
};
