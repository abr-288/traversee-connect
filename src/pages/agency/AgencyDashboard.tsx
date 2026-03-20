import { useEffect, useState } from "react";
import { AgencyLayout } from "@/components/agency/AgencyLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Package, Activity, Home, Percent, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Stats {
  services: number;
  activities: number;
  stays: number;
  promotions: number;
}

interface Commission {
  id: string;
  booking_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

interface AgencyInfo {
  id: string;
  name: string;
  commission_rate: number | null;
}

export default function AgencyDashboard() {
  const [stats, setStats] = useState<Stats>({
    services: 0,
    activities: 0,
    stays: 0,
    promotions: 0,
  });
  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionStats, setCommissionStats] = useState({ total: 0, pending: 0, paid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get agency info
      const { data: agencyData } = await supabase
        .from("agencies")
        .select("id, name, commission_rate")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!agencyData) {
        setLoading(false);
        return;
      }
      setAgency(agencyData);

      // Fetch counts and commissions in parallel
      const [servicesRes, activitiesRes, staysRes, promotionsRes, commissionsRes] = await Promise.all([
        supabase.from("services").select("id", { count: "exact" }).eq("agency_id", agencyData.id),
        supabase.from("activities").select("id", { count: "exact" }).eq("agency_id", agencyData.id),
        supabase.from("stays").select("id", { count: "exact" }).eq("agency_id", agencyData.id),
        supabase.from("promotions").select("id", { count: "exact" }).eq("agency_id", agencyData.id),
        supabase.from("commissions").select("*").eq("agency_id", agencyData.id).order("created_at", { ascending: false }).limit(10),
      ]);

      setStats({
        services: servicesRes.count || 0,
        activities: activitiesRes.count || 0,
        stays: staysRes.count || 0,
        promotions: promotionsRes.count || 0,
      });

      const commissionsData = commissionsRes.data || [];
      setCommissions(commissionsData);

      // Calculate commission stats
      const total = commissionsData.reduce((sum, c) => sum + c.commission_amount, 0);
      const pending = commissionsData.filter(c => c.status === "pending").reduce((sum, c) => sum + c.commission_amount, 0);
      const paid = commissionsData.filter(c => c.status === "paid").reduce((sum, c) => sum + c.commission_amount, 0);
      setCommissionStats({ total, pending, paid });

      setLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue dans votre espace agence
            </p>
          </div>
          {agency && (
            <Badge variant="outline" className="text-sm">
              Taux de commission: {agency.commission_rate ?? 10}%
            </Badge>
          )}
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

        {/* Commission Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(commissionStats.total)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{formatCurrency(commissionStats.pending)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(commissionStats.paid)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Commissions */}
        {commissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Commissions récentes</CardTitle>
              <CardDescription>Vos dernières commissions sur les ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant Vente</TableHead>
                    <TableHead>Taux</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="text-sm">
                        {format(new Date(commission.created_at), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>{formatCurrency(commission.booking_amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{commission.commission_rate}%</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(commission.commission_amount)}
                      </TableCell>
                      <TableCell>
                        {commission.status === "pending" ? (
                          <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>
                        ) : commission.status === "paid" ? (
                          <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Payée</Badge>
                        ) : (
                          <Badge variant="destructive">Annulée</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

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