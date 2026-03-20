import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }

    toast({
      title: "Inscription réussie",
      description: "Vous pouvez maintenant vous connecter",
    });
    return { success: true };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }

    toast({
      title: "Connexion réussie",
      description: "Bienvenue sur Yamousso!",
    });
    navigate("/");
    return { success: true };
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }

    toast({
      title: "Email envoyé",
      description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
    });
    return { success: true };
  };

  const updatePassword = async (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return { success: false };
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return { success: false };
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }

    toast({
      title: "Mot de passe mis à jour",
      description: "Votre mot de passe a été modifié avec succès",
    });
    navigate("/");
    return { success: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return {
    loading,
    signUp,
    signIn,
    resetPassword,
    updatePassword,
    signOut,
  };
};
