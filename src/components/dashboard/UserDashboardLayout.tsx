import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "./UserSidebar";
import { DarkModeToggle } from "@/components/DarkModeToggle";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface UserDashboardLayoutProps {
  children: ReactNode;
}

interface UserProfile {
  full_name: string;
  email: string;
  avatar_url?: string;
}

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      
      setUserProfile({
        full_name: profileData?.full_name || "Utilisateur",
        email: user.email || "",
        avatar_url: profileData?.avatar_url,
      });
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <UserSidebar userProfile={userProfile} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Link to="/">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
