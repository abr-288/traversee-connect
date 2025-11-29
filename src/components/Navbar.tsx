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
import { Menu, X, User, LogOut, LayoutDashboard, Plane, Hotel, PlaneTakeoff, Train, Calendar, Car, HelpCircle, UserCircle2, Crown, ChevronDown, MapPin, Compass } from "lucide-react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { isInstallable, isInstalled, install } = usePWA();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary-light w-full transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      <div className="w-full px-4 xl:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-12' : 'h-16'}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoLight} alt="Bossiz Logo" className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-16'} w-auto`} />
            <span className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'}`}>Bossiz</span>
          </Link>

          <div className="hidden lg:flex items-center flex-1 justify-between ml-6">
            {/* Navigation Principale - Gauche */}
            <div className="flex items-center gap-1 xl:gap-2">
              <Link to="/flights" className="text-white hover:text-secondary transition-smooth text-xs xl:text-sm font-medium whitespace-nowrap px-2 py-1">
                {t("nav.flights")}
              </Link>
              <Link to="/hotels" className="text-white hover:text-secondary transition-smooth text-xs xl:text-sm font-medium whitespace-nowrap px-2 py-1">
                {t("nav.hotels")}
              </Link>
              <Link to="/flight-hotel" className="text-white hover:text-secondary transition-smooth text-xs xl:text-sm font-medium whitespace-nowrap px-2 py-1">
                {t("nav.flightHotel")}
              </Link>
              <Link to="/cars" className="text-white hover:text-secondary transition-smooth text-xs xl:text-sm font-medium whitespace-nowrap px-2 py-1">
                {t("nav.carRental")}
              </Link>
              
              {/* Dropdown Autres */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white hover:text-secondary transition-smooth text-xs xl:text-sm font-medium whitespace-nowrap px-2 py-1 flex items-center gap-1">
                    {t("nav.others")}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-background border-border z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/trains" className="flex items-center gap-2 cursor-pointer">
                      <Train className="w-4 h-4" />
                      {t("nav.trains")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/events" className="flex items-center gap-2 cursor-pointer">
                      <Calendar className="w-4 h-4" />
                      {t("nav.events")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/destinations" className="flex items-center gap-2 cursor-pointer">
                      <MapPin className="w-4 h-4" />
                      {t("nav.destinations")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/stays" className="flex items-center gap-2 cursor-pointer">
                      <Compass className="w-4 h-4" />
                      {t("nav.stays")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Section Droite */}
            <div className="flex items-center gap-2 xl:gap-3">
              <Link to="/subscriptions">
                <Button variant="outline" size="sm" className="text-xs border-secondary text-secondary hover:bg-secondary hover:text-primary whitespace-nowrap px-3">
                  <Crown className="w-3 h-3 mr-1" />
                  {t("nav.subscriptions")}
                </Button>
              </Link>
              
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-white hover:bg-white/10 whitespace-nowrap px-2">
                      <UserCircle2 className="w-4 h-4" />
                      {t("nav.myAccount")}
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
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-white hover:bg-white/10 whitespace-nowrap px-2">
                    <User className="w-4 h-4" />
                    {t("nav.login")}
                  </Button>
                </Link>
              )}

              <Link to="/support" className="text-white hover:text-secondary transition-smooth text-xs font-medium whitespace-nowrap px-2 py-1 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                {t("nav.support")}
              </Link>
              
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-secondary transition-smooth"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-primary-light animate-fade-in">
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
