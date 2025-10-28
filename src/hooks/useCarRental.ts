import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        body: params
      });

      if (functionError) throw functionError;
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Car rental search error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { searchCarRentals, loading, error };
};
