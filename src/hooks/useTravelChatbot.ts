import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const useTravelChatbot = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (messages: Message[]) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('travel-chatbot', {
        body: { messages }
      });

      if (functionError) throw functionError;
      
      return data?.reply || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Travel chatbot error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
};
