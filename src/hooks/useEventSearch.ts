import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        body: params
      });

      if (functionError) throw functionError;
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Event search error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { searchEvents, loading, error };
};
