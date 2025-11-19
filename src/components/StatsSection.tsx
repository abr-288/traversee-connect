import { useEffect, useState } from "react";
import { Users, MapPin, Star, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const StatsSection = () => {
  const { t } = useTranslation();
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
      labelKey: "stats.bookings",
      color: "text-primary"
    },
    {
      icon: MapPin,
      value: `${stats.destinations}+`,
      labelKey: "stats.destinations",
      color: "text-secondary"
    },
    {
      icon: Calendar,
      value: `${stats.totalServices}+`,
      labelKey: "stats.services",
      color: "text-accent"
    },
    {
      icon: Star,
      value: stats.satisfaction.toFixed(1),
      labelKey: "stats.rating",
      color: "text-secondary"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 md:p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-smooth hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 ${stat.color}`} />
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">{stat.value}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
