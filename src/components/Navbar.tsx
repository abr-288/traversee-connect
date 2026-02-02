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
  Train, Calendar, Car, HelpCircle, UserCircle2, Crown, ChevronDown, 
  MapPin, Compass, ArrowRight, Sparkles
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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  const mainNavItems = [
    { to: "/flights", icon: Plane, label: t("nav.flights") },
    { to: "/hotels", icon: Hotel, label: t("nav.hotels") },
    { to: "/flight-hotel", icon: PlaneTakeoff, label: t("nav.flightHotel") },
    { to: "/cars", icon: Car, label: t("nav.carRental") },
  ];

  const moreNavItems = [
    { to: "/trains", icon: Train, label: t("nav.trains") },
    { to: "/events", icon: Calendar, label: t("nav.events") },
    { to: "/destinations", icon: MapPin, label: t("nav.destinations") },
    { to: "/stays", icon: Compass, label: t("nav.stays") },
  ];

  const allNavItems = [...mainNavItems, ...moreNavItems];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg" 
            : "bg-gradient-to-b from-primary/95 to-primary/90 backdrop-blur-md"
        )}
      >
        {/* Decorative gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        
        <div className="w-full px-4 lg:px-6 xl:px-8">
          <div className={cn(
            "flex items-center justify-between transition-all duration-300",
            isScrolled ? "h-14" : "h-16"
          )}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <img 
                  src={isScrolled ? logoDark : (config.branding.logoLight || logoLight)} 
                  alt={`${config.branding.siteName} Logo`} 
                  className={cn(
                    "transition-all duration-300 w-auto",
                    isScrolled ? "h-9" : "h-11 lg:h-12"
                  )}
                />
              </motion.div>
              <span className={cn(
                "font-bold transition-all duration-300 hidden sm:inline",
                isScrolled 
                  ? "text-foreground text-lg" 
                  : "text-white text-xl"
              )}>
                {config.branding.siteName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <div className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-300",
                isScrolled 
                  ? "bg-muted/50" 
                  : "bg-white/10 backdrop-blur-sm"
              )}>
                {mainNavItems.map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive(to)
                        ? isScrolled
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-white text-primary shadow-md"
                        : isScrolled
                          ? "text-foreground hover:bg-muted"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                ))}
                
                {/* More Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      moreNavItems.some(item => isActive(item.to))
                        ? isScrolled
                          ? "bg-primary text-primary-foreground"
                          : "bg-white text-primary"
                        : isScrolled
                          ? "text-foreground hover:bg-muted"
                          : "text-white/90 hover:bg-white/10"
                    )}>
                      {t("nav.others")}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="center" 
                    className="w-56 p-2 bg-background/95 backdrop-blur-xl border-border shadow-xl rounded-xl"
                  >
                    {moreNavItems.map(({ to, icon: Icon, label }) => (
                      <DropdownMenuItem key={to} asChild>
                        <Link 
                          to={to} 
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                            isActive(to) 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-muted"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg",
                            isActive(to) ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{label}</span>
                          <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Prime Button */}
              <Link to="/subscriptions">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="sm" 
                    className={cn(
                      "gap-2 font-semibold rounded-full px-4 transition-all duration-300",
                      isScrolled
                        ? "bg-gradient-to-r from-secondary to-accent-green text-primary hover:shadow-lg hover:shadow-secondary/25"
                        : "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30"
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    {t("nav.subscriptions")}
                  </Button>
                </motion.div>
              </Link>
              
              {/* Account Menu */}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "gap-2 rounded-full px-3",
                        isScrolled 
                          ? "text-foreground hover:bg-muted" 
                          : "text-white hover:bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-full",
                        isScrolled ? "bg-primary/10" : "bg-white/20"
                      )}>
                        <UserCircle2 className="w-4 h-4" />
                      </div>
                      <span className="hidden xl:inline">{t("nav.myAccount")}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 p-2 bg-background/95 backdrop-blur-xl border-border shadow-xl rounded-xl"
                  >
                    <DropdownMenuLabel className="px-3 py-2">
                      {t("nav.myAccount")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer">
                          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{t("nav.admin")}</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer">
                        <div className="p-2 rounded-lg bg-muted">
                          <UserCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{t("nav.profile")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer">
                        <div className="p-2 rounded-lg bg-muted">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{t("nav.dashboard")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive"
                    >
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{t("nav.logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "gap-2 rounded-full px-4",
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

              {/* Support */}
              <Link 
                to="/support" 
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  isScrolled 
                    ? "text-foreground hover:bg-muted" 
                    : "text-white hover:bg-white/10"
                )}
              >
                <HelpCircle className="w-5 h-5" />
              </Link>
              
              {/* Theme & Language */}
              <div className="flex items-center gap-1 pl-2 border-l border-border/50">
                <DarkModeToggle 
                  variant="compact" 
                  className={isScrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"} 
                />
                <LanguageSwitcher />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "lg:hidden p-2.5 rounded-xl transition-all duration-300",
                isScrolled 
                  ? "text-foreground hover:bg-muted" 
                  : "text-white hover:bg-white/10"
              )}
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 z-40 pt-14"
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative h-full overflow-y-auto pb-20"
            >
              <div className="p-4 space-y-6">
                {/* Account Section */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    {isLoggedIn ? t("nav.myAccount") : t("nav.login")}
                  </p>
                  
                  {isLoggedIn ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/account" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full h-12 gap-2 bg-primary hover:bg-primary-light text-primary-foreground rounded-xl">
                          <UserCircle2 className="w-5 h-5" />
                          {t("nav.profile")}
                        </Button>
                      </Link>
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full h-12 gap-2 rounded-xl">
                          <LayoutDashboard className="w-5 h-5" />
                          {t("nav.dashboard")}
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="col-span-2">
                          <Button variant="outline" className="w-full h-12 gap-2 rounded-xl border-primary/30 text-primary">
                            <LayoutDashboard className="w-5 h-5" />
                            {t("nav.admin")}
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full h-14 gap-3 text-lg font-semibold bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-xl shadow-lg">
                        <User className="w-6 h-6" />
                        {t("nav.login")} / {t("nav.register")}
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Navigation Grid */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    Navigation
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {allNavItems.map(({ to, icon: Icon, label }, index) => (
                      <motion.div
                        key={to}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={to}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200",
                            isActive(to) 
                              ? "bg-primary text-primary-foreground shadow-lg" 
                              : "bg-muted/50 hover:bg-muted text-foreground"
                          )}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium text-center">{label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Premium CTA */}
                <Link to="/subscriptions" onClick={() => setIsMenuOpen(false)}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-light to-secondary p-5 shadow-xl"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Crown className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{t("nav.subscriptions")}</h3>
                        <p className="text-sm text-white/80">Accédez aux avantages exclusifs</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                </Link>

                {/* Support & Settings */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    {t("common.preferences") || "Préférences"}
                  </p>
                  
                  <div className="space-y-2">
                    <Link
                      to="/support"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all"
                    >
                      <div className="p-2 rounded-lg bg-background">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{t("nav.support")}</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </Link>
                    
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{t("common.toggleTheme")}</span>
                      </div>
                      <DarkModeToggle />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <span className="text-sm font-medium">Langue</span>
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>

                {/* Logout */}
                {isLoggedIn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button 
                      variant="outline"
                      className="w-full h-12 gap-3 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl" 
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5" />
                      {t("nav.logout")}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
