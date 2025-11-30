import { BarChart3, Users, Calendar, Settings, Home, Bed, Cog, Mail, CreditCard } from "lucide-react";
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
  { title: "Vue d'ensemble", url: "/admin", icon: BarChart3 },
  { title: "Réservations", url: "/admin/bookings", icon: Calendar },
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
  { title: "Services", url: "/admin/services", icon: Settings },
  { title: "Activités", url: "/admin/activities", icon: Home },
  { title: "Hébergements", url: "/admin/stays", icon: Bed },
  { title: "Abonnements", url: "/admin/subscriptions", icon: CreditCard },
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
