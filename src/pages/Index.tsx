import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DestinationsSection from "@/components/DestinationsSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { AITravelAdvisor } from "@/components/AITravelAdvisor";
import { Boss } from "@/components/Boss";
import StatsSection from "@/components/StatsSection";
import FeaturedServices from "@/components/FeaturedServices";
import QuickSearch from "@/components/QuickSearch";
import SpecialOffers from "@/components/SpecialOffers";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <QuickSearch />
        <DestinationsSection />
        <FeaturedServices />
        <SpecialOffers />
        
        {/* AI Travel Advisor Section */}
        <section className="py-12 md:py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                {t("pages.index.aiTitle")}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg px-4">
                {t("pages.index.aiSubtitle")}
              </p>
            </div>
            <AITravelAdvisor />
          </div>
        </section>
        
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
      <Boss />
    </div>
  );
};

export default Index;
