import { LayoutDashboard, Package, Activity, Home, Calendar, Users, Settings } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
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
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
  { title: "Configuration", url: "/admin/email-templates", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <h2 className={`font-bold text-xl ${collapsed ? "text-center" : ""}`}>
            {collapsed ? "BR" : "B-Reserve Admin"}
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={`flex items-center gap-3 ${
                        isActive(item.url) ? "bg-accent text-accent-foreground font-medium" : ""
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
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
