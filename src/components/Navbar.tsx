import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Plane, User, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-smooth group-hover:shadow-primary">
              <Plane className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Yamou<span className="text-secondary">sso</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/flights" className="text-foreground hover:text-primary transition-smooth font-medium">
              Vols
            </Link>
            <Link to="/hotels" className="text-foreground hover:text-primary transition-smooth font-medium">
              Hôtels
            </Link>
            <Link to="/flight-hotel" className="text-foreground hover:text-primary transition-smooth font-medium">
              Vol + Hôtel
            </Link>
            <Link to="/cars" className="text-foreground hover:text-primary transition-smooth font-medium">
              Voitures
            </Link>
            <Link to="/stays" className="text-foreground hover:text-primary transition-smooth font-medium">
              Séjours
            </Link>
            <Link to="/activities" className="text-foreground hover:text-primary transition-smooth font-medium">
              Activités
            </Link>
            <Link to="/support" className="text-foreground hover:text-primary transition-smooth font-medium">
              Assistance
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Mon Compte
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Connexion
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="gradient-primary shadow-primary">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-smooth"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                to="/flights"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Vols
              </Link>
              <Link
                to="/hotels"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Hôtels
              </Link>
              <Link
                to="/flight-hotel"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Vol + Hôtel
              </Link>
              <Link
                to="/cars"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Voitures
              </Link>
              <Link
                to="/stays"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Séjours
              </Link>
              <Link
                to="/activities"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Activités
              </Link>
              <Link
                to="/support"
                className="text-foreground hover:text-primary transition-smooth font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Assistance
              </Link>
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border">
                {isLoggedIn ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" className="w-full">
                        <Button variant="outline" className="w-full gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Link to="/dashboard" className="w-full">
                      <Button variant="outline" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        Mon Compte
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" className="w-full">
                      <Button variant="outline" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/auth" className="w-full">
                      <Button className="w-full gradient-primary shadow-primary">
                        S'inscrire
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
