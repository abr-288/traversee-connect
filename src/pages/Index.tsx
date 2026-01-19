import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DestinationsSection from "@/components/DestinationsSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { AITravelAdvisor } from "@/components/AITravelAdvisor";
import { Boss } from "@/components/Boss";
import FeaturedSubscriptions from "@/components/FeaturedSubscriptions";
import SpecialOffers from "@/components/SpecialOffers";
import { SeasonalSuggestions } from "@/components/SeasonalSuggestions";
import PromoBanner from "@/components/PromoBanner";
import { AdvertisementBanner } from "@/components/AdvertisementBanner";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        {/* Promo Banner - Sticky top */}
        <div className="pt-16">
          <PromoBanner />
        </div>
        
        {/* Hero - Full Bleed */}
        <HeroSection />
        
        {/* Advertisement Banner - Before Subscriptions */}
        <AdvertisementBanner />
        
        {/* Subscriptions Section - Full Bleed */}
        <FeaturedSubscriptions />
        
        {/* Seasonal Suggestions Section - Full Bleed with Container */}
        <section className="py-12 md:py-16 bg-muted/30 w-full">
          <div className="site-container">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                {t("pages.index.seasonalTitle", "Suggestions Saisonnières Intelligentes")}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                {t("pages.index.seasonalSubtitle", "Découvrez les meilleures périodes pour voyager selon la météo, les événements et la saisonnalité")}
              </p>
            </div>
            <SeasonalSuggestions />
          </div>
        </section>
        
        {/* Popular Destinations - Full Bleed */}
        <DestinationsSection />
        
        {/* Special Offers - Full Bleed */}
        <SpecialOffers />
        
        {/* AI Travel Advisor Section - Full Bleed with Container */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 w-full">
          <div className="site-container max-w-4xl">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                {t("pages.index.aiTitle")}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                {t("pages.index.aiSubtitle")}
              </p>
            </div>
            <AITravelAdvisor />
          </div>
        </section>
        
        {/* Features - Boxed */}
        <FeaturesSection />
        
        {/* Testimonials - Full Bleed */}
        <TestimonialsSection />
      </main>
      <Footer />
      <Boss />
    </div>
  );
};

export default Index;
