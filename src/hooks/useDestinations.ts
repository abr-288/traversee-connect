import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
}

export const useDestinations = () => {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      console.log('Fetching destinations from edge function...');
      
      const { data, error } = await supabase.functions.invoke('search-destinations');
      
      if (error) {
        console.error('Error fetching destinations:', error);
        throw error;
      }
      
      console.log('Destinations received:', data);
      return data.destinations as Destination[];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 1
  });
};
