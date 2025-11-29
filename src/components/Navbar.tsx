import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, LayoutDashboard, Plane, Hotel, PlaneTakeoff, Train, Calendar, Car, HelpCircle, Download, UserCircle2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { usePWA } from "@/hooks/usePWA";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySelector from "./CurrencySelector";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { isInstallable, isInstalled, install } = usePWA();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    toast.success(t("nav.logoutSuccess"));
    navigate("/");
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast.success(t("common.install") + " " + t("common.success"));
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary-light">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoLight} alt="Bossiz Logo" className="h-16 w-auto transition-smooth" />
            <span className="text-xl font-bold text-white">Bossiz</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 justify-between pl-8">
            {/* Navigation Principale */}
            <div className="flex items-center gap-4 lg:gap-6">
              <Link to="/flights" className="text-white hover:text-secondary transition-smooth text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                <Plane className="w-3.5 h-3.5" />
                {t("nav.flights")}
              </Link>
              <Link to="/hotels" className="text-white hover:text-secondary transition-smooth text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                <Hotel className="w-3.5 h-3.5" />
                {t("nav.hotels")}
              </Link>
              <Link to="/flight-hotel" className="text-white hover:text-secondary transition-smooth text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                <PlaneTakeoff className="w-3.5 h-3.5" />
                {t("nav.flightHotel")}
              </Link>
              <Link to="/trains" className="text-white hover:text-secondary transition-smooth text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                <Train className="w-3.5 h-3.5" />
                {t("nav.trains")}
              </Link>
              <Link to="/events" className="text-white hover:text-secondary transition-smooth text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5" />
                {t("nav.events")}
              </Link>
              <Link to="/cars" className="text-white hover:text-secondary transition-smooth text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                <Car className="w-3.5 h-3.5" />
                {t("nav.carRental")}
              </Link>
              <Link to="/subscriptions" className="text-secondary hover:text-secondary/80 transition-smooth text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                <Crown className="w-3.5 h-3.5" />
                {t("nav.subscriptions")}
              </Link>
            </div>

            {/* Section Droite - Toujours visible */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/support" className="text-white hover:text-secondary transition-smooth text-[11px] font-medium flex items-center gap-0.5 whitespace-nowrap">
                <HelpCircle className="w-2.5 h-2.5" />
                {t("nav.support")}
              </Link>
              
              <div className="h-4 w-px bg-white/20"></div>
              
              <LanguageSwitcher />
              
              <div className="h-4 w-px bg-white/20"></div>
              
              <CurrencySelector />
              
              {isInstallable && !isInstalled && (
                <>
                  <div className="h-4 w-px bg-white/20"></div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleInstall}
                    className="gap-1 text-[11px] text-secondary hover:bg-white/10 font-semibold whitespace-nowrap"
                  >
                    <Download className="w-3 h-3" />
                    Installer
                  </Button>
                </>
              )}
              
              {isLoggedIn ? (
                <>
                  <div className="h-4 w-px bg-white/20"></div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 text-[11px] text-white hover:bg-white/10 whitespace-nowrap">
                        <UserCircle2 className="w-4 h-4" />
                        <span className="hidden lg:inline">{t("nav.myAccount")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background border-border z-50">
                      <DropdownMenuLabel className="text-foreground">
                        {t("nav.myAccount")}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                            <LayoutDashboard className="w-4 h-4" />
                            {t("nav.admin")}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                          <UserCircle2 className="w-4 h-4" />
                          {t("nav.profile")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="w-4 h-4" />
                          {t("nav.dashboard")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("nav.logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <div className="h-4 w-px bg-white/20"></div>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="gap-0.5 text-[11px] text-white hover:bg-white/10 whitespace-nowrap">
                      <User className="w-3 h-3" />
                      {t("nav.login")}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="text-[11px] bg-secondary hover:bg-secondary/90 text-primary px-2 whitespace-nowrap">
                      {t("nav.signup")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:text-secondary transition-smooth"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-light animate-fade-in">
            <div className="flex flex-col">
              {/* Section Navigation */}
              <div className="px-4 pb-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Navigation
                </p>
              </div>
              
              <div className="flex flex-col gap-1 px-2 pb-3">
                <Link
                  to="/flights"
                  className="text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium px-3 py-2.5 flex items-center gap-3 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plane className="w-4 h-4 text-secondary" />
                  {t("nav.flights")}
                </Link>
                <Link
                  to="/hotels"
                  className="text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium px-3 py-2.5 flex items-center gap-3 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Hotel className="w-4 h-4 text-secondary" />
                  {t("nav.hotels")}
                </Link>
                <Link
                  to="/flight-hotel"
                  className="text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium px-3 py-2.5 flex items-center gap-3 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PlaneTakeoff className="w-4 h-4 text-secondary" />
                  {t("nav.flightHotel")}
                </Link>
                <Link
                  to="/trains"
                  className="text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium px-3 py-2.5 flex items-center gap-3 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Train className="w-4 h-4 text-secondary" />
                  {t("nav.trains")}
                </Link>
                <Link
                  to="/events"
                  className="text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium px-3 py-2.5 flex items-center gap-3 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4 text-secondary" />
                  {t("nav.events")}
                </Link>
                <Link
                  to="/cars"
                  className="text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium px-3 py-2.5 flex items-center gap-3 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Car className="w-4 h-4 text-secondary" />
                  {t("nav.carRental")}
                </Link>
                <Link
                  to="/subscriptions"
                  className="text-secondary hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium px-3 py-2.5 flex items-center gap-3 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Crown className="w-4 h-4 text-secondary" />
                  {t("nav.subscriptions")}
                </Link>
              </div>

              {/* Séparateur */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>

              {/* Section Support */}
              <div className="px-2 py-2">
                <Link
                  to="/support"
                  className="text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium px-3 py-2.5 flex items-center gap-3 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <HelpCircle className="w-4 h-4 text-secondary" />
                  {t("nav.support")}
                </Link>
              </div>

              {/* Séparateur */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>

              {/* Section Préférences */}
              <div className="px-4 pb-2 pt-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Préférences
                </p>
              </div>
              
              <div className="flex flex-col gap-3 px-4 pb-3">
                <LanguageSwitcher />
                <CurrencySelector />
              </div>

              {/* Séparateur */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>

              {/* Section Compte */}
              <div className="px-4 pb-2 pt-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  {isLoggedIn ? "Mon Compte" : "Connexion"}
                </p>
              </div>

              <div className="flex flex-col gap-2 px-4 pb-2">
                {isLoggedIn ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" className="w-full" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 text-sm text-white border-white/20 hover:bg-white/10 justify-start">
                          <LayoutDashboard className="w-4 h-4" />
                          {t("nav.admin")}
                        </Button>
                      </Link>
                    )}
                    <Link to="/account" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full gap-2 text-sm bg-secondary hover:bg-secondary/90 text-primary justify-start">
                        <UserCircle2 className="w-4 h-4" />
                        {t("nav.profile")}
                      </Button>
                    </Link>
                    <Link to="/dashboard" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full gap-2 text-sm text-white border-white/20 hover:bg-white/10 justify-start">
                        <LayoutDashboard className="w-4 h-4" />
                        {t("nav.dashboard")}
                      </Button>
                    </Link>
                    <Button 
                      className="w-full gap-2 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground justify-start" 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full gap-2 text-sm bg-secondary hover:bg-secondary/90 text-primary justify-start">
                        <User className="w-4 h-4" />
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link to="/auth" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full gap-2 text-sm text-white border-white/20 hover:bg-white/10 justify-start">
                        <User className="w-4 h-4" />
                        {t("nav.signup")}
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
