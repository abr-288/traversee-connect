import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions nécessaires",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setLoading(false);
    };

    checkAdmin();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/10">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background flex items-center justify-between px-6">
            <SidebarTrigger />
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
