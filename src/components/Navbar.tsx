import { useState, useEffect, useRef } from "react";
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
  MapPin, Compass, ArrowRight, Sparkles, Grid3X3
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

// Import banner images for mega menu
import bannerFlights from "@/assets/banner-flights.jpg";
import bannerHotels from "@/assets/banner-hotels.jpg";
import bannerCars from "@/assets/banner-cars.jpg";
import bannerFlightHotel from "@/assets/banner-flight-hotel.jpg";
import bannerTrains from "@/assets/banner-trains.jpg";
import bannerEvents from "@/assets/banner-events.jpg";
import bannerTours from "@/assets/banner-tours.jpg";
import bannerStays from "@/assets/banner-stays.jpg";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { isInstallable, isInstalled, install } = usePWA();
  const { config } = useSiteConfigContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Mega menu categories with images
  const megaMenuCategories = [
    { 
      to: "/flights", 
      icon: Plane, 
      label: t("nav.flights"),
      description: "Trouvez les meilleurs tarifs",
      image: bannerFlights,
      color: "from-blue-500 to-blue-600"
    },
    { 
      to: "/hotels", 
      icon: Hotel, 
      label: t("nav.hotels"),
      description: "Hôtels du monde entier",
      image: bannerHotels,
      color: "from-amber-500 to-orange-500"
    },
    { 
      to: "/flight-hotel", 
      icon: PlaneTakeoff, 
      label: t("nav.flightHotel"),
      description: "Économisez sur les packs",
      image: bannerFlightHotel,
      color: "from-purple-500 to-pink-500"
    },
    { 
      to: "/cars", 
      icon: Car, 
      label: t("nav.carRental"),
      description: "Location partout",
      image: bannerCars,
      color: "from-emerald-500 to-teal-500"
    },
    { 
      to: "/trains", 
      icon: Train, 
      label: t("nav.trains"),
      description: "Voyagez en train",
      image: bannerTrains,
      color: "from-red-500 to-rose-500"
    },
    { 
      to: "/events", 
      icon: Calendar, 
      label: t("nav.events"),
      description: "Concerts et spectacles",
      image: bannerEvents,
      color: "from-indigo-500 to-violet-500"
    },
    { 
      to: "/destinations", 
      icon: MapPin, 
      label: t("nav.destinations"),
      description: "Explorez le monde",
      image: bannerTours,
      color: "from-cyan-500 to-blue-500"
    },
    { 
      to: "/stays", 
      icon: Compass, 
      label: t("nav.stays"),
      description: "Séjours uniques",
      image: bannerStays,
      color: "from-fuchsia-500 to-purple-500"
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMegaMenuOpen(false);
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

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        megaMenuRef.current && 
        !megaMenuRef.current.contains(event.target as Node) &&
        megaMenuTriggerRef.current &&
        !megaMenuTriggerRef.current.contains(event.target as Node)
      ) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setIsMenuOpen(false);
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast.success(t("common.install") + " " + t("common.success"));
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg" 
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
                {/* Mega Menu Trigger */}
                <button
                  ref={megaMenuTriggerRef}
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    isMegaMenuOpen
                      ? isScrolled
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-white text-primary shadow-md"
                      : isScrolled
                        ? "text-foreground hover:bg-muted"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>Nos Services</span>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-transform duration-300",
                    isMegaMenuOpen && "rotate-180"
                  )} />
                </button>

                {/* Quick Links */}
                {[
                  { to: "/flights", label: t("nav.flights") },
                  { to: "/hotels", label: t("nav.hotels") },
                  { to: "/flight-hotel", label: t("nav.flightHotel") },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive(to)
                        ? isScrolled
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-white text-primary shadow-md"
                        : isScrolled
                          ? "text-foreground hover:bg-muted"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {label}
                  </Link>
                ))}
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
                    className="w-56 p-2 bg-background border-border shadow-xl rounded-xl z-50"
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

        {/* Mega Menu Desktop */}
        <AnimatePresence>
          {isMegaMenuOpen && (
            <motion.div
              ref={megaMenuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block absolute top-full left-0 right-0 bg-background border-b border-border shadow-2xl z-40"
            >
              <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-4 gap-4">
                  {megaMenuCategories.map((category, index) => (
                    <motion.div
                      key={category.to}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={category.to}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="group block relative overflow-hidden rounded-2xl bg-muted/50 hover:bg-muted transition-all duration-300 hover:shadow-lg"
                      >
                        {/* Image Background */}
                        <div className="relative h-32 overflow-hidden">
                          <img 
                            src={category.image} 
                            alt={category.label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-t opacity-80",
                            category.color
                          )} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Icon Badge */}
                          <div className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <category.icon className="w-5 h-5 text-white" />
                          </div>
                          
                          {/* Active Indicator */}
                          {isActive(category.to) && (
                            <div className="absolute top-3 right-3 w-2 h-2 bg-secondary rounded-full animate-pulse" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {category.label}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </p>
                          
                          {/* Arrow */}
                          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Explorer</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom Banner */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 bg-gradient-to-r from-primary via-primary-light to-secondary rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Passez à Premium</h4>
                      <p className="text-sm text-white/80">Économisez jusqu'à 30% sur tous vos voyages</p>
                    </div>
                  </div>
                  <Link to="/subscriptions" onClick={() => setIsMegaMenuOpen(false)}>
                    <Button className="bg-white text-primary hover:bg-white/90 rounded-full px-6">
                      Découvrir
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

                {/* Services Grid with Images */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    Nos Services
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {megaMenuCategories.map(({ to, icon: Icon, label, image, color }, index) => (
                      <motion.div
                        key={to}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link
                          to={to}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "relative flex flex-col overflow-hidden rounded-xl transition-all duration-200",
                            isActive(to) 
                              ? "ring-2 ring-primary shadow-lg" 
                              : "hover:shadow-md"
                          )}
                        >
                          {/* Image */}
                          <div className="relative h-20">
                            <img 
                              src={image} 
                              alt={label}
                              className="w-full h-full object-cover"
                            />
                            <div className={cn(
                              "absolute inset-0 bg-gradient-to-br opacity-75",
                              color
                            )} />
                            <div className="absolute inset-0 bg-black/20" />
                            
                            {/* Icon */}
                            <div className="absolute top-2 left-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          
                          {/* Label */}
                          <div className="p-2.5 bg-card">
                            <span className="text-sm font-medium text-foreground">{label}</span>
                          </div>
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
