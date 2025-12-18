import { useEffect, useState } from "react";
import { AgencyLayout } from "@/components/agency/AgencyLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Package, Activity, Home, Percent, TrendingUp } from "lucide-react";

interface Stats {
  services: number;
  activities: number;
  stays: number;
  promotions: number;
}

export default function AgencyDashboard() {
  const [stats, setStats] = useState<Stats>({
    services: 0,
    activities: 0,
    stays: 0,
    promotions: 0,
  });
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get agency ID
      const { data: agency } = await supabase
        .from("agencies")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!agency) return;
      setAgencyId(agency.id);

      // Fetch counts
      const [servicesRes, activitiesRes, staysRes, promotionsRes] = await Promise.all([
        supabase.from("services").select("id", { count: "exact" }).eq("agency_id", agency.id),
        supabase.from("activities").select("id", { count: "exact" }).eq("agency_id", agency.id),
        supabase.from("stays").select("id", { count: "exact" }).eq("agency_id", agency.id),
        supabase.from("promotions").select("id", { count: "exact" }).eq("agency_id", agency.id),
      ]);

      setStats({
        services: servicesRes.count || 0,
        activities: activitiesRes.count || 0,
        stays: staysRes.count || 0,
        promotions: promotionsRes.count || 0,
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Services",
      value: stats.services,
      icon: Package,
      description: "Services actifs",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Activités",
      value: stats.activities,
      icon: Activity,
      description: "Activités proposées",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Séjours",
      value: stats.stays,
      icon: Home,
      description: "Séjours disponibles",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Promotions",
      value: stats.promotions,
      icon: Percent,
      description: "Offres actives",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <AgencyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue dans votre espace agence
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : card.value}
                </div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Guide de démarrage
            </CardTitle>
            <CardDescription>
              Commencez à ajouter vos offres pour les rendre visibles aux clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">1. Ajoutez vos services</h3>
                <p className="text-sm text-muted-foreground">
                  Créez des services de voyage (vols, hôtels, voitures) avec vos propres prix.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">2. Créez des activités</h3>
                <p className="text-sm text-muted-foreground">
                  Proposez des activités touristiques et excursions locales.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">3. Publiez des séjours</h3>
                <p className="text-sm text-muted-foreground">
                  Offrez des packages de séjours complets à vos clients.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">4. Lancez des promotions</h3>
                <p className="text-sm text-muted-foreground">
                  Créez des offres spéciales pour attirer plus de clients.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AgencyLayout>
  );
}