import { LayoutDashboard, Package, Activity, Home, Calendar, Users, Crown, Mail, Cog, Percent, Tags, Building2, DollarSign, Megaphone, CreditCard, Star, MapPin, Newspaper } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Réservations", url: "/admin/bookings", icon: Calendar },
  { title: "Services", url: "/admin/services", icon: Package },
  { title: "Activités", url: "/admin/activities", icon: Activity },
  { title: "Séjours", url: "/admin/stays", icon: Home },
  { title: "Sous-Agences", url: "/admin/agencies", icon: Building2 },
  { title: "Commissions", url: "/admin/commissions", icon: DollarSign },
  { title: "Demandes Abonnements", url: "/admin/subscriptions", icon: Crown },
  { title: "Plans d'abonnement", url: "/admin/subscription-plans", icon: Tags },
  { title: "Promotions", url: "/admin/promotions", icon: Percent },
  { title: "Publicités", url: "/admin/advertisements", icon: Megaphone },
  { title: "Paiements", url: "/admin/payments", icon: CreditCard },
  { title: "Avis Clients", url: "/admin/reviews", icon: Star },
  { title: "Newsletter", url: "/admin/newsletter", icon: Newspaper },
  { title: "Destinations", url: "/admin/destinations", icon: MapPin },
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
  { title: "Templates Email", url: "/admin/email-templates", icon: Mail },
  { title: "Configuration", url: "/admin/configuration", icon: Cog },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={cn(
                        "flex items-center gap-2",
                        isActive(item.url) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
