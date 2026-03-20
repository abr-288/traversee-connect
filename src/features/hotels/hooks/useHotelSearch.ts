import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  image_url: string;
  amenities: string[];
  description?: string;
}

export const useHotelSearch = (params: HotelSearchParams | null) => {
  return useQuery({
    queryKey: ["hotels", params],
    queryFn: async () => {
      if (!params) return null;

      const { data, error } = await supabase.functions.invoke("search-hotels", {
        body: params,
      });

      if (error) throw error;
      return data?.hotels as Hotel[] || [];
    },
    enabled: !!params,
  });
};
