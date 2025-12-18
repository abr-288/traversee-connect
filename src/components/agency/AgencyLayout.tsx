import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AgencySidebar } from "./AgencySidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";

interface AgencyLayoutProps {
  children: ReactNode;
}

export function AgencyLayout({ children }: AgencyLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAgencyAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has sub_agency role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "sub_agency")
        .maybeSingle();

      if (!roles) {
        toast({
          title: "Accès refusé",
          description: "Vous n'êtes pas associé à une agence",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Fetch agency info
      const { data: agency } = await supabase
        .from("agencies")
        .select("name, is_active")
        .eq("owner_id", user.id)
        .single();

      if (!agency || !agency.is_active) {
        toast({
          title: "Accès refusé",
          description: "Votre agence n'est pas active",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setAgencyName(agency.name);
      setLoading(false);
    };

    checkAgencyAccess();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AgencySidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-4 bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <span className="font-medium text-lg">{agencyName}</span>
            </div>
            <DarkModeToggle />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}