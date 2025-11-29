import { useState, useEffect } from "react";
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

const HERO_SLIDES = [heroSlide1, heroSlide2, heroSlide3, heroSlide4, heroSlide5];

/**
 * HeroSection - Section héro premium avec recherche unifiée
 * Design Opodo/Booking avec système UnifiedForm
 */
const HeroSection = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("flight");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[500px] md:min-h-[700px] flex items-center pt-16 md:pt-20 overflow-hidden">
      {/* Background Image Carousel with Overlay */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
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
        
        {/* Animated particles/shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-14">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-3 md:mb-6 animate-slide-up-fade drop-shadow-2xl" style={{ animationDelay: '0.1s' }}>
            {t('hero.title')}
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-white/95 mb-6 md:mb-10 font-normal animate-slide-up-fade drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
            {t('hero.subtitle')}
          </p>
          
          {/* Decorative elements */}
          <div className="flex justify-center gap-2 animate-slide-up-fade" style={{ animationDelay: '0.5s' }}>
            <div className="w-20 h-1 bg-secondary rounded-full" />
            <div className="w-1 h-1 bg-secondary rounded-full mt-0" />
            <div className="w-1 h-1 bg-secondary rounded-full mt-0" />
          </div>
        </div>

        {/* Search Card - Avec système UnifiedForm */}
        <div className="max-w-6xl mx-auto glass rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden animate-scale-in border-2 border-white/20 hover-lift" style={{ animationDelay: '0.6s' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-auto p-0 bg-background border-b flex justify-start overflow-x-auto rounded-none gap-0">
              <TabsTrigger 
                value="flight" 
                className="gap-1.5 md:gap-2 py-3 md:py-4 px-3 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0"
              >
                <Plane className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">{t('nav.flights')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hotel" 
                className="gap-1.5 md:gap-2 py-3 md:py-4 px-3 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0"
              >
                <Hotel className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">{t('nav.hotels')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flight-hotel" 
                className="gap-1.5 md:gap-2 py-3 md:py-4 px-3 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0"
              >
                <Plane className="w-3 h-3 md:w-4 md:h-4" />
                <Hotel className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-base">{t('nav.flightHotel')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="car" 
                className="gap-1.5 md:gap-2 py-3 md:py-4 px-3 md:px-6 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-secondary flex-shrink-0"
              >
                <Car className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-base">{t('nav.carRental')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Formulaires avec UnifiedForm */}
            <TabsContent value="flight" className="p-4 md:p-6">
              <FlightSearchForm />
            </TabsContent>

            <TabsContent value="hotel" className="p-4 md:p-6">
              <HotelSearchForm />
            </TabsContent>

            <TabsContent value="flight-hotel" className="p-4 md:p-6">
              <FlightHotelSearchForm 
                onSearch={(params) => {
                  // Navigation handled by the form
                }}
              />
            </TabsContent>

            <TabsContent value="car" className="p-4 md:p-6">
              <CarSearchForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
