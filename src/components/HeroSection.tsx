import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, Car, Plane } from "lucide-react";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import heroSlide5 from "@/assets/hero-slide-5.jpg";
import { FlightSearchForm } from "./FlightSearchForm";
import { HotelSearchForm } from "./HotelSearchForm";
import { FlightHotelSearchForm } from "./FlightHotelSearchForm";
import { CarSearchForm } from "./CarSearchForm";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

const DEFAULT_SLIDES = [heroSlide1, heroSlide2, heroSlide3, heroSlide4, heroSlide5];

/**
 * HeroSection - Section héro premium avec recherche unifiée
 * Design Opodo/Booking avec système UnifiedForm et effet parallax
 * Optimisé pour mobile
 */
const HeroSection = () => {
  const { t } = useTranslation();
  const { config } = useSiteConfigContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("flight");
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Use dynamic slides from config or fallback to defaults
  const heroSlides = useMemo(() => {
    if (config.hero.slides && config.hero.slides.length > 0) {
      return config.hero.slides.map(slide => slide.image);
    }
    return DEFAULT_SLIDES;
  }, [config.hero.slides]);

  // Parallax scroll effect - disabled on mobile for performance
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current && window.innerWidth > 768) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.4);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <section ref={sectionRef} className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[380px] flex items-center overflow-hidden w-full">
      {/* Background Image Carousel with Parallax Effect - GPU Optimized */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate3d(0, ${scrollY}px, 0) scale(1.1)`,
              willChange: index === currentSlide ? 'transform, opacity' : 'auto',
              backfaceVisibility: 'hidden',
              perspective: 1000,
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <img
              src={slide}
              alt={`Travel destination ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {/* Modern dark overlay with gradient - GPU accelerated */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/80"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/60 via-transparent to-primary/60"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        />
        
        {/* Animated particles/shapes - Hidden on mobile, GPU optimized */}
        <div 
          className="hidden sm:block absolute top-10 left-10 w-60 h-60 bg-secondary/20 rounded-full blur-[80px] animate-float-gpu" 
          style={{ animationDelay: '0s', transform: 'translate3d(0, 0, 0)' }} 
        />
        <div 
          className="hidden sm:block absolute bottom-10 right-10 w-72 h-72 bg-secondary/15 rounded-full blur-[100px] animate-float-gpu" 
          style={{ animationDelay: '1s', transform: 'translate3d(0, 0, 0)' }} 
        />
      </div>

      {/* Content */}
      <div className="site-container relative z-10 py-3 sm:py-4 md:py-6">
        <div className="max-w-3xl mx-auto text-center mb-3 sm:mb-4 md:mb-5 px-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-2 sm:mb-3 animate-slide-up-fade" style={{ animationDelay: '0s' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-white/90 text-[10px] sm:text-xs font-medium">{t('hero.badge', 'Votre voyage commence ici')}</span>
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 sm:mb-2 md:mb-3 animate-slide-up-fade drop-shadow-2xl leading-tight tracking-tight" style={{ animationDelay: '0.1s' }}>
            {config.hero.title || t('hero.title')}
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 mb-2 sm:mb-3 md:mb-4 font-light animate-slide-up-fade drop-shadow-lg leading-relaxed max-w-2xl mx-auto" style={{ animationDelay: '0.3s' }}>
            {config.hero.subtitle || t('hero.subtitle')}
          </p>
        </div>

        {/* Search Card - Compact */}
        <div className="max-w-5xl mx-auto bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl overflow-hidden animate-scale-in border border-white/30" style={{ animationDelay: '0.4s' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tabs - Compact */}
            <TabsList className="w-full h-auto p-0 bg-background border-b flex justify-start overflow-x-auto rounded-none gap-0 scroll-snap-x">
              <TabsTrigger 
                value="flight" 
                className="gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3 md:px-4 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0 scroll-snap-item min-w-fit"
              >
                <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[11px] sm:text-xs md:text-sm whitespace-nowrap">{t('nav.flights')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hotel" 
                className="gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3 md:px-4 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0 scroll-snap-item min-w-fit"
              >
                <Hotel className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[11px] sm:text-xs md:text-sm whitespace-nowrap">{t('nav.hotels')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flight-hotel" 
                className="gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3 md:px-4 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0 scroll-snap-item min-w-fit"
              >
                <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <Hotel className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-[11px] sm:text-xs md:text-sm whitespace-nowrap">{t('nav.flightHotel')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="car" 
                className="gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2.5 sm:px-3 md:px-4 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0 scroll-snap-item min-w-fit"
              >
                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[11px] sm:text-xs md:text-sm whitespace-nowrap">{t('nav.carRental')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Formulaires compacts */}
            <TabsContent value="flight" className="p-2.5 sm:p-3 md:p-4">
              <FlightSearchForm />
            </TabsContent>

            <TabsContent value="hotel" className="p-2.5 sm:p-3 md:p-4">
              <HotelSearchForm />
            </TabsContent>

            <TabsContent value="flight-hotel" className="p-2.5 sm:p-3 md:p-4">
              <FlightHotelSearchForm 
                onSearch={(params) => {
                  // Navigation handled by the form
                }}
              />
            </TabsContent>

            <TabsContent value="car" className="p-2.5 sm:p-3 md:p-4">
              <CarSearchForm />
            </TabsContent>
          </Tabs>
        </div>

        {/* Slide indicators - Mobile optimized */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-6 sm:w-8 bg-secondary' 
                  : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;