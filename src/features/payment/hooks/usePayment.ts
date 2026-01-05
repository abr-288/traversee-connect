import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { paymentSchema, type PaymentInput } from "@/lib/validationSchemas";
import { validateWithSchema, getUserFriendlyErrorMessage } from "@/lib/formHelpers";

export const usePayment = () => {
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { toast } = useToast();

  const processPayment = async (
    bookingId: string,
    booking: any,
    paymentData: PaymentInput
  ) => {
    setValidationErrors({});
    setGeneralError(null);

    const validation = validateWithSchema(paymentSchema, paymentData);

    if (validation.success === false) {
      setValidationErrors(validation.errors);
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      
      const firstErrorField = Object.keys(validation.errors)[0];
      document.getElementById(firstErrorField)?.focus();
      return { success: false };
    }

    const validatedData = validation.data;

    if (processing) return { success: false };

    setProcessing(true);

    const timeoutId = setTimeout(() => {
      setProcessing(false);
      setGeneralError("Le délai de traitement du paiement a expiré. Veuillez réessayer.");
      toast({
        title: "Délai dépassé",
        description: "Le traitement du paiement a pris trop de temps. Veuillez réessayer.",
        variant: "destructive",
      });
    }, 30000);

    try {
      const { data: currentBooking, error: checkError } = await supabase
        .from("bookings")
        .select("payment_status, status")
        .eq("id", bookingId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!currentBooking) {
        throw new Error("Réservation introuvable");
      }

      if (currentBooking.payment_status === "paid") {
        throw new Error("Cette réservation a déjà été payée");
      }

      if (currentBooking.status === "cancelled") {
        throw new Error("Cette réservation a été annulée et ne peut être payée");
      }

      // XOF - devise unique de la plateforme
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          bookingId: bookingId,
          amount: booking.total_price,
          currency: "XOF",
          paymentMethod: validatedData.paymentMethod,
          customerInfo: {
            name: validatedData.customerName,
            email: validatedData.customerEmail,
            phone: validatedData.customerPhone,
            address: validatedData.customerAddress,
            city: validatedData.customerCity,
          },
        },
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error("Payment error:", error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || "Échec de la création du paiement");
      }

      if (!data.payment_url) {
        throw new Error("URL de paiement non reçue");
      }

      return { success: true, paymentUrl: data.payment_url };
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Payment error:", error);
      
      const userMessage = getUserFriendlyErrorMessage(error);
      setGeneralError(userMessage);
      
      toast({
        title: "Erreur de paiement",
        description: userMessage,
        variant: "destructive",
      });
      setProcessing(false);
      return { success: false };
    }
  };

  return {
    processing,
    validationErrors,
    generalError,
    processPayment,
    setValidationErrors,
  };
};
