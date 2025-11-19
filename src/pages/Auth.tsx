import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plane } from "lucide-react";
import { UnifiedForm, UnifiedFormField, UnifiedSubmitButton } from "@/components/forms";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowUpdatePassword(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

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
    } else {
      toast({
        title: "Inscription réussie",
        description: "Vous pouvez maintenant vous connecter",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

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
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Yamousso!",
      });
      navigate("/");
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

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
    } else {
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
      setShowResetPassword(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès",
      });
      setShowUpdatePassword(false);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary p-3 rounded-full">
              <Plane className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Yamousso</CardTitle>
          <CardDescription>Votre agence de voyage de confiance</CardDescription>
        </CardHeader>
        <CardContent>
          {showUpdatePassword ? (
            <UnifiedForm onSubmit={handleUpdatePassword} variant="auth" loading={loading}>
              <UnifiedFormField
                label="Nouveau mot de passe"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <UnifiedFormField
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <UnifiedSubmitButton loading={loading} fullWidth>
                Mettre à jour le mot de passe
              </UnifiedSubmitButton>
            </UnifiedForm>
          ) : showResetPassword ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setShowResetPassword(false)}
                className="mb-2"
              >
                ← Retour à la connexion
              </Button>
              <UnifiedForm onSubmit={handleResetPassword} variant="auth" loading={loading}>
                <UnifiedFormField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                />
                <UnifiedSubmitButton loading={loading} fullWidth>
                  Réinitialiser le mot de passe
                </UnifiedSubmitButton>
              </UnifiedForm>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <UnifiedForm onSubmit={handleSignIn} variant="auth" loading={loading}>
                  <UnifiedFormField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                  />
                  <UnifiedFormField
                    label="Mot de passe"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                  <UnifiedSubmitButton loading={loading} fullWidth>
                    Se connecter
                  </UnifiedSubmitButton>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </UnifiedForm>
              </TabsContent>

            <TabsContent value="signup">
              <UnifiedForm onSubmit={handleSignUp} variant="auth" loading={loading}>
                <UnifiedFormField
                  label="Nom complet"
                  name="fullName"
                  type="text"
                  placeholder="Jean Dupont"
                  required
                />
                <UnifiedFormField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                />
                <UnifiedFormField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <UnifiedSubmitButton loading={loading} fullWidth>
                  S'inscrire
                </UnifiedSubmitButton>
              </UnifiedForm>
            </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
