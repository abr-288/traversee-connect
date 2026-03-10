import { useState, useEffect, useMemo } from "react";
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
 * HeroSection - Clean, modern hero inspired by Upjunoo
 * Prominent search card with subtle background
 */
const HeroSection = () => {
  const { t } = useTranslation();
  const { config } = useSiteConfigContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("flight");

  const heroSlides = useMemo(() => {
    if (config.hero.slides && config.hero.slides.length > 0) {
      return config.hero.slides.map(slide => slide.image);
    }
    return DEFAULT_SLIDES;
  }, [config.hero.slides]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background - Compact with image */}
      <div className="relative h-[200px] sm:h-[240px] md:h-[280px]">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide}
              alt={`Travel destination ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        {/* Clean gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/40 to-background" />
        
        {/* Hero text */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg leading-tight">
            {config.hero.title || t('hero.title')}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-white/90 max-w-xl drop-shadow">
            {config.hero.subtitle || t('hero.subtitle')}
          </p>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-6 bg-secondary' 
                  : 'w-1.5 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Search Card - Floating over the background transition */}
      <div className="site-container relative z-20 -mt-10 sm:-mt-12 md:-mt-14 pb-4">
        <div className="max-w-4xl mx-auto bg-card rounded-xl sm:rounded-2xl shadow-lg border border-border overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto p-0 bg-muted/50 flex justify-start overflow-x-auto rounded-none gap-0 scroll-snap-x border-b border-border">
              <TabsTrigger 
                value="flight" 
                className="gap-1.5 py-2.5 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-background data-[state=active]:text-secondary flex-shrink-0 scroll-snap-item text-sm font-medium"
              >
                <Plane className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('nav.flights')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hotel" 
                className="gap-1.5 py-2.5 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-background data-[state=active]:text-secondary flex-shrink-0 scroll-snap-item text-sm font-medium"
              >
                <Hotel className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('nav.hotels')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flight-hotel" 
                className="gap-1.5 py-2.5 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-background data-[state=active]:text-secondary flex-shrink-0 scroll-snap-item text-sm font-medium"
              >
                <Plane className="w-3.5 h-3.5" />
                <Hotel className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{t('nav.flightHotel')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="car" 
                className="gap-1.5 py-2.5 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-background data-[state=active]:text-secondary flex-shrink-0 scroll-snap-item text-sm font-medium"
              >
                <Car className="w-4 h-4" />
                <span className="whitespace-nowrap">{t('nav.carRental')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flight" className="p-3 md:p-5">
              <FlightSearchForm />
            </TabsContent>
            <TabsContent value="hotel" className="p-3 md:p-5">
              <HotelSearchForm />
            </TabsContent>
            <TabsContent value="flight-hotel" className="p-3 md:p-5">
              <FlightHotelSearchForm onSearch={() => {}} />
            </TabsContent>
            <TabsContent value="car" className="p-3 md:p-5">
              <CarSearchForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
