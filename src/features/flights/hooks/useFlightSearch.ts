import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  currency: string;
  availableSeats: number;
  class: string;
}

export const useFlightSearch = (params: FlightSearchParams | null) => {
  return useQuery({
    queryKey: ["flights", params],
    queryFn: async () => {
      if (!params) return null;

      const { data, error } = await supabase.functions.invoke("search-flights", {
        body: params,
      });

      if (error) throw error;
      return data?.flights as Flight[] || [];
    },
    enabled: !!params,
  });
};
