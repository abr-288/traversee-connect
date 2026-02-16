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
import { 
  Menu, X, User, LogOut, LayoutDashboard, Plane, Hotel, PlaneTakeoff, 
  Train, Calendar, Car, HelpCircle, UserCircle2, Crown, 
  MapPin, Compass, ChevronDown, Sparkles
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  const isActive = (path: string) => location.pathname === path;

  const serviceLinks = [
    { to: "/flights", icon: Plane, label: t("nav.flights") },
    { to: "/hotels", icon: Hotel, label: t("nav.hotels") },
    { to: "/flight-hotel", icon: PlaneTakeoff, label: t("nav.flightHotel") },
    { to: "/cars", icon: Car, label: t("nav.carRental") },
    { to: "/trains", icon: Train, label: t("nav.trains") },
    { to: "/events", icon: Calendar, label: t("nav.events") },
    { to: "/destinations", icon: MapPin, label: t("nav.destinations") },
    { to: "/stays", icon: Compass, label: t("nav.stays") },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled
        ? "shadow-lg"
        : ""
    )}>
      {/* Top Bar */}
      <div className={cn(
        "transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border"
          : "bg-primary"
      )}>
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img
                src={isScrolled ? logoDark : (config.branding.logoLight || logoLight)}
                alt={`${config.branding.siteName} Logo`}
                className="h-10 w-auto"
              />
              <span className={cn(
                "font-bold text-lg hidden sm:inline transition-colors duration-300",
                isScrolled ? "text-foreground" : "text-white"
              )}>
                {config.branding.siteName}
              </span>
            </Link>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Premium */}
              <Link to="/subscriptions">
                <Button
                  size="sm"
                  className={cn(
                    "gap-2 rounded-md font-medium transition-all duration-300",
                    isScrolled
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      : "bg-white/15 text-white border border-white/25 hover:bg-white/25"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  {t("nav.subscriptions")}
                </Button>
              </Link>

              {/* Support */}
              <Link
                to="/support"
                className={cn(
                  "p-2 rounded-md transition-colors",
                  isScrolled
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <HelpCircle className="w-5 h-5" />
              </Link>

              {/* Account */}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-2 rounded-md",
                        isScrolled
                          ? "text-foreground hover:bg-muted"
                          : "text-white hover:bg-white/10"
                      )}
                    >
                      <UserCircle2 className="w-5 h-5" />
                      <span className="hidden xl:inline">{t("nav.myAccount")}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 z-50">
                    <DropdownMenuLabel>{t("nav.myAccount")}</DropdownMenuLabel>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 rounded-md",
                      isScrolled
                        ? "text-foreground hover:bg-muted"
                        : "text-white hover:bg-white/10"
                    )}
                  >
                    <User className="w-4 h-4" />
                    {t("nav.login")}
                  </Button>
                </Link>
              )}

              {/* Theme & Language */}
              <div className="flex items-center gap-1 pl-2 border-l border-border/30">
                <DarkModeToggle
                  variant="compact"
                  className={isScrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}
                />
                <LanguageSwitcher />
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden flex items-center gap-2">
              <DarkModeToggle
                variant="compact"
                className={isScrolled ? "text-foreground" : "text-white"}
              />
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      isScrolled
                        ? "text-foreground hover:bg-muted"
                        : "text-white hover:bg-white/10"
                    )}
                    aria-label="Menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0 overflow-y-auto">
                  <SheetHeader className="p-4 border-b border-border">
                    <SheetTitle className="text-left">{config.branding.siteName}</SheetTitle>
                  </SheetHeader>

                  <div className="p-4 space-y-6">
                    {/* Auth Section */}
                    {isLoggedIn ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("nav.myAccount")}
                        </p>
                        <Link to="/account" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors">
                          <UserCircle2 className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{t("nav.profile")}</span>
                        </Link>
                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors">
                          <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{t("nav.dashboard")}</span>
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors">
                            <LayoutDashboard className="w-5 h-5 text-primary" />
                            <span className="font-medium text-primary">{t("nav.admin")}</span>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full gap-2">
                          <User className="w-4 h-4" />
                          {t("nav.login")} / {t("nav.register")}
                        </Button>
                      </Link>
                    )}

                    {/* Services */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Nos Services
                      </p>
                      {serviceLinks.map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md transition-colors",
                            isActive(to)
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Premium */}
                    <Link to="/subscriptions" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary text-primary-foreground">
                        <Crown className="w-5 h-5" />
                        <div>
                          <p className="font-semibold">{t("nav.subscriptions")}</p>
                          <p className="text-xs opacity-80">Avantages exclusifs</p>
                        </div>
                      </div>
                    </Link>

                    {/* Support */}
                    <Link to="/support" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors">
                      <HelpCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{t("nav.support")}</span>
                    </Link>

                    {/* Language */}
                    <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <span className="text-sm font-medium">Langue</span>
                      <LanguageSwitcher />
                    </div>

                    {/* Logout */}
                    {isLoggedIn && (
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        {t("nav.logout")}
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Second Level: Service Links (Desktop only) */}
      <div className={cn(
        "hidden lg:block transition-all duration-300 border-b",
        isScrolled
          ? "bg-muted/80 backdrop-blur-md border-border"
          : "bg-primary-dark/60 backdrop-blur-sm border-white/10"
      )}>
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-1 h-10 overflow-x-auto">
            {serviceLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200",
                  isActive(to)
                    ? isScrolled
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/20 text-white"
                    : isScrolled
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                      : "text-white/75 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
