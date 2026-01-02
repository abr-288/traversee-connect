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
    <section ref={sectionRef} className="relative min-h-[480px] sm:min-h-[550px] md:min-h-[700px] flex items-center pt-16 sm:pt-20 overflow-hidden w-full">
      {/* Background Image Carousel with Parallax Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
            style={{
              transform: `translateY(${scrollY}px) scale(1.1)`,
              willChange: 'transform'
            }}
          >
            <img
              src={slide}
              alt={`Travel destination ${index + 1}`}
              className="w-full h-full object-cover brightness-110 contrast-105"
            />
          </div>
        ))}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        
        {/* Animated particles/shapes - Hidden on mobile */}
        <div className="hidden sm:block absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="hidden sm:block absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="site-container relative z-10 py-4 sm:py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-4 sm:mb-8 md:mb-14 px-2">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-2 sm:mb-3 md:mb-6 animate-slide-up-fade drop-shadow-2xl leading-tight" style={{ animationDelay: '0.1s' }}>
            {config.hero.title || t('hero.title')}
          </h1>
          <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/95 mb-4 sm:mb-6 md:mb-10 font-normal animate-slide-up-fade drop-shadow-lg leading-relaxed" style={{ animationDelay: '0.3s' }}>
            {config.hero.subtitle || t('hero.subtitle')}
          </p>
          
          {/* Decorative elements - Smaller on mobile */}
          <div className="flex justify-center gap-1.5 sm:gap-2 animate-slide-up-fade" style={{ animationDelay: '0.5s' }}>
            <div className="w-12 sm:w-20 h-0.5 sm:h-1 bg-secondary rounded-full" />
            <div className="w-1 h-1 bg-secondary rounded-full mt-0 hidden sm:block" />
            <div className="w-1 h-1 bg-secondary rounded-full mt-0 hidden sm:block" />
          </div>
        </div>

        {/* Search Card - Avec système UnifiedForm */}
        <div className="max-w-6xl mx-auto glass rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden animate-scale-in border border-white/20 sm:border-2 hover-lift" style={{ animationDelay: '0.6s' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tabs - Horizontal scroll on mobile */}
            <TabsList className="w-full h-auto p-0 bg-background border-b flex justify-start overflow-x-auto rounded-none gap-0 scroll-snap-x">
              <TabsTrigger 
                value="flight" 
                className="gap-1 sm:gap-1.5 md:gap-2 py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0 scroll-snap-item min-w-fit"
              >
                <Plane className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{t('nav.flights')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hotel" 
                className="gap-1 sm:gap-1.5 md:gap-2 py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0 scroll-snap-item min-w-fit"
              >
                <Hotel className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{t('nav.hotels')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flight-hotel" 
                className="gap-1 sm:gap-1.5 md:gap-2 py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0 scroll-snap-item min-w-fit"
              >
                <Plane className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                <Hotel className="w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{t('nav.flightHotel')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="car" 
                className="gap-1 sm:gap-1.5 md:gap-2 py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0 scroll-snap-item min-w-fit"
              >
                <Car className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span className="text-xs sm:text-sm md:text-base whitespace-nowrap">{t('nav.carRental')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Formulaires avec UnifiedForm - Padding réduit sur mobile */}
            <TabsContent value="flight" className="p-3 sm:p-4 md:p-6">
              <FlightSearchForm />
            </TabsContent>

            <TabsContent value="hotel" className="p-3 sm:p-4 md:p-6">
              <HotelSearchForm />
            </TabsContent>

            <TabsContent value="flight-hotel" className="p-3 sm:p-4 md:p-6">
              <FlightHotelSearchForm 
                onSearch={(params) => {
                  // Navigation handled by the form
                }}
              />
            </TabsContent>

            <TabsContent value="car" className="p-3 sm:p-4 md:p-6">
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