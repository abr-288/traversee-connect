import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Phone, Lock, Bell, CreditCard, Heart, MapPin, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const Account = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    priceAlerts: true,
    newsletter: true,
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData) {
      setProfile({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
        avatar_url: profileData.avatar_url || "",
      });
    }

    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } else {
      toast.success("Profil mis à jour avec succès");
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error("Erreur lors du changement de mot de passe");
    } else {
      toast.success("Mot de passe mis à jour avec succès");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      
      <div className="flex-1 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Mon Compte</h1>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock className="mr-2 h-4 w-4" />
                  Sécurité
                </TabsTrigger>
                <TabsTrigger value="preferences">
                  <Bell className="mr-2 h-4 w-4" />
                  Préférences
                </TabsTrigger>
                <TabsTrigger value="payment">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Paiement
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations Personnelles</CardTitle>
                    <CardDescription>
                      Gérez vos informations personnelles et de contact
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nom Complet</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="Votre nom complet"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+225 XX XX XX XX XX"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <Button onClick={handleUpdateProfile} className="w-full">
                      Enregistrer les modifications
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité du Compte</CardTitle>
                    <CardDescription>
                      Modifiez votre mot de passe et gérez la sécurité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Mot de passe actuel</Label>
                      <Input
                        id="current_password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password">Nouveau mot de passe</Label>
                      <Input
                        id="new_password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>

                    <Button className="w-full">
                      Changer le mot de passe
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences de Communication</CardTitle>
                    <CardDescription>
                      Gérez comment vous souhaitez recevoir nos communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifications par email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les confirmations et mises à jour par email
                        </p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, emailNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifications SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les alertes importantes par SMS
                        </p>
                      </div>
                      <Switch
                        checked={preferences.smsNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, smsNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Alertes de prix</Label>
                        <p className="text-sm text-muted-foreground">
                          Être notifié des baisses de prix
                        </p>
                      </div>
                      <Switch
                        checked={preferences.priceAlerts}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, priceAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Newsletter</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les offres spéciales et nouveautés
                        </p>
                      </div>
                      <Switch
                        checked={preferences.newsletter}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, newsletter: checked })
                        }
                      />
                    </div>

                    <Button className="w-full">
                      Enregistrer les préférences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>Moyens de Paiement</CardTitle>
                    <CardDescription>
                      Gérez vos méthodes de paiement enregistrées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Aucun moyen de paiement enregistré</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ajoutez une carte pour des réservations plus rapides
                      </p>
                      <Button>
                        Ajouter une carte
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/booking-history")}>
                <CardContent className="pt-6 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Mes Réservations</h3>
                  <p className="text-sm text-muted-foreground">Voir l'historique</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Mes Favoris</h3>
                  <p className="text-sm text-muted-foreground">0 destinations</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Mes Destinations</h3>
                  <p className="text-sm text-muted-foreground">0 voyages</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
