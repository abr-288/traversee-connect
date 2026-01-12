import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

import DarkModeToggle from "./DarkModeToggle";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { isInstallable, isInstalled, install } = usePWA();
  const { config } = useSiteConfigContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  const navLinkClass = (path: string) => 
    `relative transition-smooth text-xs xl:text-sm font-medium whitespace-nowrap px-2 py-1 ${
      isActive(path) 
        ? 'text-secondary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4/5 after:h-0.5 after:bg-secondary after:rounded-full' 
        : 'text-white hover:text-secondary'
    }`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

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
    setIsMenuOpen(false);
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast.success(t("common.install") + " " + t("common.success"));
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary-light w-full transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      <div className="w-full px-3 sm:px-4 xl:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16'}`}>
          {/* Logo - Plus compact sur mobile */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
            <img 
              src={config.branding.logoLight || logoLight} 
              alt={`${config.branding.siteName} Logo`} 
              className={`transition-all duration-300 ${isScrolled ? 'h-8 sm:h-10' : 'h-10 sm:h-14 lg:h-16'} w-auto`} 
            />
            <span className={`font-bold text-white transition-all duration-300 hidden xs:inline ${isScrolled ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
              {config.branding.siteName}
            </span>
          </Link>

          <div className="hidden lg:flex items-center flex-1 justify-between ml-6">
            {/* Navigation Principale - Gauche */}
            <div className="flex items-center gap-1 xl:gap-2">
              <Link to="/flights" className={navLinkClass('/flights')}>
                {t("nav.flights")}
              </Link>
              <Link to="/hotels" className={navLinkClass('/hotels')}>
                {t("nav.hotels")}
              </Link>
              <Link to="/flight-hotel" className={navLinkClass('/flight-hotel')}>
                {t("nav.flightHotel")}
              </Link>
              <Link to="/cars" className={navLinkClass('/cars')}>
                {t("nav.carRental")}
              </Link>
              
              {/* Dropdown Autres */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`relative transition-smooth text-xs xl:text-sm font-medium whitespace-nowrap px-2 py-1 flex items-center gap-1 ${
                    isActive('/trains') || isActive('/events') || isActive('/destinations') || isActive('/stays')
                      ? 'text-secondary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4/5 after:h-0.5 after:bg-secondary after:rounded-full'
                      : 'text-white hover:text-secondary'
                  }`}>
                    {t("nav.others")}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-background border-border z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/trains" className={`flex items-center gap-2 cursor-pointer ${isActive('/trains') ? 'text-secondary' : ''}`}>
                      <Train className="w-4 h-4" />
                      {t("nav.trains")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/events" className={`flex items-center gap-2 cursor-pointer ${isActive('/events') ? 'text-secondary' : ''}`}>
                      <Calendar className="w-4 h-4" />
                      {t("nav.events")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/destinations" className={`flex items-center gap-2 cursor-pointer ${isActive('/destinations') ? 'text-secondary' : ''}`}>
                      <MapPin className="w-4 h-4" />
                      {t("nav.destinations")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/stays" className={`flex items-center gap-2 cursor-pointer ${isActive('/stays') ? 'text-secondary' : ''}`}>
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

              <Link to="/support" className={`${navLinkClass('/support')} flex items-center gap-1.5`}>
                <HelpCircle className="w-4 h-4" />
                {t("nav.support")}
              </Link>
              
              <DarkModeToggle variant="compact" className="text-white hover:bg-white/10" />
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button - Plus grand pour touch */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 -mr-2 text-white hover:text-secondary transition-smooth touch-target"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Fullscreen overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 sm:top-16 bg-primary z-50 overflow-y-auto safe-area-bottom animate-fade-in">
          <div className="flex flex-col pb-20">
            {/* Section Compte - EN PREMIER pour être visible */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {isLoggedIn ? t("nav.myAccount") : t("nav.login")}
              </p>
            </div>

            <div className="flex flex-col gap-2 px-4 pb-4">
              {isLoggedIn ? (
                <>
                  <Link to="/account" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full h-12 gap-3 text-base bg-secondary hover:bg-secondary/90 text-primary justify-start">
                      <UserCircle2 className="w-5 h-5" />
                      {t("nav.profile")}
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-12 gap-3 text-base text-white border-white/20 hover:bg-white/10 justify-start">
                      <LayoutDashboard className="w-5 h-5" />
                      {t("nav.dashboard")}
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-12 gap-3 text-base text-white border-white/20 hover:bg-white/10 justify-start">
                        <LayoutDashboard className="w-5 h-5" />
                        {t("nav.admin")}
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline"
                    className="w-full h-12 gap-3 text-base text-destructive border-destructive/30 hover:bg-destructive/10 justify-start" 
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-14 gap-3 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-primary justify-center">
                    <User className="w-6 h-6" />
                    {t("nav.login")} / {t("nav.register")}
                  </Button>
                </Link>
              )}
            </div>

            {/* Séparateur */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-4" />

            {/* Section Navigation */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Navigation
              </p>
            </div>
            
            <div className="flex flex-col px-3">
              {[
                { to: "/flights", icon: Plane, label: t("nav.flights") },
                { to: "/hotels", icon: Hotel, label: t("nav.hotels") },
                { to: "/flight-hotel", icon: PlaneTakeoff, label: t("nav.flightHotel") },
                { to: "/cars", icon: Car, label: t("nav.carRental") },
                { to: "/trains", icon: Train, label: t("nav.trains") },
                { to: "/events", icon: Calendar, label: t("nav.events") },
                { to: "/destinations", icon: MapPin, label: t("nav.destinations") },
                { to: "/stays", icon: Compass, label: t("nav.stays") },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 touch-target ${
                    isActive(to) 
                      ? 'bg-white/10 text-secondary' 
                      : 'text-white hover:bg-white/5 active:bg-white/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive(to) ? 'text-secondary' : 'text-white/70'}`} />
                  <span className="text-base font-medium">{label}</span>
                </Link>
              ))}
              
              {/* Subscriptions - Highlighted */}
              <Link
                to="/subscriptions"
                className="flex items-center gap-4 px-4 py-3 rounded-xl bg-secondary/10 border border-secondary/30 mt-2 touch-target"
                onClick={() => setIsMenuOpen(false)}
              >
                <Crown className="w-5 h-5 text-secondary" />
                <span className="text-base font-semibold text-secondary">{t("nav.subscriptions")}</span>
              </Link>
            </div>

            {/* Séparateur */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3 mx-4" />

            {/* Support */}
            <div className="px-3">
              <Link
                to="/support"
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200 touch-target"
                onClick={() => setIsMenuOpen(false)}
              >
                <HelpCircle className="w-5 h-5 text-white/70" />
                <span className="text-base font-medium">{t("nav.support")}</span>
              </Link>
            </div>

            {/* Séparateur */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3 mx-4" />

            {/* Section Préférences */}
            <div className="px-4 pb-2">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {t("common.preferences") || "Préférences"}
              </p>
            </div>
            
            <div className="flex items-center justify-between gap-4 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/90">{t("common.toggleTheme")}</span>
                <DarkModeToggle className="text-white" />
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;