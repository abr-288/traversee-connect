import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCards } from "@/components/admin/StatsCards";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  completed: "#3b82f6",
  cancelled: "#ef4444",
};

const AdminOverview = () => {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
        </div>

        <StatsCards
          totalRevenue={stats.totalRevenue}
          totalBookings={stats.totalBookings}
          pendingBookings={stats.pendingBookings}
          totalUsers={stats.totalUsers}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <RevenueChart data={stats.revenueByMonth} />

          <Card>
            <CardHeader>
              <CardTitle>Répartition des Réservations</CardTitle>
              <CardDescription>Par statut</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={stats.bookingsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.bookingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || "#8884d8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Réservations Récentes</CardTitle>
            <CardDescription>Les 10 dernières réservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(booking.total_price).toLocaleString()} FCFA</p>
                    <Badge variant={
                      booking.status === "confirmed" ? "default" :
                      booking.status === "pending" ? "secondary" :
                      booking.status === "completed" ? "outline" : "destructive"
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
