import { useEffect, useState } from "react";
import { Users, MapPin, Star, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalBookings: 0,
    destinations: 0,
    satisfaction: 4.8
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [servicesResult, bookingsResult] = await Promise.all([
        supabase.from('services').select('id, location', { count: 'exact' }).eq('available', true),
        supabase.from('bookings').select('id', { count: 'exact' })
      ]);

      const uniqueDestinations = new Set(servicesResult.data?.map(s => s.location) || []).size;

      setStats({
        totalServices: servicesResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        destinations: uniqueDestinations,
        satisfaction: 4.8
      });
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      icon: Users,
      value: stats.totalBookings.toLocaleString(),
      label: "Réservations",
      color: "text-primary"
    },
    {
      icon: MapPin,
      value: `${stats.destinations}+`,
      label: "Destinations",
      color: "text-secondary"
    },
    {
      icon: Calendar,
      value: `${stats.totalServices}+`,
      label: "Services Disponibles",
      color: "text-accent"
    },
    {
      icon: Star,
      value: stats.satisfaction.toFixed(1),
      label: "Note Moyenne",
      color: "text-secondary"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-smooth hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
              <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
