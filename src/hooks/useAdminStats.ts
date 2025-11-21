import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  totalUsers: number;
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
  recentBookings: any[];
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    revenueByMonth: [],
    bookingsByStatus: [],
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total revenue from paid bookings
        const { data: bookings } = await supabase
          .from("bookings")
          .select("total_price, payment_status, status, created_at, customer_name, customer_email")
          .order("created_at", { ascending: false });

        if (bookings) {
          const totalRevenue = bookings
            .filter((b) => b.payment_status === "paid")
            .reduce((sum, b) => sum + Number(b.total_price), 0);

          const totalBookings = bookings.length;
          const pendingBookings = bookings.filter((b) => b.status === "pending").length;

          // Revenue by month (last 6 months)
          const now = new Date();
          const revenueByMonth = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
            const monthRevenue = bookings
              .filter((b) => {
                const bookingDate = new Date(b.created_at);
                return (
                  b.payment_status === "paid" &&
                  bookingDate.getMonth() === date.getMonth() &&
                  bookingDate.getFullYear() === date.getFullYear()
                );
              })
              .reduce((sum, b) => sum + Number(b.total_price), 0);

            revenueByMonth.push({ month: monthName, revenue: monthRevenue });
          }

          // Bookings by status
          const statusCounts: { [key: string]: number } = {};
          bookings.forEach((b) => {
            statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
          });

          const bookingsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
          }));

          // Recent bookings
          const recentBookings = bookings.slice(0, 10);

          setStats({
            totalRevenue,
            totalBookings,
            pendingBookings,
            totalUsers: 0, // Will be updated below
            revenueByMonth,
            bookingsByStatus,
            recentBookings,
          });
        }

        // Total users
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        setStats((prev) => ({ ...prev, totalUsers: usersCount || 0 }));
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up realtime subscription for bookings
    const channel = supabase
      .channel("admin-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading };
};
