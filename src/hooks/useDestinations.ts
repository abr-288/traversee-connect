import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { extractEdgeFunctionError, getPayloadError } from "@/lib/edgeFunctionError";

export interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  description: string;
  category: string;
  amenities: string[];
  highlights: string[];
  temperature?: number;
  bestTime?: string;
  trending?: boolean;
  source?: string;
}

interface UseDestinationsOptions {
  query?: string;
  category?: string;
  enabled?: boolean;
}

export const useDestinations = (options: UseDestinationsOptions = {}) => {
  const { query, category, enabled = true } = options;

  return useQuery({
    queryKey: ['destinations', query, category],
    queryFn: async (): Promise<Destination[]> => {
      console.log('Fetching destinations from TripAdvisor API...');

      const body: Record<string, string> = {};
      if (query) body.query = query;
      if (category && category !== 'all') body.category = category;

      try {
        const { data, error } = await supabase.functions.invoke('search-destinations', {
          body: Object.keys(body).length ? body : undefined,
        });

        if (error) {
          const message = await extractEdgeFunctionError(
            error,
            'Service destinations indisponible. Veuillez réessayer plus tard.'
          );
          throw new Error(message);
        }

        const payloadError = getPayloadError(data);
        if (payloadError) {
          throw new Error(payloadError);
        }

        console.log('Destinations received:', data?.total, 'from', data?.source);
        return (data?.destinations ?? []) as Destination[];
      } catch (err) {
        // Surface a clean, user-friendly message
        if (err instanceof Error) throw err;
        throw new Error('Service destinations indisponible. Veuillez réessayer plus tard.');
      }
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
    enabled,
  });
};

export const useDestinationSearch = (searchQuery: string) =>
  useDestinations({ query: searchQuery, enabled: searchQuery.length >= 2 });

export const useDestinationsByCategory = (category: string) =>
  useDestinations({ category });
